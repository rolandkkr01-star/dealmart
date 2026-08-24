'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { generateOrderNumber } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { siteConfig } from '@/lib/site-config';
import { validateEmailDeliverability } from '@/lib/email-validator';

/**
 * Création d'une commande en base de données
 */
export async function createOrderAction(data: {
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  city: string;
  district: string;
  streetDetails: string;
  notes?: string;
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  promoCode?: string;
  paymentProvider: string;
  paymentRef?: string;
  items: {
    productId: string;
    variantId?: string;
    productName: string;
    variantInfo?: string;
    quantity: number;
    unitPrice: number;
  }[];
}) {
  try {
    if (data.customerEmail && data.customerEmail.trim()) {
      const emailCheck = await validateEmailDeliverability(data.customerEmail);
      if (!emailCheck.isValid) {
        return { success: false, error: emailCheck.error || 'Adresse email de commande invalide ou injoignable.' };
      }
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        error: 'Session expirée ou non authentifiée. Veuillez vous connecter pour finaliser votre commande.',
      };
    }

    // Sauvegarde du numéro de téléphone sur le profil si non renseigné
    if (data.customerPhone && !currentUser.phone) {
      try {
        await prisma.user.update({
          where: { id: currentUser.id },
          data: { phone: data.customerPhone.trim() },
        });
      } catch (_) {}
    }

    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: currentUser.id,
        customerName: data.customerName,
        customerEmail: data.customerEmail || currentUser.email,
        customerPhone: data.customerPhone,
        city: data.city,
        district: data.district,
        streetDetails: data.streetDetails,
        notes: data.notes || null,
        status: 'PAID',
        totalAmount: data.totalAmount,
        shippingFee: data.shippingFee,
        discountAmount: data.discountAmount,
        promoCode: data.promoCode || null,
        paymentProvider: data.paymentProvider,
        paymentRef: data.paymentRef || `${data.paymentProvider.toUpperCase()}-BJ-${Math.floor(100000 + Math.random() * 900000)}`,
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
            { status: 'PENDING', note: `Commande enregistrée sur ${siteConfig.name}` },
            { status: 'PAID', note: `Paiement ${data.paymentProvider.toUpperCase()} validé avec succès` },
          ],
        },
      },
    });

    revalidatePath('/admin/commandes');
    revalidatePath('/compte/commandes');

    return { success: true, orderNumber: order.orderNumber };
  } catch (error: any) {
    return { success: false, error: 'Impossible d\'enregistrer la commande.' };
  }
}

/**
 * Récupère une commande par sa référence (Suivi public)
 */
export async function getOrderByNumberAction(orderNumber: string) {
  try {
    const cleanNumber = orderNumber.trim().toUpperCase();
    const order = await prisma.order.findUnique({
      where: { orderNumber: cleanNumber },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: { position: 'asc' }, take: 1 },
              },
            },
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      return { success: false, error: 'Commande introuvable' };
    }

    return {
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        city: order.city,
        district: order.district,
        streetDetails: order.streetDetails,
        notes: order.notes,
        status: order.status,
        totalAmount: order.totalAmount,
        shippingFee: order.shippingFee,
        discountAmount: order.discountAmount,
        promoCode: order.promoCode,
        paymentProvider: order.paymentProvider,
        paymentRef: order.paymentRef,
        createdAt: order.createdAt.toISOString(),
        items: order.items.map((it) => ({
          id: it.id,
          productId: it.productId,
          productName: it.productName,
          variantInfo: it.variantInfo,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          image: it.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=200&q=80',
        })),
        statusHistory: order.statusHistory.map((h) => ({
          id: h.id,
          status: h.status,
          note: h.note,
          createdAt: h.createdAt.toISOString(),
        })),
      },
    };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Erreur lors de la recherche.' };
  }
}

/**
 * Récupère les commandes de l'utilisateur connecté (Espace client)
 */
export async function getUserOrdersAction() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'UNAUTHORIZED', orders: [] };
    }

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { userId: user.id },
          { customerEmail: user.email },
        ],
      },
      include: {
        items: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      orders: orders.map((ord) => ({
        id: ord.id,
        orderNumber: ord.orderNumber,
        customerName: ord.customerName,
        customerPhone: ord.customerPhone,
        city: ord.city,
        district: ord.district,
        status: ord.status,
        totalAmount: ord.totalAmount,
        paymentProvider: ord.paymentProvider,
        createdAt: ord.createdAt.toISOString(),
        items: ord.items.map((it) => ({
          id: it.id,
          productName: it.productName,
          variantInfo: it.variantInfo,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
        })),
      })),
    };
  } catch (error: any) {
    return { success: false, error: error?.message, orders: [] };
  }
}

/**
 * Annule une commande en attente de paiement (par le client)
 */
export async function cancelPendingOrderAction(orderNumber: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Non authentifié' };

    const order = await prisma.order.findUnique({
      where: { orderNumber },
    });

    if (!order || (order.userId !== user.id && order.customerEmail !== user.email)) {
      return { success: false, error: 'Commande introuvable ou non autorisée.' };
    }

    if (order.status !== 'PENDING') {
      return { success: false, error: 'Seules les commandes en attente de paiement peuvent être annulées.' };
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED' },
      });
      await tx.orderStatusEvent.create({
        data: {
          orderId: order.id,
          status: 'CANCELLED',
          note: 'Commande annulée par le client depuis son espace personnel.',
        },
      });
    });

    revalidatePath('/compte/commandes');
    revalidatePath(`/commande/${orderNumber}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Erreur lors de l\'annulation' };
  }
}

/**
 * Récupère toutes les commandes (Panel Administrateur)
 */
export async function getAdminOrdersAction() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      return { success: false, error: 'UNAUTHORIZED', orders: [] };
    }

    const orders = await prisma.order.findMany({
      include: {
        items: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      orders: orders.map((ord) => ({
        id: ord.id,
        orderNumber: ord.orderNumber,
        customerName: ord.customerName,
        customerPhone: ord.customerPhone,
        customerEmail: ord.customerEmail,
        city: ord.city,
        district: ord.district,
        streetDetails: ord.streetDetails,
        notes: ord.notes,
        status: ord.status,
        totalAmount: ord.totalAmount,
        paymentProvider: ord.paymentProvider,
        paymentRef: ord.paymentRef,
        createdAt: ord.createdAt.toISOString(),
        items: ord.items.map((it) => ({
          id: it.id,
          productName: it.productName,
          variantInfo: it.variantInfo,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
        })),
      })),
    };
  } catch (error: any) {
    return { success: false, error: error?.message, orders: [] };
  }
}

/**
 * Mise à jour du statut d'une commande par l'administrateur
 */
export async function updateOrderStatusAction(orderId: string, newStatus: string, note?: string) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      return { success: false, error: 'UNAUTHORIZED' };
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        statusHistory: {
          create: {
            status: newStatus,
            note: note || `Statut mis à jour en ${newStatus} par ${user.firstName} ${user.lastName}`,
          },
        },
      },
    });

    try {
      await prisma.auditLog.create({
        data: {
          adminUserId: user.id,
          adminEmail: user.email,
          action: `order.status_updated_${newStatus.toLowerCase()}`,
          targetType: 'Order',
          targetId: orderId,
          metadata: JSON.stringify({ status: newStatus, note }),
        },
      });
    } catch (_) {}

    revalidatePath('/admin/commandes');
    revalidatePath('/compte/commandes');

    return { success: true, order };
  } catch (error: any) {
    return { success: false, error: 'Action non autorisée ou erreur serveur.' };
  }
}
