import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { z } from 'zod';
import { uploadFile } from '../config/storage';
import { Gender } from '@prisma/client';

// Product validation schemas
const productCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  brand: z.string().optional().nullable(),
  categoryId: z.string().uuid(),
  gender: z.nativeEnum(Gender).optional().default(Gender.UNISEX),
  price: z.number().positive(),
  discount: z.number().nonnegative().max(100).optional().default(0),
  stock: z.number().int().nonnegative().optional().default(0),
  sku: z.string().optional(),
  sizes: z.array(z.string()).optional().default([]),
  colors: z.array(z.string()).optional().default([]),
  material: z.string().optional().nullable(),
  featured: z.boolean().optional().default(false),
  trending: z.boolean().optional().default(false),
  newArrival: z.boolean().optional().default(false),
  bestSeller: z.boolean().optional().default(false)
});

export async function getProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      q,
      categoryId,
      gender,
      color,
      size,
      minPrice,
      maxPrice,
      inStock,
      sort,
      page = '1',
      limit = '12'
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build filter clause
    const whereClause: any = {};

    if (q) {
      whereClause.OR = [
        { name: { contains: q as string, mode: 'insensitive' } },
        { description: { contains: q as string, mode: 'insensitive' } },
        { brand: { contains: q as string, mode: 'insensitive' } },
        { sku: { contains: q as string, mode: 'insensitive' } }
      ];
    }

    if (categoryId) {
      whereClause.categoryId = categoryId as string;
    }

    if (gender) {
      whereClause.gender = gender as Gender;
    }

    if (color) {
      const colorsList = (color as string).split(',');
      whereClause.colors = { hasSome: colorsList };
    }

    if (size) {
      const sizesList = (size as string).split(',');
      whereClause.sizes = { hasSome: sizesList };
    }

    if (minPrice || maxPrice) {
      whereClause.finalPrice = {};
      if (minPrice) whereClause.finalPrice.gte = parseFloat(minPrice as string);
      if (maxPrice) whereClause.finalPrice.lte = parseFloat(maxPrice as string);
    }

    if (inStock === 'true') {
      whereClause.stock = { gt: 0 };
    }

    // Build sorting
    let orderBy: any = { createdAt: 'desc' }; // default: latest
    if (sort === 'priceAsc') {
      orderBy = { finalPrice: 'asc' };
    } else if (sort === 'priceDesc') {
      orderBy = { finalPrice: 'desc' };
    } else if (sort === 'popular') {
      orderBy = [
        { bestSeller: 'desc' },
        { trending: 'desc' },
        { rating: 'desc' }
      ];
    } else if (sort === 'rating') {
      orderBy = { rating: 'desc' };
    }

    // Fetch matching products and total count
    const [products, totalCount] = await prisma.$transaction([
      prisma.product.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: limitNum,
        include: {
          images: true,
          category: true
        }
      }),
      prisma.product.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / limitNum),
          currentPage: pageNum,
          limit: limitNum
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        category: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const bodyData = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;
    const data = productCreateSchema.parse(bodyData);

    // Generate SKU automatically if not supplied
    let sku = data.sku;
    if (!sku) {
      const count = await prisma.product.count();
      let isUnique = false;
      let checkNum = count + 1;
      while (!isUnique) {
        sku = `RJC-${String(checkNum).padStart(4, '0')}`;
        const match = await prisma.product.findUnique({ where: { sku } });
        if (!match) {
          isUnique = true;
        } else {
          checkNum++;
        }
      }
    } else {
      const existingSku = await prisma.product.findUnique({
        where: { sku }
      });
      if (existingSku) {
        throw new BadRequestError(`Product with SKU ${sku} already exists`);
      }
    }

    // Calculate final price after discount
    const finalPrice = data.price - (data.price * data.discount) / 100;

    // Handle files upload
    const uploadedImages: string[] = [];
    const files = req.files as Express.Multer.File[] | undefined;
    if (files && files.length > 0) {
      for (const file of files) {
        const url = await uploadFile(file.buffer, file.originalname, file.mimetype);
        uploadedImages.push(url);
      }
    }

    // Create product and its image records in transaction
    const product = await prisma.$transaction(async (tx) => {
      const p = await tx.product.create({
        data: {
          name: data.name,
          description: data.description,
          brand: data.brand || null,
          categoryId: data.categoryId,
          gender: data.gender,
          price: data.price,
          discount: data.discount,
          finalPrice,
          stock: data.stock,
          sku,
          sizes: data.sizes,
          colors: data.colors,
          material: data.material || null,
          featured: data.featured,
          trending: data.trending,
          newArrival: data.newArrival,
          bestSeller: data.bestSeller
        }
      });

      if (uploadedImages.length > 0) {
        await tx.productImage.createMany({
          data: uploadedImages.map((url, index) => ({
            productId: p.id,
            url,
            isPrimary: index === 0
          }))
        });
      }

      return tx.product.findUnique({
        where: { id: p.id },
        include: { images: true }
      });
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return next(new BadRequestError(error.errors[0].message));
    }
    next(error);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const bodyData = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;
    const data = productCreateSchema.partial().parse(bodyData);

    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    let finalPrice = product.finalPrice;
    if (data.price !== undefined || data.discount !== undefined) {
      const basePrice = data.price ?? product.price;
      const discountPercent = data.discount ?? product.discount;
      finalPrice = basePrice - (basePrice * discountPercent) / 100;
    }

    // Handle files upload (optional new images)
    const uploadedImages: string[] = [];
    const files = req.files as Express.Multer.File[] | undefined;
    if (files && files.length > 0) {
      for (const file of files) {
        const url = await uploadFile(file.buffer, file.originalname, file.mimetype);
        uploadedImages.push(url);
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          ...data,
          finalPrice
        }
      });

      if (uploadedImages.length > 0) {
        // If there were no prior primary images, set the first new one as primary
        const primaryImageCount = await tx.productImage.count({
          where: { productId: id, isPrimary: true }
        });

        await tx.productImage.createMany({
          data: uploadedImages.map((url, index) => ({
            productId: id,
            url,
            isPrimary: primaryImageCount === 0 && index === 0
          }))
        });
      }

      return tx.product.findUnique({
        where: { id },
        include: { images: true }
      });
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updated
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return next(new BadRequestError(error.errors[0].message));
    }
    next(error);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    await prisma.product.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}
