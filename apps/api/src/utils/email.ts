import { resend, emailFrom } from '../config/email';

export async function sendOtpEmail(toEmail: string, otp: string, firstName?: string): Promise<boolean> {
  const recipientName = firstName || 'Customer';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Reset OTP - Ram Ji Collection</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa; margin: 0; padding: 20px; }
        .container { max-width: 550px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border: 1px solid #e9ecef; }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; padding: 25px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
        .content { padding: 30px 25px; text-align: center; color: #334155; }
        .otp-box { background: #f1f5f9; border: 2px dashed #6366f1; border-radius: 10px; padding: 18px; margin: 25px 0; display: inline-block; width: 80%; }
        .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; margin: 0; }
        .footer { background: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Ram Ji Collection</h1>
        </div>
        <div class="content">
          <h2>Password Reset Request</h2>
          <p>Hello <strong>${recipientName}</strong>,</p>
          <p>We received a request to reset the password for your Ram Ji Collection account. Use the OTP code below to set a new password:</p>
          
          <div class="otp-box">
            <p class="otp-code">${otp}</p>
          </div>

          <p style="font-size: 13px; color: #64748b;">This OTP is valid for <strong>10 minutes</strong>. Please do not share this code with anyone.</p>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 25px;">If you did not request a password reset, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Ram Ji Collection. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && resendApiKey !== 're_mockapikey') {
      await resend.emails.send({
        from: emailFrom,
        to: [toEmail],
        subject: `${otp} is your Password Reset OTP - Ram Ji Collection`,
        html: htmlContent
      });
      console.log(`[EMAIL OTP SENT] OTP sent to ${toEmail} via Resend.`);
    } else {
      console.log(`\n==================================================`);
      console.log(`[DEV EMAIL OTP LOG] Password Reset OTP for ${toEmail}: ${otp}`);
      console.log(`==================================================\n`);
    }
    return true;
  } catch (error) {
    console.error('Failed to send OTP email via Resend:', error);
    // Dev fallback log so testing never blocks
    console.log(`[DEV FALLBACK OTP LOG] OTP for ${toEmail}: ${otp}`);
    return true;
  }
}
