import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { Role } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-replace-in-production';

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Access token is required'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: Role;
    };
    req.user = decoded;
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired access token'));
  }
}

export function authorizeAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication is required'));
  }

  if (req.user.role !== 'ADMIN') {
    return next(new ForbiddenError('Admin privileges required'));
  }

  next();
}
