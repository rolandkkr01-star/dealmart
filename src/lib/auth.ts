import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from './prisma';

const SESSION_COOKIE_NAME = 'dealmart_session_token';
const SESSION_EXPIRY_DAYS = 7;

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: 'CLIENT' | 'ADMIN' | 'SUPERADMIN';
  emailVerified: boolean;
}

/**
 * Hache un mot de passe avec sel fort
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

/**
 * Vérifie un mot de passe par rapport au hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Crée une session persistée en base de données et écrit le cookie HttpOnly
 */
export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });

  return token;
}

/**
 * Récupère l'utilisateur connecté courant depuis la session en base
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) return null;

    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            emailVerified: true,
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await prisma.session.delete({ where: { token } }).catch(() => {});
      }
      return null;
    }

    return session.user as AuthenticatedUser;
  } catch (error) {
    console.error('Erreur récupération utilisateur courant:', error);
    return null;
  }
}

/**
 * Détruit la session en base de données et supprime le cookie
 */
export async function destroySession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      await prisma.session.delete({ where: { token } }).catch(() => {});
    }

    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch (error) {
    console.error('Erreur destruction session:', error);
  }
}

/**
 * Vérification stricte côté serveur : Utilisateur connecté obligatoire
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}

/**
 * Vérification stricte côté serveur : Rôle Administrateur obligatoire (RBAC)
 */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  const user = await requireAuth();
  if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
    throw new Error('FORBIDDEN_ADMIN_ONLY');
  }
  return user;
}
