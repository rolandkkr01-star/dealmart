'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const addressSchema = z.object({
  label: z.string().min(2, 'Le libellé doit comporter au moins 2 caractères'),
  city: z.string().min(2, 'La ville est requise'),
  district: z.string().optional().nullable(),
  street: z.string().min(3, 'Le repère ou l\'adresse précise est requis'),
  phone: z.string().min(8, 'Le numéro de téléphone doit être valide'),
  isDefault: z.boolean().optional().default(false),
});

/**
 * Récupère la liste des adresses enregistrées du client connecté
 */
export async function getUserAddressesAction() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'Non authentifié', addresses: [] };
    }

    const addresses = await prisma.address.findMany({
      where: { userId: currentUser.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return {
      success: true,
      addresses: addresses.map((a) => ({
        id: a.id,
        userId: a.userId,
        label: a.label,
        city: a.city,
        district: a.district || '',
        street: a.street,
        phone: a.phone,
        isDefault: a.isDefault,
        createdAt: a.createdAt.toISOString(),
      })),
    };
  } catch (error: any) {
    console.error('Erreur getUserAddressesAction:', error);
    return { success: false, error: 'Impossible de récupérer vos adresses.', addresses: [] };
  }
}

/**
 * Enregistre une nouvelle adresse pour le client connecté
 */
export async function saveUserAddressAction(data: {
  label: string;
  city: string;
  district?: string;
  street: string;
  phone: string;
  isDefault?: boolean;
}) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'Vous devez être connecté pour enregistrer une adresse.' };
    }

    const parsed = addressSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Données d\'adresse invalides.' };
    }

    const count = await prisma.address.count({ where: { userId: currentUser.id } });
    const isFirst = count === 0;
    const shouldBeDefault = parsed.data.isDefault || isFirst;

    if (shouldBeDefault) {
      await prisma.address.updateMany({
        where: { userId: currentUser.id },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId: currentUser.id,
        label: parsed.data.label.trim(),
        city: parsed.data.city.trim(),
        district: parsed.data.district ? parsed.data.district.trim() : null,
        street: parsed.data.street.trim(),
        phone: parsed.data.phone.trim(),
        isDefault: shouldBeDefault,
      },
    });

    revalidatePath('/compte');
    revalidatePath('/compte/adresses');
    revalidatePath('/checkout');

    return {
      success: true,
      address: {
        id: newAddress.id,
        userId: newAddress.userId,
        label: newAddress.label,
        city: newAddress.city,
        district: newAddress.district || '',
        street: newAddress.street,
        phone: newAddress.phone,
        isDefault: newAddress.isDefault,
        createdAt: newAddress.createdAt.toISOString(),
      },
    };
  } catch (error: any) {
    console.error('Erreur saveUserAddressAction:', error);
    return { success: false, error: 'Impossible d\'enregistrer l\'adresse.' };
  }
}

/**
 * Supprime une adresse appartenant au client connecté
 */
export async function deleteUserAddressAction(addressId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'Non authentifié' };
    }

    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId: currentUser.id },
    });

    if (!existing) {
      return { success: false, error: 'Adresse introuvable ou non autorisée.' };
    }

    await prisma.address.delete({ where: { id: addressId } });

    if (existing.isDefault) {
      const firstRemaining = await prisma.address.findFirst({
        where: { userId: currentUser.id },
        orderBy: { createdAt: 'desc' },
      });
      if (firstRemaining) {
        await prisma.address.update({
          where: { id: firstRemaining.id },
          data: { isDefault: true },
        });
      }
    }

    revalidatePath('/compte');
    revalidatePath('/compte/adresses');
    revalidatePath('/checkout');

    return { success: true };
  } catch (error: any) {
    console.error('Erreur deleteUserAddressAction:', error);
    return { success: false, error: 'Impossible de supprimer cette adresse.' };
  }
}

/**
 * Définit une adresse comme adresse par défaut
 */
export async function setDefaultAddressAction(addressId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'Non authentifié' };
    }

    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId: currentUser.id },
    });

    if (!existing) {
      return { success: false, error: 'Adresse introuvable.' };
    }

    await prisma.address.updateMany({
      where: { userId: currentUser.id },
      data: { isDefault: false },
    });

    await prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });

    revalidatePath('/compte');
    revalidatePath('/compte/adresses');
    revalidatePath('/checkout');

    return { success: true };
  } catch (error: any) {
    console.error('Erreur setDefaultAddressAction:', error);
    return { success: false, error: 'Impossible de modifier l\'adresse par défaut.' };
  }
}
