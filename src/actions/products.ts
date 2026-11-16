'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getProductsAction() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        images: { orderBy: { position: 'asc' } },
        variants: true,
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return products;
  } catch (error) {
    console.error('Erreur récupération produits:', error);
    return [];
  }
}

export async function getProductBySlugAction(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { position: 'asc' } },
        variants: true,
        category: true,
      },
    });
    return product;
  } catch (error) {
    console.error('Erreur récupération produit par slug:', error);
    return null;
  }
}

export async function updateProductStockAndPriceAction(data: {
  productId: string;
  basePrice: number;
  promoPrice?: number;
}) {
  try {
    const admin = await requireAdmin();

    const updated = await prisma.product.update({
      where: { id: data.productId },
      data: {
        basePrice: data.basePrice,
        promoPrice: data.promoPrice || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminUserId: admin.id,
        adminEmail: admin.email,
        action: 'product.price_and_settings_updated',
        targetType: 'Product',
        targetId: data.productId,
        metadata: JSON.stringify(data),
      },
    });

    revalidatePath('/boutique');
    revalidatePath('/admin/produits');

    return { success: true, product: updated };
  } catch (error: any) {
    console.error('Erreur modification produit:', error);
    return { success: false, error: 'Action non autorisée.' };
  }
}
