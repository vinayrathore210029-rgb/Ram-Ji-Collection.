import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { BadRequestError, UnauthorizedError, ConflictError } from '../utils/errors';
import { sendOtpEmail } from '../utils/email';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-replace-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super-secret-jwt-refresh-key-replace-in-production';

// Validation Schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters')
});

const googleLoginSchema = z.object({
  credential: z.string().optional(),
  accessToken: z.string().optional()
});

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new ConflictError('Email is already registered');
    }

    // Set first user in system to admin for easy configuration/testing, otherwise customer
    const totalUsers = await prisma.user.count();
    const role = totalUsers === 0 ? 'ADMIN' : 'CUSTOMER';

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
        role
      }
    });

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' } // Extended session
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: '90d' } // 90 days persistent login
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token: accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role
        }
      }
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return next(new BadRequestError(error.errors[0].message));
    }
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: '90d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token: accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role
        }
      }
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return next(new BadRequestError(error.errors[0].message));
    }
    next(error);
  }
}

/**
 * Forgot Password - Send Email OTP
 */
export async function forgotPasswordEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new BadRequestError('No account found with this email address.');
    }

    // Rate limit check: 2 minutes cooldown
    const existing = await prisma.emailOtpVerification.findUnique({
      where: { email }
    });

    if (existing) {
      const secondsSinceLastSent = (Date.now() - new Date(existing.lastSentAt).getTime()) / 1000;
      if (secondsSinceLastSent < 120) {
        const remainingSeconds = Math.ceil(120 - secondsSinceLastSent);
        return next(
          new BadRequestError(`Please wait ${remainingSeconds} seconds before requesting a new OTP.`)
        );
      }
    }

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await prisma.emailOtpVerification.upsert({
      where: { email },
      create: {
        email,
        otp: generatedOtp,
        expiresAt,
        lastSentAt: new Date()
      },
      update: {
        otp: generatedOtp,
        expiresAt,
        lastSentAt: new Date()
      }
    });

    await sendOtpEmail(email, generatedOtp, user.firstName);

    res.json({
      success: true,
      message: 'Password reset OTP has been sent to your email.',
      data: {
        email,
        cooldownSeconds: 120
      }
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return next(new BadRequestError(error.errors[0].message));
    }
    next(error);
  }
}

/**
 * Reset Password with Email OTP
 */
export async function resetPasswordEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, otp, newPassword } = resetPasswordSchema.parse(req.body);

    const record = await prisma.emailOtpVerification.findUnique({
      where: { email }
    });

    if (!record) {
      throw new BadRequestError('No OTP record found. Please request a new OTP.');
    }

    if (new Date() > record.expiresAt) {
      throw new BadRequestError('OTP has expired. Please request a new OTP.');
    }

    if (record.otp !== otp) {
      throw new BadRequestError('Invalid OTP code. Please check and try again.');
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new BadRequestError('User account not found.');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    });

    // Delete used OTP
    await prisma.emailOtpVerification.delete({
      where: { email }
    });

    res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return next(new BadRequestError(error.errors[0].message));
    }
    next(error);
  }
}

/**
 * Google Sign-In / Login with Google
 */
export async function googleLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { credential, accessToken } = googleLoginSchema.parse(req.body);

    if (!credential && !accessToken) {
      throw new BadRequestError('Google credential or accessToken is required');
    }

    let googleUser: { email: string; given_name?: string; family_name?: string; picture?: string } | null = null;

    if (credential) {
      // Verify Google ID Token via Google OAuth API
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
      if (!response.ok) {
        throw new UnauthorizedError('Invalid Google credential token');
      }
      const data = await response.json();
      googleUser = {
        email: data.email,
        given_name: data.given_name || data.name || 'User',
        family_name: data.family_name || '',
        picture: data.picture
      };
    } else if (accessToken) {
      // Verify Google Access Token via Google userinfo API
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!response.ok) {
        throw new UnauthorizedError('Invalid Google access token');
      }
      const data = await response.json();
      googleUser = {
        email: data.email,
        given_name: data.given_name || data.name || 'User',
        family_name: data.family_name || '',
        picture: data.picture
      };
    }

    if (!googleUser || !googleUser.email) {
      throw new UnauthorizedError('Could not retrieve email from Google Account');
    }

    // Find or Create User
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email }
    });

    if (!user) {
      const totalUsers = await prisma.user.count();
      const role = totalUsers === 0 ? 'ADMIN' : 'CUSTOMER';
      const randomPassword = await bcrypt.hash(Math.random().toString(36) + Date.now().toString(), 10);

      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          passwordHash: randomPassword,
          firstName: googleUser.given_name || 'User',
          lastName: googleUser.family_name || '',
          role
        }
      });
    }

    const appAccessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const appRefreshToken = jwt.sign(
      { id: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: '90d' }
    );

    res.json({
      success: true,
      message: 'Google login successful',
      data: {
        token: appAccessToken,
        refreshToken: appRefreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role
        }
      }
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return next(new BadRequestError(error.errors[0].message));
    }
    next(error);
  }
}

export async function me(req: any, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new BadRequestError('Refresh token is required');
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { id: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token: newAccessToken
      }
    });
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired refresh token'));
  }
}

export async function deleteAccount(req: any, res: Response, next: NextFunction) {
  try {
    const userId = req.user.id;
    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

