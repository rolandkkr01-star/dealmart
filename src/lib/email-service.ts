import { Resend } from 'resend';
import { siteConfig } from '@/lib/site-config';

/**
 * Transactional email service (Resend)
 */

interface SendOtpParams {
  to: string;
  userName: string;
  otpCode: string;
}

export async function sendOtpVerificationEmail({
  to,
  userName,
  otpCode,
}: SendOtpParams): Promise<{ success: boolean; error?: string; messageId?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim() || `${siteConfig.name} <onboarding@resend.dev>`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>${siteConfig.name} Verification Code</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f5f7; margin: 0; padding: 20px; color: #1D2129; }
        .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
        .header { background: #1D2129; padding: 24px; text-align: center; }
        .header h1 { color: #F1B20B; margin: 0; font-size: 22px; font-weight: 700; }
        .content { padding: 32px 24px; text-align: center; }
        .greeting { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
        .message { font-size: 14px; color: #4b5563; line-height: 1.5; margin-bottom: 24px; }
        .otp-box { background: #F8FAFC; border: 2px dashed #F1B20B; border-radius: 12px; padding: 18px; display: inline-block; margin-bottom: 24px; }
        .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0054A4; margin: 0; }
        .expiry { font-size: 12px; color: #6b7280; margin-top: 6px; }
        .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${siteConfig.name}</h1>
        </div>
        <div class="content">
          <div class="greeting">Hello ${userName},</div>
          <p class="message">
            Thank you for creating an account with <strong>${siteConfig.name}</strong>. To verify your email address and secure your account, please enter the following verification code:
          </p>
          <div class="otp-box">
            <div class="otp-code">${otpCode}</div>
            <div class="expiry">Valid for 24 hours</div>
          </div>
          <p class="message" style="font-size: 12px; color: #94a3b8;">
            If you did not request this account, you can safely disregard this email.
          </p>
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} ${siteConfig.name} — ${siteConfig.slogan}
        </div>
      </div>
    </body>
    </html>
  `;

  if (!apiKey) {
    console.error('❌ RESEND_API_KEY missing in environment variables.');
    return { success: false, error: 'Email service not configured on server.' };
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: `${otpCode} is your ${siteConfig.name} verification code`,
      html: htmlContent,
    });

    if (error) {
      console.error('❌ Resend API error:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Verification email successfully sent via Resend to ${to} (ID: ${data?.id})`);
    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error('❌ Resend exception:', err);
    return { success: false, error: err.message || 'Error sending email.' };
  }
}

interface SendPasswordResetParams {
  to: string;
  userName: string;
  resetUrl: string;
}

export async function sendPasswordResetEmail({
  to,
  userName,
  resetUrl,
}: SendPasswordResetParams): Promise<{ success: boolean; error?: string; messageId?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim() || `${siteConfig.name} <onboarding@resend.dev>`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Reset your password • ${siteConfig.name}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f5f7; margin: 0; padding: 20px; color: #1D2129; }
        .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
        .header { background: #1D2129; padding: 24px; text-align: center; }
        .header h1 { color: #F1B20B; margin: 0; font-size: 22px; font-weight: 700; }
        .content { padding: 32px 24px; text-align: center; }
        .greeting { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
        .message { font-size: 14px; color: #4b5563; line-height: 1.6; margin-bottom: 24px; text-align: left; }
        .btn-container { margin: 28px 0; }
        .btn { background-color: #F1B20B; color: #1D2129; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 12px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; }
        .link-alt { word-break: break-all; font-size: 11px; color: #0054A4; margin-top: 15px; }
        .security-box { background: #FEF2F2; border-left: 4px solid #DC2626; padding: 12px 16px; border-radius: 8px; margin-top: 24px; text-align: left; }
        .security-box p { margin: 0; font-size: 12px; color: #991B1B; line-height: 1.4; }
        .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${siteConfig.name}</h1>
        </div>
        <div class="content">
          <div class="greeting">Hello ${userName},</div>
          <p class="message">
            We received a request to reset your password for your <strong>${siteConfig.name}</strong> account.
          </p>
          <p class="message">
            To choose a new password, click the button below:
          </p>
          <div class="btn-container">
            <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
          </div>
          <p class="link-alt">
            If the button doesn't work, copy and paste this link into your browser:<br/>
            <a href="${resetUrl}" style="color: #0054A4;">${resetUrl}</a>
          </p>
          <div class="security-box">
            <p>
              ⏱️ <strong>This link expires in 15 minutes</strong> and can only be used once.<br/>
              If you didn't make this request, you can safely ignore this email: your account remains secure and your password unchanged.
            </p>
          </div>
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} ${siteConfig.name} • ${siteConfig.slogan}
        </div>
      </div>
    </body>
    </html>
  `;

  if (!apiKey) {
    console.error('❌ RESEND_API_KEY missing in environment variables.');
    return { success: false, error: 'Email service not configured on server.' };
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: `Reset your password • ${siteConfig.name}`,
      html: htmlContent,
    });

    if (error) {
      console.error('❌ Resend API error:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Password reset email sent via Resend to ${to} (ID: ${data?.id})`);
    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error('❌ Resend exception:', err);
    return { success: false, error: err.message || 'Error sending email.' };
  }
}
