'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { generateOrderNumber } from '@/lib/utils';
import { verifyKkiapayTransaction } from '@/lib/payments/kkiapay';
import { createFedaPayTransaction, verifyFedaPayTransaction } from '@/lib/payments/fedapay';
import { PaymentGateway } from '@/lib/payments/types';
import { siteConfig } from '@/lib/site-config';
import { validateEmailDeliverability } from '@/lib/email-validator';
import { checkRateLimit } from '@/lib/rate-limiter';

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
  existingOrderNumber?: string;
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
  saveAddress?: boolean;
  addressLabel?: string;
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

    // Rate limiting: 15 initialisations de paiement par 10 minutes max par compte
    const rateLimitKey = `checkout_init_${user.id}`;
    const limit = checkRateLimit(rateLimitKey, { maxRequests: 15, windowMs: 10 * 60 * 1000 });
    if (!limit.isAllowed) {
      const minutesRemaining = Math.ceil(limit.resetInMs / (60 * 1000));
      return {
        success: false,
        error: `Trop d'initialisations de commande consécutives. Par sécurité, veuillez patienter ${minutesRemaining} minute(s).`,
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

    // 1. Recalcul strict et intègre des prix depuis la base de données
    if (!data.items || data.items.length === 0) {
      return { success: false, error: 'Votre panier ne contient aucun article.' };
    }

    const productIds = data.items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: { variants: true },
    });

    const dbProductMap = new Map(dbProducts.map((p) => [p.id, p]));

    let calculatedItemsTotal = 0;
    const validatedItems = data.items.map((item) => {
      const dbProd = dbProductMap.get(item.productId);
      if (!dbProd) {
        throw new Error(`Produit indisponible ou introuvable : ${item.productName}`);
      }

      let realPrice = dbProd.promoPrice || dbProd.basePrice;
      if (item.variantId) {
        const variant = dbProd.variants.find((v) => v.id === item.variantId);
        if (variant) {
          realPrice = variant.promoPrice || variant.priceOverride || realPrice;
        }
      }

      const qty = Math.max(1, Math.floor(item.quantity));
      calculatedItemsTotal += realPrice * qty;

      return {
        productId: item.productId,
        variantId: item.variantId || null,
        productName: dbProd.name,
        variantInfo: item.variantInfo || null,
        quantity: qty,
        unitPrice: realPrice,
      };
    });

    const realShipping = Math.max(0, Math.floor(data.shippingFee || 0));
    const realDiscount = Math.max(0, Math.floor(data.discountAmount || 0));
    const calculatedTotalAmount = Math.max(0, calculatedItemsTotal + realShipping - realDiscount);

    // Vérifier si une commande PENDING existe déjà pour cet utilisateur
    let existingPendingOrder = null;
    if (data.existingOrderNumber) {
      existingPendingOrder = await prisma.order.findFirst({
        where: {
          orderNumber: data.existingOrderNumber,
          userId: user.id,
          status: 'PENDING',
        },
      });
    }

    // Si aucun numéro explicite ou non trouvé, récupérer la dernière commande PENDING récente (moins de 2h)
    if (!existingPendingOrder) {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      existingPendingOrder = await prisma.order.findFirst({
        where: {
          userId: user.id,
          status: 'PENDING',
          createdAt: { gte: twoHoursAgo },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    let order;
    let orderNumber: string;

    if (existingPendingOrder) {
      orderNumber = existingPendingOrder.orderNumber;
      // Mise à jour de la commande PENDING existante sans créer de doublon
      await prisma.orderItem.deleteMany({
        where: { orderId: existingPendingOrder.id },
      });

      order = await prisma.order.update({
        where: { id: existingPendingOrder.id },
        data: {
          customerName: data.customerName,
          customerEmail: data.customerEmail || user.email,
          customerPhone: data.customerPhone,
          city: data.city,
          district: data.district,
          streetDetails: data.streetDetails,
          notes: data.notes || null,
          totalAmount: calculatedTotalAmount,
          shippingFee: realShipping,
          discountAmount: realDiscount,
          promoCode: data.promoCode || null,
          paymentProvider: data.paymentProvider,
          paymentRef: `${data.paymentProvider.toUpperCase()}-RETRY-${Date.now().toString().slice(-6)}`,
          items: {
            create: validatedItems,
          },
          statusHistory: {
            create: [
              {
                status: 'PENDING',
                note: `Nouvelle tentative de règlement via ${data.paymentProvider.toUpperCase()}`,
              },
            ],
          },
        },
      });
    } else {
      orderNumber = generateOrderNumber();

      // Création initiale de la commande en statut PENDING
      order = await prisma.order.create({
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
          totalAmount: calculatedTotalAmount,
          shippingFee: realShipping,
          discountAmount: realDiscount,
          promoCode: data.promoCode || null,
          paymentProvider: data.paymentProvider,
          paymentRef: `${data.paymentProvider.toUpperCase()}-INIT-${Date.now().toString().slice(-6)}`,
          items: {
            create: validatedItems,
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
    }

    // Nettoyer / annuler automatiquement les anciennes commandes PENDING orphelines pour ce compte
    try {
      await prisma.order.updateMany({
        where: {
          userId: user.id,
          status: 'PENDING',
          id: { not: order.id },
        },
        data: {
          status: 'CANCELLED',
        },
      });
    } catch (_) {}

    // Enregistrement optionnel dans le carnet d'adresses du client
    if (data.saveAddress && data.streetDetails && data.streetDetails.trim()) {
      try {
        const existingAddress = await prisma.address.findFirst({
          where: {
            userId: user.id,
            city: data.city.trim(),
            street: data.streetDetails.trim(),
          },
        });

        if (!existingAddress) {
          const count = await prisma.address.count({ where: { userId: user.id } });
          const label = data.addressLabel?.trim() || `${data.city} - ${data.district?.trim() || 'Livraison'}`;
          await prisma.address.create({
            data: {
              userId: user.id,
              label,
              city: data.city.trim(),
              district: data.district?.trim() || null,
              street: data.streetDetails.trim(),
              phone: data.customerPhone.trim(),
              isDefault: count === 0,
            },
          });
        }
      } catch (addrErr) {
        console.error('Erreur sauvegarde automatique adresse:', addrErr);
      }
    }

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

    // Vérification de concordance du montant payé vs montant de la commande
    if (verificationResult.amount && Number(verificationResult.amount) < order.totalAmount) {
      return {
        success: false,
        error: `Montant réglé (${verificationResult.amount} FCFA) inférieur au total de la commande (${order.totalAmount} FCFA).`,
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
