'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

/**
 * Enregistrement d'une proposition de troc en BDD
 */
export async function submitTradeAction(data: {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerCity: string;
  productId: string;
  offeredDeviceModel: string;
  offeredDeviceDescription: string;
  offeredDeviceCondition: string;
  offeredDevicePhotos: string[];
  cashComplement?: number;
}) {
  try {
    const currentUser = await getCurrentUser();

    const newTrade = await prisma.tradeOffer.create({
      data: {
        userId: currentUser?.id || null,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail || currentUser?.email || null,
        customerCity: data.customerCity,
        productId: data.productId,
        offeredDeviceModel: data.offeredDeviceModel,
        offeredDeviceDescription: data.offeredDeviceDescription,
        offeredDeviceCondition: data.offeredDeviceCondition,
        offeredDevicePhotosJson: JSON.stringify(data.offeredDevicePhotos),
        cashComplement: data.cashComplement || null,
        status: 'PENDING',
      },
    });

    revalidatePath('/admin/troc');
    revalidatePath('/compte/troc');

    return { success: true, tradeId: newTrade.id };
  } catch (error: any) {
    return { success: false, error: 'Impossible d\'enregistrer la proposition de troc.' };
  }
}

/**
 * Récupère les propositions de troc du client connecté
 */
export async function getUserTradeOffersAction() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'UNAUTHORIZED', offers: [] };
    }

    const offers = await prisma.tradeOffer.findMany({
      where: {
        OR: [
          { userId: user.id },
          { customerEmail: user.email },
        ],
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      offers: offers.map((off) => ({
        id: off.id,
        productId: off.productId,
        productName: off.product?.name || 'Produit indisponible',
        targetProductPrice: off.product?.basePrice || 0,
        customerName: off.customerName,
        customerPhone: off.customerPhone,
        customerCity: off.customerCity,
        offeredDeviceModel: off.offeredDeviceModel,
        offeredDeviceDescription: off.offeredDeviceDescription,
        offeredDeviceCondition: off.offeredDeviceCondition,
        offeredDevicePhotos: off.offeredDevicePhotosJson ? JSON.parse(off.offeredDevicePhotosJson) : [],
        cashComplement: off.cashComplement,
        status: off.status,
        adminNote: off.adminNote,
        counterOfferAmount: off.counterOfferAmount,
        createdAt: off.createdAt.toISOString(),
      })),
    };
  } catch (error: any) {
    return { success: false, error: error?.message, offers: [] };
  }
}

/**
 * Récupère toutes les propositions de troc pour l'administrateur
 */
export async function getAdminTradeOffersAction() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      return { success: false, error: 'UNAUTHORIZED', offers: [] };
    }

    const offers = await prisma.tradeOffer.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      offers: offers.map((off) => ({
        id: off.id,
        productId: off.productId,
        productName: off.product?.name || 'Article TechPhone229',
        targetProductPrice: off.product?.basePrice || 0,
        customerName: off.customerName,
        customerPhone: off.customerPhone,
        customerEmail: off.customerEmail,
        customerCity: off.customerCity,
        offeredDeviceModel: off.offeredDeviceModel,
        offeredDeviceDescription: off.offeredDeviceDescription,
        offeredDeviceCondition: off.offeredDeviceCondition,
        offeredDevicePhotos: off.offeredDevicePhotosJson ? JSON.parse(off.offeredDevicePhotosJson) : [],
        cashComplement: off.cashComplement,
        status: off.status,
        adminNote: off.adminNote,
        counterOfferAmount: off.counterOfferAmount,
        createdAt: off.createdAt.toISOString(),
      })),
    };
  } catch (error: any) {
    return { success: false, error: error?.message, offers: [] };
  }
}

/**
 * Traitement d'une proposition de troc par l'administrateur
 */
export async function updateTradeStatusAction(data: {
  tradeId: string;
  status: 'PENDING' | 'ACCEPTED' | 'COUNTERED' | 'REJECTED' | 'COMPLETED';
  adminNote?: string;
  counterOfferAmount?: number;
}) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      return { success: false, error: 'UNAUTHORIZED' };
    }

    const updated = await prisma.tradeOffer.update({
      where: { id: data.tradeId },
      data: {
        status: data.status,
        adminNote: data.adminNote,
        counterOfferAmount: data.counterOfferAmount,
      },
    });

    try {
      await prisma.auditLog.create({
        data: {
          adminUserId: user.id,
          adminEmail: user.email,
          action: `trade.status_changed_${data.status.toLowerCase()}`,
          targetType: 'TradeOffer',
          targetId: data.tradeId,
          metadata: JSON.stringify({
            status: data.status,
            adminNote: data.adminNote,
            counterOfferAmount: data.counterOfferAmount,
          }),
        },
      });
    } catch (_) {}

    revalidatePath('/admin/troc');
    revalidatePath('/compte/troc');

    return { success: true, trade: updated };
  } catch (error: any) {
    return { success: false, error: 'Action non autorisée ou erreur serveur.' };
  }
}
