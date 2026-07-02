import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || 're_mockapikey';

export const resend = new Resend(resendApiKey);

export const emailFrom = process.env.EMAIL_FROM || 'Ram Ji Collection <noreply@yourdomain.com>';
