import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { z } from 'zod';
import { uploadFile } from '../config/storage';

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1)
});

export async function getCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const bodyData = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;
    const data = categorySchema.parse(bodyData);

    const existing = await prisma.category.findFirst({
      where: {
        OR: [
          { name: data.name },
          { slug: data.slug }
        ]
      }
    });

    if (existing) {
      throw new BadRequestError('Category name or slug already exists');
    }

    let imageUrl: string | null = null;
    if (req.file) {
      imageUrl = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        imageUrl
      }
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return next(new BadRequestError(error.errors[0].message));
    }
    next(error);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const bodyData = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;
    const data = categorySchema.partial().parse(bodyData);

    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    let imageUrl = category.imageUrl;
    if (req.file) {
      imageUrl = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...data,
        imageUrl
      }
    });

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: updated
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return next(new BadRequestError(error.errors[0].message));
    }
    next(error);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    await prisma.category.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}
