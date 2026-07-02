import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { z } from 'zod';
import { uploadFile } from '../config/storage';

// Schema validations
const bannerSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  linkUrl: z.string().optional(),
  active: z.boolean().default(true),
  type: z.enum(['HERO', 'PROMO']).default('HERO')
});

const couponSchema = z.object({
  code: z.string().min(3),
  discountPercent: z.number().positive().max(100),
  expiryDate: z.string(), // ISO string
  minPurchaseAmount: z.number().nonnegative().default(0),
  active: z.boolean().default(true)
});

// 1. Dashboard Metrics
export async function getDashboardStats(req: Request, res: Response, next: NextFunction) {
  try {
    const totalProducts = await prisma.product.count();
    const totalCustomers = await prisma.user.count({ where: { role: 'CUSTOMER' } });

    // Paid orders sales sum and order count
    const paidOrders = await prisma.order.findMany({
      where: { paymentStatus: 'PAID' }
    });

    const totalOrdersCount = await prisma.order.count();
    const totalSales = paidOrders.reduce((sum, order) => sum + order.payableAmount, 0);

    // Sales by category chart data helper
    const categories = await prisma.category.findMany({
      include: {
        products: {
          include: {
            orderItems: {
              where: { order: { paymentStatus: 'PAID' } }
            }
          }
        }
      }
    });

    const salesByCategory = categories.map(cat => {
      let catSum = 0;
      cat.products.forEach(p => {
        p.orderItems.forEach(item => {
          catSum += item.price * item.quantity;
        });
      });
      return {
        categoryName: cat.name,
        sales: catSum
      };
    });

    // Recent orders (latest 5)
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalProducts,
          totalCustomers,
          totalOrders: totalOrdersCount,
          totalSales
        },
        salesByCategory,
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
}

// 2. Customers List
export async function getCustomers(req: Request, res: Response, next: NextFunction) {
  try {
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: customers
    });
  } catch (error) {
    next(error);
  }
}

// 3. Banner Operations
export async function getBanners(req: Request, res: Response, next: NextFunction) {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: banners });
  } catch (error) {
    next(error);
  }
}

export async function createBanner(req: Request, res: Response, next: NextFunction) {
  try {
    const bodyData = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;
    const data = bannerSchema.parse(bodyData);

    if (!req.file) {
      throw new BadRequestError('Banner image is required');
    }

    const imageUrl = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);

    const banner = await prisma.banner.create({
      data: {
        title: data.title,
        subtitle: data.subtitle || null,
        linkUrl: data.linkUrl || null,
        active: data.active,
        type: data.type,
        imageUrl
      }
    });

    res.status(201).json({ success: true, data: banner });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return next(new BadRequestError(error.errors[0].message));
    }
    next(error);
  }
}

export async function deleteBanner(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const banner = await prisma.banner.findUnique({
      where: { id }
    });

    if (!banner) {
      throw new NotFoundError('Banner not found');
    }

    await prisma.banner.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    next(error);
  }
}

// 4. Coupon Operations
export async function getCoupons(req: Request, res: Response, next: NextFunction) {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { expiryDate: 'asc' }
    });
    res.json({ success: true, data: coupons });
  } catch (error) {
    next(error);
  }
}

export async function createCoupon(req: Request, res: Response, next: NextFunction) {
  try {
    const data = couponSchema.parse(req.body);

    const existing = await prisma.coupon.findUnique({
      where: { code: data.code.toUpperCase() }
    });

    if (existing) {
      throw new BadRequestError('Coupon code already exists');
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        discountPercent: data.discountPercent,
        expiryDate: new Date(data.expiryDate),
        minPurchaseAmount: data.minPurchaseAmount,
        active: data.active
      }
    });

    res.status(201).json({ success: true, data: coupon });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return next(new BadRequestError(error.errors[0].message));
    }
    next(error);
  }
}

export async function deleteCoupon(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const coupon = await prisma.coupon.findUnique({
      where: { id }
    });

    if (!coupon) {
      throw new NotFoundError('Coupon not found');
    }

    await prisma.coupon.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    next(error);
  }
}
