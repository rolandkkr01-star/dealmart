import { PaymentInitParams, PaymentVerificationResult } from './types';

/**
 * Adaptateur FedaPay pour initialiser et vérifier les paiements
 * https://docs.fedapay.com
 */
function getFedaPayBaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_FEDAPAY_ENVIRONMENT || 'sandbox';
  return env === 'live' || env === 'production'
    ? 'https://api.fedapay.com/v1'
    : 'https://sandbox-api.fedapay.com/v1';
}

function getFedaPayCheckoutBaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_FEDAPAY_ENVIRONMENT || 'sandbox';
  return env === 'live' || env === 'production'
    ? 'https://checkout.fedapay.com'
    : 'https://sandbox-checkout.fedapay.com';
}

/**
 * Nettoie le numéro de téléphone pour l'API FedaPay Bénin
 */
function formatFedaPayPhone(phone: string): { number: string; country: string } {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('229')) {
    cleaned = cleaned.slice(3);
  }
  return {
    number: cleaned || '97000000',
    country: 'bj',
  };
}

/**
 * Création d'une transaction et génération du lien / token de paiement FedaPay
 */
export async function createFedaPayTransaction(params: PaymentInitParams): Promise<{
  success: boolean;
  transactionId?: string | number;
  token?: string;
  paymentUrl?: string;
  error?: string;
}> {
  const secretKey = process.env.FEDAPAY_SECRET_KEY?.trim();
  const baseUrl = getFedaPayBaseUrl();
  const checkoutBaseUrl = getFedaPayCheckoutBaseUrl();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!secretKey) {
    console.warn('⚠️ FEDAPAY_SECRET_KEY manquante dans .env - mode simulation');
    return {
      success: true,
      transactionId: `FEDA-SIM-${Date.now()}`,
      paymentUrl: `${appUrl}/commande/${params.orderNumber}?status=simulated`,
    };
  }

  try {
    const phoneObj = formatFedaPayPhone(params.customerPhone);
    const names = (params.customerName || 'Client TechPhone').trim().split(' ');
    const firstname = names[0] || 'Client';
    const lastname = names.slice(1).join(' ') || 'TechPhone';

    // 1. Créer la transaction FedaPay
    const txPayload = {
      description: `Commande #${params.orderNumber} - ${process.env.NEXT_PUBLIC_STORE_NAME || 'TechPhone229'}`,
      amount: Math.round(params.amount),
      currency: { iso: 'XOF' },
      callback_url: `${appUrl}/api/payments/fedapay/callback?orderNumber=${params.orderNumber}`,
      customer: {
        firstname,
        lastname,
        email: params.customerEmail || 'client@techphone229.bj',
        phone_number: phoneObj,
      },
    };

    const txResponse = await fetch(`${baseUrl}/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(txPayload),
    });

    const txData = await txResponse.json();
    const transaction = txData['v1/transaction'] || txData.transaction || txData;

    if (!transaction || !transaction.id) {
      console.error('Erreur retour transaction FedaPay :', txData);
      return {
        success: false,
        error: txData.message || txData.error || 'Impossible d\'initialiser la transaction FedaPay.',
      };
    }

    const txId = transaction.id;

    // 2. Générer le token de paiement
    const tokenResponse = await fetch(`${baseUrl}/transactions/${txId}/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    const tokenData = await tokenResponse.json();
    const tokenObj = tokenData['v1/token'] || tokenData.token || tokenData;
    const tokenStr = typeof tokenObj === 'string' ? tokenObj : (tokenObj?.token || tokenData.token);
    const returnedUrl = tokenObj?.url || tokenData.url;

    const paymentUrl = returnedUrl || `${checkoutBaseUrl}/${tokenStr}`;

    return {
      success: true,
      transactionId: txId,
      token: tokenStr,
      paymentUrl,
    };
  } catch (error: any) {
    console.error('Erreur initialisation FedaPay :', error);
    return {
      success: false,
      error: error.message || 'Erreur réseau lors de la communication avec FedaPay.',
    };
  }
}

/**
 * Vérification du statut d'une transaction FedaPay
 */
export async function verifyFedaPayTransaction(transactionId: string | number): Promise<PaymentVerificationResult> {
  const secretKey = process.env.FEDAPAY_SECRET_KEY?.trim();
  const baseUrl = getFedaPayBaseUrl();

  if (!secretKey) {
    console.warn('⚠️ FEDAPAY_SECRET_KEY manquante dans .env - validation locale');
    return {
      success: true,
      status: 'PAID',
      transactionId: String(transactionId),
      message: 'Validation locale (clé API non configurée)',
    };
  }

  try {
    const response = await fetch(`${baseUrl}/transactions/${transactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Accept': 'application/json',
      },
    });

    const data = await response.json();
    const transaction = data['v1/transaction'] || data.transaction || data;

    if (transaction && (transaction.status === 'approved' || transaction.status === 'transferred')) {
      return {
        success: true,
        status: 'PAID',
        transactionId: String(transaction.id),
        amount: transaction.amount,
        raw: transaction,
      };
    }

    return {
      success: false,
      status: transaction?.status === 'pending' ? 'PENDING' : 'FAILED',
      transactionId: String(transactionId),
      message: `Statut FedaPay actuel : ${transaction?.status || 'en attente'}`,
      raw: transaction,
    };
  } catch (error: any) {
    console.error('Erreur vérification FedaPay :', error);
    return {
      success: false,
      status: 'FAILED',
      transactionId: String(transactionId),
      message: error.message || 'Erreur de connexion à FedaPay.',
    };
  }
}
