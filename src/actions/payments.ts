'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { generateOrderNumber } from '@/lib/utils';
import { verifyKkiapayTransaction } from '@/lib/payments/kkiapay';
import { createFedaPayTransaction, verifyFedaPayTransaction } from '@/lib/payments/fedapay';
import { PaymentGateway } from '@/lib/payments/types';
import { siteConfig } from '@/lib/site-config';
import { validateEmailDeliverability } from '@/lib/email-validator';

export interface OrderItemInput {
  productId: string;
  variantId?: string;
  productName: string;
  productImage?: string;
  variantInfo?: string;
  quantity: number;
  unitPrice: number;
}

export interface CheckoutPayload {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  district: string;
  streetDetails: string;
  notes?: string;
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  promoCode?: string;
  paymentProvider: PaymentGateway;
  items: OrderItemInput[];
}

/**
 * 1. Initialise la commande et prépare le flux de paiement (Kkiapay ou FedaPay)
 */
export async function initCheckoutPaymentAction(data: CheckoutPayload) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'Vous devez être connecté à votre compte client pour passer commande.',
      };
    }

    if (data.customerEmail && data.customerEmail.trim()) {
      const emailCheck = await validateEmailDeliverability(data.customerEmail);
      if (!emailCheck.isValid) {
        return { success: false, error: emailCheck.error || 'Adresse email invalide ou injoignable.' };
      }
    }

    // Sauvegarde automatique du numéro de téléphone s'il était manquant
    if (data.customerPhone && !user.phone) {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { phone: data.customerPhone.trim() },
        });
      } catch (_) {}
    }

    const orderNumber = generateOrderNumber();

    // Création initiale de la commande en statut PENDING
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        customerName: data.customerName,
        customerEmail: data.customerEmail || user.email,
        customerPhone: data.customerPhone,
        city: data.city,
        district: data.district,
        streetDetails: data.streetDetails,
        notes: data.notes || null,
        status: 'PENDING',
        totalAmount: data.totalAmount,
        shippingFee: data.shippingFee,
        discountAmount: data.discountAmount,
        promoCode: data.promoCode || null,
        paymentProvider: data.paymentProvider,
        paymentRef: `${data.paymentProvider.toUpperCase()}-INIT-${Date.now().toString().slice(-6)}`,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId || null,
            productName: item.productName,
            variantInfo: item.variantInfo || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
        statusHistory: {
          create: [
            {
              status: 'PENDING',
              note: `Commande initiée via ${data.paymentProvider.toUpperCase()} - En attente de règlement`,
            },
          ],
        },
      },
    });

    // Branchement selon la passerelle sélectionnée
    if (data.paymentProvider === 'kkiapay') {
      const publicKey = process.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY || '';
      const isSandbox = process.env.NEXT_PUBLIC_KKIAPAY_SANDBOX === 'true';

      return {
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentProvider: 'kkiapay' as const,
        amount: order.totalAmount,
        kkiapay: {
          publicKey,
          isSandbox,
          name: data.customerName,
          email: data.customerEmail || user.email,
          phone: data.customerPhone,
        },
      };
    } else {
      // FedaPay
      const fedaResult = await createFedaPayTransaction({
        orderNumber: order.orderNumber,
        amount: order.totalAmount,
        customerName: data.customerName,
        customerEmail: data.customerEmail || user.email,
        customerPhone: data.customerPhone,
        city: data.city,
      });

      if (!fedaResult.success) {
        return {
          success: false,
          error: fedaResult.error || 'Échec d\'initialisation du paiement FedaPay.',
        };
      }

      return {
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentProvider: 'fedapay' as const,
        amount: order.totalAmount,
        fedapay: {
          transactionId: fedaResult.transactionId,
          token: fedaResult.token,
          paymentUrl: fedaResult.paymentUrl,
        },
      };
    }
  } catch (error: any) {
    console.error('Erreur initCheckoutPaymentAction :', error);
    return {
      success: false,
      error: error.message || 'Une erreur inattendue est survenue lors de l\'initialisation.',
    };
  }
}

/**
 * 2. Valide formellement une transaction (après succès Kkiapay ou retour FedaPay)
 */
export async function verifyOrderPaymentAction(params: {
  orderNumber: string;
  transactionId: string;
  provider: PaymentGateway;
}) {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: params.orderNumber },
    });

    if (!order) {
      return { success: false, error: 'Commande introuvable.' };
    }

    if (order.status === 'PAID') {
      return { success: true, orderNumber: order.orderNumber, alreadyPaid: true };
    }

    let verificationResult;

    if (params.provider === 'kkiapay') {
      verificationResult = await verifyKkiapayTransaction(params.transactionId);
    } else {
      verificationResult = await verifyFedaPayTransaction(params.transactionId);
    }

    if (!verificationResult.success || verificationResult.status !== 'PAID') {
      return {
        success: false,
        error: verificationResult.message || 'Le paiement n\'a pas pu être validé par la passerelle.',
      };
    }

    // Mise à jour de la commande en statut PAID
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          paymentRef: params.transactionId,
        },
      });

      await tx.orderStatusEvent.create({
        data: {
          orderId: order.id,
          status: 'PAID',
          note: `Paiement ${params.provider.toUpperCase()} validé avec succès (Réf Transaction : ${params.transactionId})`,
        },
      });
    });

    return {
      success: true,
      orderNumber: order.orderNumber,
    };
  } catch (error: any) {
    console.error('Erreur verifyOrderPaymentAction :', error);
    return {
      success: false,
      error: error.message || 'Erreur lors de la validation du paiement.',
    };
  }
}

/**
 * 3. Relance le paiement pour une commande existante en attente (depuis /compte/commandes ou /commande/[id])
 */
export async function initPendingOrderPaymentAction(orderNumber: string, provider: PaymentGateway) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Vous devez être connecté pour effectuer cette action.' };
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
    });

    if (!order) {
      return { success: false, error: 'Commande introuvable.' };
    }

    if (order.status === 'PAID') {
      return { success: true, alreadyPaid: true, orderNumber: order.orderNumber };
    }

    if (provider === 'kkiapay') {
      const publicKey = process.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY || '';
      const isSandbox = process.env.NEXT_PUBLIC_KKIAPAY_SANDBOX === 'true';

      return {
        success: true,
        orderNumber: order.orderNumber,
        paymentProvider: 'kkiapay' as const,
        amount: order.totalAmount,
        kkiapay: {
          publicKey,
          isSandbox,
          name: order.customerName,
          email: order.customerEmail || user.email,
          phone: order.customerPhone,
        },
      };
    } else {
      // FedaPay
      const fedaResult = await createFedaPayTransaction({
        orderNumber: order.orderNumber,
        amount: order.totalAmount,
        customerName: order.customerName,
        customerEmail: order.customerEmail || user.email,
        customerPhone: order.customerPhone,
        city: order.city,
      });

      if (!fedaResult.success || !fedaResult.paymentUrl) {
        return {
          success: false,
          error: fedaResult.error || 'Impossible de générer le lien de paiement FedaPay.',
        };
      }

      return {
        success: true,
        orderNumber: order.orderNumber,
        paymentProvider: 'fedapay' as const,
        paymentUrl: fedaResult.paymentUrl,
        transactionId: fedaResult.transactionId,
      };
    }
  } catch (error: any) {
    console.error('Erreur initPendingOrderPaymentAction :', error);
    return {
      success: false,
      error: error.message || 'Une erreur est survenue lors de la relance du paiement.',
    };
  }
}
