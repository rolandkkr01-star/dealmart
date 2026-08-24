'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { siteConfig } from '@/lib/site-config';
import { TradeComplementDirection, TradeOfferStatus } from '@/types';

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
  complementDirection?: TradeComplementDirection;
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
        offeredDevicePhotosJson: JSON.stringify(data.offeredDevicePhotos || []),
        complementDirection: data.complementDirection || (data.cashComplement ? 'CLIENT_TO_STORE' : 'NONE'),
        cashComplement: data.cashComplement || null,
        status: 'PENDING',
      },
    });

    revalidatePath('/admin/troc');
    revalidatePath('/compte/troc');

    return { success: true, tradeId: newTrade.id };
  } catch (error: any) {
    console.error('Error submitting trade offer:', error);
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
            images: {
              take: 1,
              orderBy: { position: 'asc' },
              select: { url: true },
            },
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
        productSlug: off.product?.slug || '',
        productImage: off.product?.images?.[0]?.url || '',
        targetProductPrice: off.product?.basePrice || 0,
        customerName: off.customerName,
        customerPhone: off.customerPhone,
        customerEmail: off.customerEmail || '',
        customerCity: off.customerCity,
        offeredDeviceModel: off.offeredDeviceModel,
        offeredDeviceDescription: off.offeredDeviceDescription,
        offeredDeviceCondition: off.offeredDeviceCondition as any,
        offeredDevicePhotos: off.offeredDevicePhotosJson ? JSON.parse(off.offeredDevicePhotosJson) : [],
        complementDirection: (off.complementDirection || 'CLIENT_TO_STORE') as TradeComplementDirection,
        cashComplement: off.cashComplement || 0,
        status: off.status as TradeOfferStatus,
        adminNote: off.adminNote || '',
        counterComplementDirection: (off.counterComplementDirection as TradeComplementDirection) || null,
        counterOfferAmount: off.counterOfferAmount || 0,
        createdAt: off.createdAt.toISOString(),
        updatedAt: off.updatedAt.toISOString(),
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
            images: {
              take: 1,
              orderBy: { position: 'asc' },
              select: { url: true },
            },
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
        productName: off.product?.name || `Article ${siteConfig.name}`,
        productSlug: off.product?.slug || '',
        productImage: off.product?.images?.[0]?.url || '',
        targetProductPrice: off.product?.basePrice || 0,
        customerName: off.customerName,
        customerPhone: off.customerPhone,
        customerEmail: off.customerEmail || '',
        customerCity: off.customerCity,
        offeredDeviceModel: off.offeredDeviceModel,
        offeredDeviceDescription: off.offeredDeviceDescription,
        offeredDeviceCondition: off.offeredDeviceCondition as any,
        offeredDevicePhotos: off.offeredDevicePhotosJson ? JSON.parse(off.offeredDevicePhotosJson) : [],
        complementDirection: (off.complementDirection || 'CLIENT_TO_STORE') as TradeComplementDirection,
        cashComplement: off.cashComplement || 0,
        status: off.status as TradeOfferStatus,
        adminNote: off.adminNote || '',
        counterComplementDirection: (off.counterComplementDirection as TradeComplementDirection) || null,
        counterOfferAmount: off.counterOfferAmount || 0,
        createdAt: off.createdAt.toISOString(),
        updatedAt: off.updatedAt.toISOString(),
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
  status: TradeOfferStatus;
  adminNote?: string;
  counterComplementDirection?: TradeComplementDirection;
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
        counterComplementDirection: data.counterComplementDirection || null,
        counterOfferAmount: data.counterOfferAmount || null,
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
            counterComplementDirection: data.counterComplementDirection,
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

/**
 * Action Client : Accepter une contre-proposition de l'administrateur
 */
export async function clientAcceptCounterOfferAction(tradeId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Veuillez vous connecter pour valider.' };
    }

    const offer = await prisma.tradeOffer.findUnique({
      where: { id: tradeId },
    });

    if (!offer || (offer.userId !== user.id && offer.customerEmail !== user.email)) {
      return { success: false, error: 'Demande introuvable ou non autorisée.' };
    }

    if (offer.status !== 'COUNTERED') {
      return { success: false, error: 'Cette offre n\'a pas de contre-proposition en attente.' };
    }

    const updated = await prisma.tradeOffer.update({
      where: { id: tradeId },
      data: {
        status: 'ACCEPTED',
      },
    });

    revalidatePath('/compte/troc');
    revalidatePath('/admin/troc');

    return { success: true, trade: updated };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Erreur lors de l\'acceptation.' };
  }
}

/**
 * Action Client : Annuler ou Décliner une proposition de troc
 */
export async function clientCancelTradeOfferAction(tradeId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Veuillez vous connecter pour annuler.' };
    }

    const offer = await prisma.tradeOffer.findUnique({
      where: { id: tradeId },
    });

    if (!offer || (offer.userId !== user.id && offer.customerEmail !== user.email)) {
      return { success: false, error: 'Demande introuvable ou non autorisée.' };
    }

    if (offer.status === 'COMPLETED') {
      return { success: false, error: 'Un troc déjà finalisé ne peut plus être annulé.' };
    }

    const updated = await prisma.tradeOffer.update({
      where: { id: tradeId },
      data: {
        status: 'REJECTED',
        adminNote: offer.adminNote
          ? `${offer.adminNote}\n(Annulée par le client le ${new Date().toLocaleDateString('fr-FR')})`
          : `Annulée à l'initiative du client le ${new Date().toLocaleDateString('fr-FR')}`,
      },
    });

    revalidatePath('/compte/troc');
    revalidatePath('/admin/troc');

    return { success: true, trade: updated };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Erreur lors de l\'annulation.' };
  }
}

/**
 * Action Admin : Finaliser et Clôturer un Troc (Passage en boutique physique ou coursier)
 */
export async function adminCompleteTradeAction(tradeId: string, finalNote?: string) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      return { success: false, error: 'UNAUTHORIZED' };
    }

    const updated = await prisma.tradeOffer.update({
      where: { id: tradeId },
      data: {
        status: 'COMPLETED',
        adminNote: finalNote || undefined,
      },
    });

    try {
      await prisma.auditLog.create({
        data: {
          adminUserId: user.id,
          adminEmail: user.email,
          action: 'trade.completed',
          targetType: 'TradeOffer',
          targetId: tradeId,
          metadata: JSON.stringify({
            status: 'COMPLETED',
            finalNote,
          }),
        },
      });
    } catch (_) {}

    revalidatePath('/admin/troc');
    revalidatePath('/compte/troc');

    return { success: true, trade: updated };
  } catch (error: any) {
    return { success: false, error: 'Erreur lors de la finalisation du troc.' };
  }
}
