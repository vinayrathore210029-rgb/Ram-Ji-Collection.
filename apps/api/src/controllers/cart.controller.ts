import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middlewares/auth';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { z } from 'zod';

const cartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
  size: z.string().min(1),
  color: z.string().min(1)
});

export async function getCart(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;

    const cartItems = await prisma.cart.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: cartItems
    });
  } catch (error) {
    next(error);
  }
}

export async function addToCart(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const data = cartItemSchema.parse(req.body);

    const product = await prisma.product.findUnique({
      where: { id: data.productId }
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (product.stock < data.quantity) {
      throw new BadRequestError(`Insufficient stock. Only ${product.stock} items left.`);
    }

    // Check if item with same size/color already in cart
    const existing = await prisma.cart.findFirst({
      where: {
        userId,
        productId: data.productId,
        size: data.size,
        color: data.color
      }
    });

    let cartItem;
    if (existing) {
      const newQty = existing.quantity + data.quantity;
      if (product.stock < newQty) {
        throw new BadRequestError(`Insufficient stock. Total cart items would exceed stock limits.`);
      }

      cartItem = await prisma.cart.update({
        where: { id: existing.id },
        data: { quantity: newQty },
        include: { product: { include: { images: true } } }
      });
    } else {
      cartItem = await prisma.cart.create({
        data: {
          userId,
          productId: data.productId,
          quantity: data.quantity,
          size: data.size,
          color: data.color
        },
        include: { product: { include: { images: true } } }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Product added to cart',
      data: cartItem
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return next(new BadRequestError(error.errors[0].message));
    }
    next(error);
  }
}

export async function updateCartItem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      throw new BadRequestError('Quantity must be 1 or more');
    }

    const cartItem = await prisma.cart.findFirst({
      where: { id, userId },
      include: { product: true }
    });

    if (!cartItem) {
      throw new NotFoundError('Cart item not found');
    }

    if (cartItem.product.stock < quantity) {
      throw new BadRequestError(`Insufficient stock. Only ${cartItem.product.stock} items left.`);
    }

    const updated = await prisma.cart.update({
      where: { id },
      data: { quantity },
      include: { product: { include: { images: true } } }
    });

    res.json({
      success: true,
      message: 'Cart updated',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCartItem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const cartItem = await prisma.cart.findFirst({
      where: { id, userId }
    });

    if (!cartItem) {
      throw new NotFoundError('Cart item not found');
    }

    await prisma.cart.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    next(error);
  }
}

export async function clearCart(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;

    await prisma.cart.deleteMany({
      where: { userId }
    });

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    next(error);
  }
}
