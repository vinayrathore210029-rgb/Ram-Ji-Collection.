import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { BadRequestError } from '../utils/errors';
import { z } from 'zod';

const sendOtpSchema = z.object({
  phone: z.string().min(10, 'Valid 10-digit mobile number is required')
});

const verifyOtpSchema = z.object({
  phone: z.string().min(10),
  otp: z.string().length(6, 'OTP must be 6 digits')
});

function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  return cleaned;
}

/**
 * Send OTP with strict 2-minute (120s) resend rate limit cooldown
 */
export async function sendOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone } = sendOtpSchema.parse(req.body);
    const formattedPhone = formatPhoneNumber(phone);

    // Check existing OTP record for 2-minute cooldown
    const existing = await prisma.otpVerification.findUnique({
      where: { phone: formattedPhone }
    });

    if (existing) {
      const secondsSinceLastSent = (Date.now() - new Date(existing.lastSentAt).getTime()) / 1000;
      if (secondsSinceLastSent < 120) {
        const remainingSeconds = Math.ceil(120 - secondsSinceLastSent);
        return next(
          new BadRequestError(
            `Please wait ${remainingSeconds} seconds before requesting a new OTP.`
          )
        );
      }
    }

    // Generate 6-digit numeric OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 mins

    // Upsert into OtpVerification
    await prisma.otpVerification.upsert({
      where: { phone: formattedPhone },
      create: {
        phone: formattedPhone,
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

    // Send OTP via Meta WhatsApp Graph API if token available
    const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '1242579422267973';

    if (whatsappToken && whatsappToken !== 'your_whatsapp_access_token') {
      try {
        await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${whatsappToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: formattedPhone,
            type: 'text',
            text: {
              preview_url: false,
              body: `🔑 *Ram Ji Collection Account Verification*\n\nAapka Verification OTP code hai: *${generatedOtp}*\n\nYeh code 10 minute ke liye valid hai. Kripya ise kisi ke sath share na karein.`
            }
          })
        });
      } catch (err) {
        console.error('Failed to send OTP WhatsApp message:', err);
      }
    } else {
      console.log(`[DEV OTP LOG] Verification OTP for ${formattedPhone}: ${generatedOtp}`);
    }

    res.json({
      success: true,
      message: 'OTP sent successfully to your mobile number!',
      data: {
        phone: formattedPhone,
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
 * Verify OTP endpoint
 */
export async function verifyOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone, otp } = verifyOtpSchema.parse(req.body);
    const formattedPhone = formatPhoneNumber(phone);

    const record = await prisma.otpVerification.findUnique({
      where: { phone: formattedPhone }
    });

    if (!record) {
      throw new BadRequestError('OTP record not found. Please request a new OTP.');
    }

    if (new Date() > record.expiresAt) {
      throw new BadRequestError('OTP has expired. Please request a new OTP.');
    }

    if (record.otp !== otp) {
      throw new BadRequestError('Invalid OTP code. Please enter the correct code.');
    }

    res.json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return next(new BadRequestError(error.errors[0].message));
    }
    next(error);
  }
}
