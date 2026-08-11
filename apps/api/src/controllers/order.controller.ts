import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { prisma } from '../config/db';
import { razorpay } from '../config/payments';
import { AuthRequest } from '../middlewares/auth';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { z } from 'zod';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { sendWhatsAppNotification, formatOrderWhatsAppMessage } from '../utils/whatsapp';

// Order schemas
const checkoutSchema = z.object({
  shippingAddressId: z.string().uuid(),
  billingAddressId: z.string().uuid(),
  couponCode: z.string().optional()
});

const verifyPaymentSchema = z.object({
  orderId: z.string().uuid(),
  razorpayPaymentId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpaySignature: z.string().min(1)
});

const updateStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus)
});

// 1. Checkout (Create order & Razorpay Order)
export async function checkout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { shippingAddressId, billingAddressId, couponCode } = checkoutSchema.parse(req.body);

    // Get cart items
    const cartItems = await prisma.cart.findMany({
      where: { userId },
      include: { product: true }
    });

    if (cartItems.length === 0) {
      throw new BadRequestError('Your cart is empty');
    }

    // Calculate sum
    let totalAmount = 0;
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        throw new BadRequestError(`Insufficient stock for product: ${item.product.name}`);
      }
      totalAmount += item.product.finalPrice * item.quantity;
    }

    // Handle coupon
    let discountAmount = 0;
    let validCoupon = null;
    if (couponCode) {
      validCoupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode,
          active: true,
          expiryDate: { gte: new Date() },
          minPurchaseAmount: { lte: totalAmount }
        }
      });

      if (!validCoupon) {
        throw new BadRequestError('Invalid or expired coupon code');
      }

      discountAmount = (totalAmount * validCoupon.discountPercent) / 100;
    }

    const payableAmount = Math.max(0, totalAmount - discountAmount);

    // Create order records in transaction
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create order
      const o = await tx.order.create({
        data: {
          userId,
          status: 'PENDING',
          totalAmount,
          discountAmount,
          payableAmount,
          couponCode: couponCode || null,
          shippingAddressId,
          billingAddressId,
          paymentStatus: 'PENDING',
          paymentMethod: 'CALL_VERIFICATION'
        }
      });

      // 2. Create order items
      await tx.orderItem.createMany({
        data: cartItems.map(item => ({
          orderId: o.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.finalPrice,
          size: item.size,
          color: item.color
        }))
      });

      // 3. Reduce product stock
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity }
          }
        });
      }

      // 4. Clear user cart
      await tx.cart.deleteMany({
        where: { userId }
      });

      // 5. Create in-app notification
      await tx.notification.create({
        data: {
          userId,
          title: 'Order Placed',
          message: `Your order #${o.id.substring(0, 8).toUpperCase()} has been placed. Our team will call you for order confirmation & payment.`
        }
      });

      return o;
    });

    // Fetch full order for WhatsApp notification & response
    const fullOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: { include: { product: true } },
        user: true,
        shippingAddress: true
      }
    });

    // Send instant WhatsApp notification to customer
    if (fullOrder && fullOrder.user.phone) {
      const msg = formatOrderWhatsAppMessage(fullOrder as any);
      sendWhatsAppNotification({
        to: fullOrder.user.phone,
        textMessage: msg
      }).catch(err => console.error('Failed to send instant order WhatsApp message:', err));
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully. Our team will call you for confirmation.',
      data: {
        order: fullOrder
      }
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return next(new BadRequestError(error.errors[0].message));
    }
    next(error);
  }
}

// 2. Verify Payment (Webhook or frontend callback)
export async function verifyPayment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = verifyPaymentSchema.parse(req.body);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        items: { include: { product: true } },
        user: true,
        shippingAddress: true
      }
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Verify signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'yourkeysecret';
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpaySignature;

    if (!isSignatureValid) {
      // Mark failed
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'FAILED',
          status: 'CANCELLED'
        }
      });
      throw new BadRequestError('Invalid signature verification. Payment untrusted.');
    }

    // Successful payment: update stock & status, clear cart in database transaction
    await prisma.$transaction(async (tx) => {
      // 1. Update order
      await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
          paymentId: razorpayPaymentId
        }
      });

      // 2. Reduce stock for products
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity }
          }
        });
      }

      // 3. Clear cart
      await tx.cart.deleteMany({
        where: { userId: order.userId }
      });

      // 4. Create Notification
      await tx.notification.create({
        data: {
          userId: order.userId,
          title: 'Order Confirmed',
          message: `Your payment was verified. Order #${orderId.substring(0, 8).toUpperCase()} is now being processed.`
        }
      });
    });

    // 5. Send Automatic WhatsApp Order Purchase Notification to Customer
    const recipientPhone = order.user.phone;
    if (recipientPhone) {
      const whatsappMessage = formatOrderWhatsAppMessage(order as any);
      sendWhatsAppNotification({
        to: recipientPhone,
        textMessage: whatsappMessage
      }).catch(err => console.error('WhatsApp order notification failed:', err));
    }

    res.json({
      success: true,
      message: 'Payment verified and order confirmed successfully'
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return next(new BadRequestError(error.errors[0].message));
    }
    next(error);
  }
}

// 3. Get customer orders
export async function getCustomerOrders(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { images: true }
            }
          }
        },
        shippingAddress: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
}

// 4. Get order details
export async function getOrderById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: { images: true }
            }
          }
        },
        shippingAddress: true,
        billingAddress: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Customer can only view their own order
    if (userRole !== 'ADMIN' && order.userId !== userId) {
      throw new BadRequestError('Access denied');
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
}

// 5. Admin: list all orders
export async function adminGetOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const orders = await prisma.order.findMany({
      include: {
        shippingAddress: true,
        billingAddress: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        items: {
          include: {
            product: {
              include: { images: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
}

// 6. Admin: update status
export async function adminUpdateOrderStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status } = updateStatusSchema.parse(req.body);

    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status }
    });

    // Create tracking notification for customer
    await prisma.notification.create({
      data: {
        userId: order.userId,
        title: `Order Status: ${status}`,
        message: `Your order #${id.substring(0, 8).toUpperCase()} is now ${status.toLowerCase()}.`
      }
    });

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: updated
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return next(new BadRequestError(error.errors[0].message));
    }
    next(error);
  }
}

// 7. Customer Addresses Methods
export async function getAddresses(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' }
    });

    res.json({ success: true, data: addresses });
  } catch (error) {
    next(error);
  }
}

const addressSchema = z.object({
  type: z.string().default('HOME'),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().default('India'),
  isDefault: z.boolean().default(false)
});

export async function createAddress(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const data = addressSchema.parse(req.body);

    // If isDefault is true, set all other user addresses to not default
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        ...data
      }
    });

    res.status(201).json({ success: true, data: address });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return next(new BadRequestError(error.errors[0].message));
    }
    next(error);
  }
}

export async function deleteAddress(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const address = await prisma.address.findFirst({
      where: { id, userId }
    });

    if (!address) {
      throw new NotFoundError('Address not found');
    }

    await prisma.address.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    next(error);
  }
}

// 8. Coupon helpers
export async function validateCoupon(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { code, amount } = req.body;
    if (!code || !amount) {
      throw new BadRequestError('Code and amount are required');
    }

    const coupon = await prisma.coupon.findFirst({
      where: {
        code,
        active: true,
        expiryDate: { gte: new Date() },
        minPurchaseAmount: { lte: parseFloat(amount) }
      }
    });

    if (!coupon) {
      throw new BadRequestError('Invalid, expired or under minimum purchase coupon code');
    }

    res.json({
      success: true,
      data: coupon
    });
  } catch (error) {
    next(error);
  }
}
