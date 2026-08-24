'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword, createSession, destroySession, getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { validateEmailDeliverability } from '@/lib/email-validator';
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limiter';

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

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase() },
    });

    if (existingUser) {
      return { success: false, error: 'Un compte existe déjà avec cette adresse email.' };
    }

    const passwordHash = await hashPassword(validated.password);

    const newUser = await prisma.user.create({
      data: {
        email: validated.email.toLowerCase(),
        passwordHash,
        firstName: validated.firstName,
        lastName: validated.lastName,
        phone: validated.phone || null,
        role: 'CLIENT',
        emailVerified: false,
      },
    });

    await createSession(newUser.id);

    return {
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
      },
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues?.[0]?.message || 'Données invalides' };
    }
    console.error('Erreur inscription:', error);
    return { success: false, error: 'Une erreur est survenue lors de la création du compte.' };
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

    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token: code,
        expiresAt,
      },
    });

    console.log(`✉️ [EMAIL VERIFICATION] Code de confirmation pour ${user.email} : ${code}`);

    return {
      success: true,
      message: 'Code de vérification envoyé par email.',
      simulatedCode: process.env.NODE_ENV !== 'production' ? code : undefined,
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
