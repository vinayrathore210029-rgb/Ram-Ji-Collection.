import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middlewares/auth';
import { BadRequestError, NotFoundError } from '../utils/errors';

export async function getWishlist(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;

    const items = await prisma.wishlist.findMany({
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
      data: items
    });
  } catch (error) {
    next(error);
  }
}

export async function addToWishlist(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { productId } = req.body;

    if (!productId) {
      throw new BadRequestError('Product ID is required');
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const existing = await prisma.wishlist.findFirst({
      where: { userId, productId }
    });

    if (existing) {
      return res.json({
        success: true,
        message: 'Product already in wishlist',
        data: existing
      });
    }

    const item = await prisma.wishlist.create({
      data: { userId, productId },
      include: { product: { include: { images: true } } }
    });

    res.status(201).json({
      success: true,
      message: 'Product added to wishlist',
      data: item
    });
  } catch (error) {
    next(error);
  }
}

export async function removeFromWishlist(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { productId } = req.params;

    const item = await prisma.wishlist.findFirst({
      where: { userId, productId }
    });

    if (!item) {
      throw new NotFoundError('Item not found in wishlist');
    }

    await prisma.wishlist.delete({
      where: { id: item.id }
    });

    res.json({
      success: true,
      message: 'Product removed from wishlist'
    });
  } catch (error) {
    next(error);
  }
}
