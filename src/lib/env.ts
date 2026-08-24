import { z } from 'zod';

/**
 * Schéma de validation des variables d'environnement (Point 1.6 de l'audit)
 * Bloque l'application immédiatement au démarrage en cas de variable critique manquante ou invalide.
 */
const envSchema = z.object({
  // Base de données & Sécurité
  DATABASE_URL: z.string().min(1, 'DATABASE_URL est requise pour la connexion PostgreSQL'),
  DIRECT_URL: z.string().optional(),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET doit comporter au moins 16 caractères pour être cryptographiquement sûr'),

  // Application & Store
  NEXT_PUBLIC_STORE_NAME: z.string().default('Butiky'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

  // Passerelles de paiement (optionnelles au dev, obligatoires en prod)
  NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY: z.string().optional(),
  KKIAPAY_PRIVATE_KEY: z.string().optional(),
  KKIAPAY_SECRET: z.string().optional(),
  NEXT_PUBLIC_KKIAPAY_SANDBOX: z.string().optional(),

  NEXT_PUBLIC_FEDAPAY_PUBLIC_KEY: z.string().optional(),
  FEDAPAY_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_FEDAPAY_ENVIRONMENT: z.string().optional(),

  // Emails & Resend
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),

  // Stockage Cloudflare R2 / S3
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),
  R2_PUBLIC_DOMAIN: z.string().optional(),

  // Rate Limiter distant optionnel (Upstash Redis)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

function validateEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ ERREUR CRITIQUE DE CONFIGURATION ENVIRONNEMENT :');
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    throw new Error('Variables d\'environnement invalides ou manquantes. Vérifiez votre fichier .env.');
  }

  return parsed.data;
}

export const env = validateEnv();
