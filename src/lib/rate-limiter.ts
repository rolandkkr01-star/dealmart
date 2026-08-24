/**
 * Système de Rate Limiting Hybride (Point 6.3 de l'audit)
 * - Supporte Upstash Redis REST API pour le serverless distribué multi-régions (Vercel)
 * - Fallback automatique sur stockage mémoire local avec fenêtre glissante
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// Store en mémoire local
const localRateLimitStore = new Map<string, RateLimitRecord>();

// Nettoyage périodique des entrées expirées (toutes les 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of localRateLimitStore.entries()) {
      if (now > record.resetAt) {
        localRateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number; // en millisecondes
}

/**
 * Vérifie si une action est autorisée selon les quotas configurés
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions = { maxRequests: 5, windowMs: 15 * 60 * 1000 }
): { isAllowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const record = localRateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    localRateLimitStore.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return {
      isAllowed: true,
      remaining: options.maxRequests - 1,
      resetInMs: options.windowMs,
    };
  }

  if (record.count >= options.maxRequests) {
    return {
      isAllowed: false,
      remaining: 0,
      resetInMs: Math.max(0, record.resetAt - now),
    };
  }

  record.count += 1;
  return {
    isAllowed: true,
    remaining: options.maxRequests - record.count,
    resetInMs: Math.max(0, record.resetAt - now),
  };
}

/**
 * Réinitialise le compteur d'une clé (ex: après connexion réussie)
 */
export function resetRateLimit(key: string): void {
  localRateLimitStore.delete(key);
}

/**
 * Version asynchrone compatible Upstash Redis pour le déploiement serverless distribué
 */
export async function checkRateLimitAsync(
  key: string,
  options: RateLimitOptions = { maxRequests: 5, windowMs: 15 * 60 * 1000 }
): Promise<{ isAllowed: boolean; remaining: number; resetInMs: number }> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // Si Upstash Redis est configuré en production
  if (redisUrl && redisToken) {
    try {
      const windowSeconds = Math.ceil(options.windowMs / 1000);
      const redisKey = `ratelimit:${key}`;

      // Incrémentation atomique via l'API REST Upstash
      const res = await fetch(`${redisUrl}/pipeline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${redisToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          ['INCR', redisKey],
          ['EXPIRE', redisKey, windowSeconds, 'NX'],
          ['TTL', redisKey],
        ]),
        cache: 'no-store',
      });

      if (res.ok) {
        const data = await res.json();
        const count = data[0]?.result || 1;
        const ttlSeconds = data[2]?.result || windowSeconds;

        return {
          isAllowed: count <= options.maxRequests,
          remaining: Math.max(0, options.maxRequests - count),
          resetInMs: ttlSeconds * 1000,
        };
      }
    } catch (err) {
      console.warn('Fallback sur le rate limiter local (erreur Upstash Redis) :', err);
    }
  }

  // Fallback synchrone en mémoire
  return checkRateLimit(key, options);
}
