import crypto from 'crypto';

/**
 * Vérification cryptographique des signatures Webhook
 */

/**
 * Valide la signature d'un webhook Kkiapay
 */
export function verifyKkiapayWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secretKey?: string
): boolean {
  const secret = secretKey || process.env.KKIAPAY_SECRET || process.env.KKIAPAY_PRIVATE_KEY;
  if (!secret) {
    console.warn('⚠️ KKIAPAY_SECRET non configuré pour la signature webhook.');
    return false;
  }

  if (!signatureHeader) {
    return false;
  }

  try {
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(computedSignature),
      Buffer.from(signatureHeader)
    );
  } catch (_) {
    // Si la signature n'a pas la même longueur ou n'est pas au format hex
    return signatureHeader === secret;
  }
}

/**
 * Valide la signature d'un webhook FedaPay
 * Format FedaPay : X-FedaPay-Signature: t=1614556488,s=e26c6d...
 */
export function verifyFedaPayWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  webhookSecret?: string
): boolean {
  const secret = webhookSecret || process.env.FEDAPAY_WEBHOOK_SECRET || process.env.FEDAPAY_SECRET_KEY;
  if (!secret) {
    console.warn('⚠️ FEDAPAY_WEBHOOK_SECRET non configuré pour la signature webhook.');
    return false;
  }

  if (!signatureHeader) {
    return false;
  }

  try {
    // Parser les éléments t=... et s=...
    const parts = signatureHeader.split(',').reduce((acc, part) => {
      const [key, val] = part.split('=');
      if (key && val) acc[key.trim()] = val.trim();
      return acc;
    }, {} as Record<string, string>);

    const timestamp = parts['t'];
    const signature = parts['s'];

    if (!timestamp || !signature) {
      // Fallback si signature brute
      const computed = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
      return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signatureHeader));
    }

    const payload = `${timestamp}.${rawBody}`;
    const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    );
  } catch (_) {
    return false;
  }
}
