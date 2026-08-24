import { PaymentVerificationResult } from './types';

/**
 * Vérification d'une transaction Kkiapay côté serveur
 * https://docs.kkiapay.me/v1
 */
export async function verifyKkiapayTransaction(transactionId: string): Promise<PaymentVerificationResult> {
  const privateKey = process.env.KKIAPAY_PRIVATE_KEY;
  const isSandbox = process.env.NEXT_PUBLIC_KKIAPAY_SANDBOX === 'true';

  if (!privateKey) {
    console.warn('⚠️ KKIAPAY_PRIVATE_KEY manquante dans .env - validation en mode simulation');
    return {
      success: true,
      status: 'PAID',
      transactionId,
      message: 'Validation locale (clé API non configurée)',
    };
  }

  try {
    const endpoint = isSandbox
      ? 'https://api-sandbox.kkiapay.me/api/v1/verify'
      : 'https://api.kkiapay.me/api/v1/verify';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key': privateKey,
      },
      body: JSON.stringify({ transactionId }),
    });

    const data = await response.json();

    if (data && (data.status === 'SUCCESS' || data.status === 'success' || data.status === 'TRANSACTION_FOUND')) {
      return {
        success: true,
        status: 'PAID',
        transactionId: data.transactionId || transactionId,
        amount: data.amount,
        raw: data,
      };
    }

    // Si l'endpoint principal a échoué en sandbox, test du fallback universel
    if (!response.ok) {
      const fallbackRes = await fetch('https://api.kkiapay.me/api/v1/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-api-key': privateKey,
        },
        body: JSON.stringify({ transactionId }),
      });
      const fallbackData = await fallbackRes.json();
      if (fallbackData && (fallbackData.status === 'SUCCESS' || fallbackData.status === 'success')) {
        return {
          success: true,
          status: 'PAID',
          transactionId: fallbackData.transactionId || transactionId,
          amount: fallbackData.amount,
          raw: fallbackData,
        };
      }
    }

    return {
      success: false,
      status: 'FAILED',
      transactionId,
      message: data.message || 'La transaction Kkiapay n\'a pas pu être validée.',
      raw: data,
    };
  } catch (error: any) {
    console.error('Erreur lors de la vérification Kkiapay :', error);
    return {
      success: false,
      status: 'FAILED',
      transactionId,
      message: error.message || 'Erreur réseau lors de la vérification Kkiapay.',
    };
  }
}
