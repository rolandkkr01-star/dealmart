import { Resend } from 'resend';
import { siteConfig } from '@/lib/site-config';

/**
 * Service d'envoi d'emails transactionnels (Resend + Fallback Démo)
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
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <title>Code de confirmation ${siteConfig.name}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f5f7; margin: 0; padding: 20px; color: #1D2129; }
        .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
        .header { background: #1D2129; padding: 24px; text-align: center; }
        .header h1 { color: #FED700; margin: 0; font-size: 22px; font-weight: 700; }
        .content { padding: 32px 24px; text-align: center; }
        .greeting { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
        .message { font-size: 14px; color: #4b5563; line-height: 1.5; margin-bottom: 24px; }
        .otp-box { background: #F8FAFC; border: 2px dashed #FED700; border-radius: 12px; padding: 18px; display: inline-block; margin-bottom: 24px; }
        .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0062BD; margin: 0; }
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
          <div class="greeting">Bonjour ${userName},</div>
          <p class="message">
            Merci de créer votre compte chez <strong>${siteConfig.name}</strong>. Pour valider votre adresse email et sécuriser votre compte, veuillez saisir le code de confirmation suivant :
          </p>
          <div class="otp-box">
            <div class="otp-code">${otpCode}</div>
            <div class="expiry">Valable pendant 24 heures</div>
          </div>
          <p class="message" style="font-size: 12px; color: #94a3b8;">
            Si vous n'avez pas créé de compte chez ${siteConfig.name}, vous pouvez ignorer cet email en toute sécurité.
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
    console.error('❌ RESEND_API_KEY absente dans les variables d\'environnement.');
    return { success: false, error: 'Service d\'envoi d\'email non configuré sur le serveur.' };
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: `${otpCode} est votre code de confirmation ${siteConfig.name}`,
      html: htmlContent,
    });

    if (error) {
      console.error('❌ Erreur API Resend:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Email OTP envoyé avec succès via Resend à ${to} (ID: ${data?.id})`);
    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error('❌ Exception envoi Resend:', err);
    return { success: false, error: err.message || 'Erreur lors de l\'envoi de l\'email.' };
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
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <title>Réinitialisation de votre mot de passe ${siteConfig.name}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f5f7; margin: 0; padding: 20px; color: #1D2129; }
        .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
        .header { background: #1D2129; padding: 24px; text-align: center; }
        .header h1 { color: #FED700; margin: 0; font-size: 22px; font-weight: 700; }
        .content { padding: 32px 24px; text-align: center; }
        .greeting { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
        .message { font-size: 14px; color: #4b5563; line-height: 1.6; margin-bottom: 24px; text-align: left; }
        .btn-container { margin: 28px 0; }
        .btn { background-color: #FED700; color: #1D2129; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 12px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; }
        .link-alt { word-break: break-all; font-size: 11px; color: #0062BD; margin-top: 15px; }
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
          <div class="greeting">Bonjour ${userName},</div>
          <p class="message">
            Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte <strong>${siteConfig.name}</strong>.
          </p>
          <p class="message">
            Pour choisir un nouveau mot de passe en toute sécurité, cliquez sur le bouton ci-dessous :
          </p>
          <div class="btn-container">
            <a href="${resetUrl}" class="btn" target="_blank">Réinitialiser mon mot de passe</a>
          </div>
          <p class="link-alt">
            Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br/>
            <a href="${resetUrl}" style="color: #0062BD;">${resetUrl}</a>
          </p>
          <div class="security-box">
            <p>
              ⏱️ <strong>Ce lien expire dans 15 minutes</strong> et ne peut être utilisé qu'une seule fois.<br/>
              Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité : votre compte reste protégé et votre mot de passe actuel inchangé.
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
    console.error('❌ RESEND_API_KEY absente dans les variables d\'environnement.');
    return { success: false, error: 'Service d\'envoi d\'email non configuré sur le serveur.' };
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: `Réinitialisation de votre mot de passe • ${siteConfig.name}`,
      html: htmlContent,
    });

    if (error) {
      console.error('❌ Erreur API Resend:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Email réinitialisation envoyé avec succès via Resend à ${to} (ID: ${data?.id})`);
    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error('❌ Exception envoi Resend:', err);
    return { success: false, error: err.message || 'Erreur lors de l\'envoi de l\'email.' };
  }
}

