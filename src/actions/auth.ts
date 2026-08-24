'use server';

import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword, createSession, destroySession, getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { validateEmailDeliverability } from '@/lib/email-validator';
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limiter';
import { sendOtpVerificationEmail, sendPasswordResetEmail } from '@/lib/email-service';

const StrongPasswordSchema = z
  .string()
  .min(10, 'Le mot de passe doit contenir au moins 10 caractères')
  .regex(/[A-Z]/, 'Le mot de passe doit inclure au moins une lettre majuscule (A-Z)')
  .regex(/[a-z]/, 'Le mot de passe doit inclure au moins une lettre minuscule (a-z)')
  .regex(/[0-9]/, 'Le mot de passe doit inclure au moins un chiffre (0-9)')
  .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit inclure au moins un caractère spécial (ex: @, #, $, !, %, *, ?)');

const RegisterSchema = z.object({
  email: z.string().email('Format d\'email invalide'),
  password: StrongPasswordSchema,
  firstName: z.string().min(2, 'Le prénom est requis (2 caractères minimum)'),
  lastName: z.string().min(2, 'Le nom est requis (2 caractères minimum)'),
  phone: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email('Format d\'email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

const MasterAdminSetupSchema = z.object({
  firstName: z.string().min(2, 'Le prénom est requis'),
  lastName: z.string().min(2, 'Le nom est requis'),
  email: z.string().email('Format d\'email invalide'),
  phone: z.string().optional(),
  password: StrongPasswordSchema,
});

/**
 * Vérifie si un compte Master Admin (SUPERADMIN) existe déjà en base
 */
export async function checkMasterAdminExistsAction(): Promise<boolean> {
  try {
    const count = await prisma.user.count({
      where: { role: 'SUPERADMIN' },
    });
    return count > 0;
  } catch (error) {
    console.error('Erreur vérification Master Admin:', error);
    return false;
  }
}

/**
 * Initialisation unique du compte Master Admin lors de la première utilisation
 */
export async function setupMasterAdminAction(formData: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
}) {
  try {
    // Vérification de sécurité : un seul Master Admin peut être initialisé via cet assistant
    const existingMaster = await prisma.user.findFirst({
      where: { role: 'SUPERADMIN' },
    });

    if (existingMaster) {
      return {
        success: false,
        error: 'Action non autorisée : Le compte Master Admin a déjà été configuré.',
      };
    }

    const validated = MasterAdminSetupSchema.parse(formData);

    const emailCheck = await validateEmailDeliverability(validated.email);
    if (!emailCheck.isValid) {
      return { success: false, error: emailCheck.error || 'Adresse email invalide ou injoignable.' };
    }

    const passwordHash = await hashPassword(validated.password);

    const masterAdmin = await prisma.user.create({
      data: {
        email: validated.email.toLowerCase().trim(),
        passwordHash,
        firstName: validated.firstName.trim(),
        lastName: validated.lastName.trim(),
        phone: validated.phone?.trim() || null,
        role: 'SUPERADMIN',
        emailVerified: true,
      },
    });

    // Journal d'audit de l'initialisation
    try {
      await prisma.auditLog.create({
        data: {
          adminUserId: masterAdmin.id,
          adminEmail: masterAdmin.email,
          action: 'system.master_admin_initialized',
          targetType: 'User',
          targetId: masterAdmin.id,
          metadata: JSON.stringify({
            role: 'SUPERADMIN',
            email: masterAdmin.email,
            initializedAt: new Date().toISOString(),
          }),
        },
      });
    } catch (_) {}

    // Création immédiate de la session
    await createSession(masterAdmin.id);

    revalidatePath('/admin');
    revalidatePath('/admin/login');

    return {
      success: true,
      user: {
        id: masterAdmin.id,
        email: masterAdmin.email,
        firstName: masterAdmin.firstName,
        lastName: masterAdmin.lastName,
        role: masterAdmin.role,
      },
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues?.[0]?.message || 'Données invalides' };
    }
    console.error('Erreur initialisation Master Admin:', error);
    return { success: false, error: 'Une erreur est survenue lors de l\'initialisation du compte Master Admin.' };
  }
}

export async function registerAction(formData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}) {
  try {
    const validated = RegisterSchema.parse(formData);

    const emailCheck = await validateEmailDeliverability(validated.email);
    if (!emailCheck.isValid) {
      return { success: false, error: emailCheck.error || 'Adresse email invalide ou injoignable.' };
    }

    const normalizedEmail = validated.email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return { success: false, error: 'Un compte existe déjà avec cette adresse email.' };
    }

    const passwordHash = await hashPassword(validated.password);

    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        firstName: validated.firstName.trim(),
        lastName: validated.lastName.trim(),
        phone: validated.phone?.trim() || null,
        role: 'CLIENT',
        emailVerified: false,
      },
    });

    // Génération du code OTP à 6 chiffres
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Supprimer les éventuels anciens tokens pour cet email
    await prisma.verificationToken.deleteMany({
      where: { identifier: newUser.email },
    });

    await prisma.verificationToken.create({
      data: {
        identifier: newUser.email,
        token: otpCode,
        expiresAt,
      },
    });

    // Envoi de l'email via Resend
    const emailResult = await sendOtpVerificationEmail({
      to: newUser.email,
      userName: newUser.firstName,
      otpCode,
    });

    let warningMessage: string | undefined;
    if (!emailResult.success) {
      console.warn('⚠️ Échec envoi email Resend:', emailResult.error);
      if (emailResult.error?.includes('only send testing emails')) {
        const ownerEmail = emailResult.error.match(/to your own email address \(([^)]+)\)/)?.[1] || 'propriétaire';
        warningMessage = `Avertissement Resend (mode test gratuit) : L'email ne peut être envoyé qu'à l'adresse ${ownerEmail}. Pour envoyer à tous les clients sans restriction, ajoutez un nom de domaine vérifié sur resend.com/domains.`;
      } else {
        warningMessage = `Avertissement envoi email : ${emailResult.error}`;
      }
    }

    return {
      success: true,
      requireOtp: true,
      email: newUser.email,
      warning: warningMessage,
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues?.[0]?.message || 'Données invalides' };
    }
    console.error('Erreur inscription:', error);
    return { success: false, error: 'Une erreur est survenue lors de la création du compte.' };
  }
}

/**
 * Validation du code OTP saisi par l'utilisateur lors de l'inscription
 */
export async function verifyRegistrationOtpAction(data: { email: string; code: string }) {
  try {
    const normalizedEmail = data.email.toLowerCase().trim();
    const inputCode = data.code.trim();

    if (!inputCode || inputCode.length !== 6) {
      return { success: false, error: 'Le code de confirmation doit contenir 6 chiffres.' };
    }

    const verification = await prisma.verificationToken.findFirst({
      where: {
        identifier: normalizedEmail,
        token: inputCode,
      },
    });

    if (!verification || verification.expiresAt < new Date()) {
      return { success: false, error: 'Code de confirmation invalide ou expiré.' };
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return { success: false, error: 'Compte utilisateur introuvable.' };
    }

    // Mise à jour du statut vérifié
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    // Suppression du token consommé
    await prisma.verificationToken.delete({
      where: { id: verification.id },
    });

    // Création de la session sécurisée
    await createSession(user.id);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  } catch (error: any) {
    console.error('Erreur verifyRegistrationOtpAction:', error);
    return { success: false, error: 'Erreur lors de la validation du code OTP.' };
  }
}

/**
 * Renvoi d'un nouveau code OTP d'inscription
 */
export async function resendRegistrationOtpAction(email: string) {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return { success: false, error: 'Compte utilisateur introuvable.' };
    }

    if (user.emailVerified) {
      return { success: false, error: 'Votre adresse email est déjà vérifiée. Vous pouvez vous connecter.' };
    }

    // Rate limiting: 3 renvois max par 10 minutes
    const rateLimitKey = `resend_otp_${user.id}`;
    const limit = checkRateLimit(rateLimitKey, { maxRequests: 3, windowMs: 10 * 60 * 1000 });
    if (!limit.isAllowed) {
      const minutesRemaining = Math.ceil(limit.resetInMs / (60 * 1000));
      return { success: false, error: `Trop de renvois consécutifs. Veuillez patienter ${minutesRemaining} minute(s).` };
    }

    const newOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    await prisma.verificationToken.deleteMany({
      where: { identifier: normalizedEmail },
    });

    await prisma.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token: newOtpCode,
        expiresAt,
      },
    });

    const emailResult = await sendOtpVerificationEmail({
      to: user.email,
      userName: user.firstName,
      otpCode: newOtpCode,
    });

    if (!emailResult.success) {
      if (emailResult.error?.includes('only send testing emails')) {
        const ownerEmail = emailResult.error.match(/to your own email address \(([^)]+)\)/)?.[1] || 'propriétaire';
        return {
          success: false,
          error: `Resend (mode test gratuit) : L'email ne peut être envoyé qu'à l'adresse de votre compte Resend (${ownerEmail}).`,
        };
      }
      return { success: false, error: `Échec d'envoi : ${emailResult.error}` };
    }

    return {
      success: true,
      message: 'Un nouveau code de confirmation vous a été envoyé.',
    };
  } catch (error: any) {
    console.error('Erreur resendRegistrationOtpAction:', error);
    return { success: false, error: 'Impossible de renvoyer le code OTP.' };
  }
}

export async function loginAction(formData: {
  email: string;
  password: string;
  requireAdminRole?: boolean;
}) {
  try {
    const validated = LoginSchema.parse({
      email: formData.email,
      password: formData.password,
    });

    const normalizedEmail = validated.email.toLowerCase().trim();
    const rateLimitKey = `login_${normalizedEmail}`;
    const limit = checkRateLimit(rateLimitKey, { maxRequests: 5, windowMs: 15 * 60 * 1000 });

    if (!limit.isAllowed) {
      const minutesRemaining = Math.ceil(limit.resetInMs / (60 * 1000));
      return {
        success: false,
        error: `Trop de tentatives de connexion échouées. Par mesure de sécurité, veuillez patienter ${minutesRemaining} minute(s).`,
      };
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return { success: false, error: 'Identifiants incorrects.' };
    }

    const isMatch = await verifyPassword(validated.password, user.passwordHash);
    if (!isMatch) {
      return { success: false, error: 'Identifiants incorrects.' };
    }

    if (formData.requireAdminRole) {
      if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
        return { success: false, error: 'Accès refusé : Ce compte n\'a pas les privilèges administrateur.' };
      }
    } else {
      if (user.role === 'ADMIN' || user.role === 'SUPERADMIN') {
        return {
          success: false,
          error: 'Identifiants incorrects.',
        };
      }
    }

    // Réinitialisation du compteur de tentatives après succès
    resetRateLimit(rateLimitKey);

    await createSession(user.id);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues?.[0]?.message || 'Données invalides' };
    }
    console.error('Erreur connexion:', error);
    return { success: false, error: 'Une erreur est survenue lors de la connexion.' };
  }
}

export async function logoutAction() {
  await destroySession();
  return { success: true };
}

export async function getSessionUserAction() {
  const user = await getCurrentUser();
  return user;
}

/**
 * Génération et enregistrement d'un token sécurisé de vérification d'email
 */
export async function sendEmailVerificationTokenAction(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return { success: false, error: 'Compte utilisateur introuvable.' };
    }

    if (user.emailVerified) {
      return { success: true, message: 'Cette adresse email est déjà vérifiée.' };
    }

    // Rate limiting: 3 demandes par 10 minutes max
    const limit = checkRateLimit(`verify_email_${user.id}`, { maxRequests: 3, windowMs: 10 * 60 * 1000 });
    if (!limit.isAllowed) {
      return { success: false, error: 'Trop de demandes de vérification. Veuillez patienter quelques minutes.' };
    }

    // Code OTP sécurisé à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Supprimer les anciens tokens de cet email
    await prisma.verificationToken.deleteMany({
      where: { identifier: user.email },
    });

    await sendOtpVerificationEmail({
      to: user.email,
      userName: user.firstName,
      otpCode: code,
    });

    return {
      success: true,
      message: 'Code de vérification envoyé par email.',
    };
  } catch (error: any) {
    console.error('Erreur sendEmailVerificationTokenAction:', error);
    return { success: false, error: 'Impossible de générer le code de vérification.' };
  }
}

/**
 * Validation du code de confirmation d'email
 */
export async function verifyEmailWithTokenAction(token: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'Vous devez être connecté pour valider votre email.' };
    }

    const verificationRecord = await prisma.verificationToken.findFirst({
      where: {
        identifier: currentUser.email,
        token: token.trim(),
      },
    });

    if (!verificationRecord || verificationRecord.expiresAt < new Date()) {
      return { success: false, error: 'Code de confirmation invalide ou expiré.' };
    }

    // Validation du statut utilisateur
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { emailVerified: true },
    });

    // Suppression du token consommé
    await prisma.verificationToken.delete({
      where: { id: verificationRecord.id },
    });

    revalidatePath('/compte');

    return { success: true, message: 'Votre adresse email a été vérifiée avec succès !' };
  } catch (error: any) {
    console.error('Erreur verifyEmailWithTokenAction:', error);
    return { success: false, error: 'Erreur lors de la validation du code.' };
  }
}

const ForgotPasswordRequestSchema = z.object({
  email: z.string().email('Format d\'email invalide'),
});

const ResetPasswordSchema = z.object({
  token: z.string().min(10, 'Jeton de réinitialisation invalide'),
  password: StrongPasswordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les deux mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

/**
 * 1. Demande de réinitialisation de mot de passe (Lien à usage unique avec expiration 15 min)
 * - Rate Limiting strict (3 demandes par 15 min par email)
 * - Token cryptographique aléatoire 32 octets
 * - Token haché en base (SHA-256) pour éviter toute fuite
 * - Protection anti-énumération (réponse générique identique que l'email existe ou non)
 */
export async function requestPasswordResetAction(formData: { email: string }) {
  try {
    const validated = ForgotPasswordRequestSchema.parse(formData);
    const normalizedEmail = validated.email.toLowerCase().trim();

    // Rate Limiting : 3 demandes par 15 minutes par email
    const rateLimit = checkRateLimit(`pwd_reset_req_${normalizedEmail}`, {
      maxRequests: 3,
      windowMs: 15 * 60 * 1000,
    });

    if (!rateLimit.isAllowed) {
      const minutesRemaining = Math.ceil(rateLimit.resetInMs / (60 * 1000));
      return {
        success: false,
        error: `Trop de demandes de réinitialisation. Veuillez patienter ${minutesRemaining} minute(s) avant de réessayer.`,
      };
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Protection anti-énumération : message de succès même si le compte n'existe pas
    const genericSuccessMessage = 'Si cette adresse email est associée à un compte, un lien sécurisé de réinitialisation vous a été envoyé. Vérifiez votre boîte de réception et vos spams.';

    if (!user) {
      return {
        success: true,
        message: genericSuccessMessage,
      };
    }

    // Génération d'un token aléatoire de 32 octets (haute entropie)
    const rawToken = crypto.randomBytes(32).toString('hex');
    // Hachage SHA-256 du token pour le stockage en base (le token brut n'est JAMAIS enregistré en base)
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    // Expiration stricte de 15 minutes
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Supprimer les anciens tokens de réinitialisation pour cet email
    await prisma.verificationToken.deleteMany({
      where: { identifier: `pwd_reset_${user.email}` },
    });

    // Enregistrer le nouveau token haché
    await prisma.verificationToken.create({
      data: {
        identifier: `pwd_reset_${user.email}`,
        token: hashedToken,
        expiresAt,
      },
    });

    // URL de réinitialisation sécurisée
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reinitialiser-mot-de-passe?token=${rawToken}`;

    // Envoi de l'email via Resend
    await sendPasswordResetEmail({
      to: user.email,
      userName: user.firstName,
      resetUrl,
    });

    return {
      success: true,
      message: genericSuccessMessage,
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || 'Données invalides.' };
    }
    console.error('Erreur requestPasswordResetAction:', error);
    return { success: false, error: 'Une erreur est survenue lors de la demande. Veuillez réessayer.' };
  }
}

/**
 * 2. Exécution de la réinitialisation de mot de passe
 * - Vérification du token haché et de son expiration (15 min)
 * - Application de la politique de mot de passe fort
 * - Invalidation immédiate du token consommé
 * - Révocation de toutes les sessions actives existantes (Sécurité bancaire)
 * - Journalisation dans AuditLog
 */
export async function resetPasswordAction(formData: {
  token: string;
  password: string;
  confirmPassword: string;
}) {
  try {
    const validated = ResetPasswordSchema.parse(formData);

    // Rate Limiting sur les tentatives de réinitialisation pour bloquer le brute force de tokens
    const rateLimit = checkRateLimit(`pwd_reset_exec_${validated.token.slice(0, 12)}`, {
      maxRequests: 5,
      windowMs: 15 * 60 * 1000,
    });

    if (!rateLimit.isAllowed) {
      return {
        success: false,
        error: 'Trop de tentatives de validation. Veuillez refaire une demande de réinitialisation.',
      };
    }

    // Hachage du token reçu pour comparaison avec la base
    const hashedToken = crypto.createHash('sha256').update(validated.token.trim()).digest('hex');

    const tokenRecord = await prisma.verificationToken.findUnique({
      where: { token: hashedToken },
    });

    if (!tokenRecord || !tokenRecord.identifier.startsWith('pwd_reset_')) {
      return {
        success: false,
        error: 'Ce lien de réinitialisation est invalide ou a déjà été utilisé. Veuillez refaire une demande.',
      };
    }

    // Vérifier l'expiration
    if (tokenRecord.expiresAt < new Date()) {
      // Supprimer le token expiré
      await prisma.verificationToken.delete({
        where: { id: tokenRecord.id },
      });
      return {
        success: false,
        error: 'Ce lien de réinitialisation a expiré (validité de 15 minutes dépassée). Veuillez refaire une demande.',
      };
    }

    const email = tokenRecord.identifier.replace('pwd_reset_', '');
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        success: false,
        error: 'Compte utilisateur associé introuvable.',
      };
    }

    // Hachage sécurisé du nouveau mot de passe (Bcrypt cost factor 12)
    const newPasswordHash = await hashPassword(validated.password);

    // Transaction atomique : Mise à jour mot de passe + Invalidation token + Révocation sessions + Audit
    await prisma.$transaction([
      // 1. Mise à jour du hash
      prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: newPasswordHash,
          emailVerified: true, // L'accès au lien email prouve la possession de l'adresse
        },
      }),
      // 2. Suppression du token consommé (Usage unique strict)
      prisma.verificationToken.delete({
        where: { id: tokenRecord.id },
      }),
      // 3. Révocation de toutes les sessions actives précédentes (Sécurité maximale)
      prisma.session.deleteMany({
        where: { userId: user.id },
      }),
      // 4. Audit Log
      prisma.auditLog.create({
        data: {
          adminUserId: user.id,
          adminEmail: user.email,
          action: 'user.password_reset_completed',
          targetType: 'User',
          targetId: user.id,
          metadata: JSON.stringify({
            ip: 'client',
            timestamp: new Date().toISOString(),
          }),
        },
      }),
    ]);

    return {
      success: true,
      message: 'Votre mot de passe a été modifié avec succès ! Vous pouvez maintenant vous connecter.',
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || 'Données invalides.' };
    }
    console.error('Erreur resetPasswordAction:', error);
    return { success: false, error: 'Une erreur est survenue lors de la réinitialisation.' };
  }
}

