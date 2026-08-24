'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin, getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { slugify } from '@/lib/utils';

const VariantSchema = z.object({
  storage: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  colorCode: z.string().optional().nullable(),
  priceOverride: z.number().optional().nullable(),
  promoPrice: z.number().optional().nullable(),
  stock: z.number().min(0, 'Le stock doit être supérieur ou égal à 0'),
  sku: z.string().optional().nullable(),
});

const ImageSchema = z.object({
  url: z.string().min(1, 'Le chemin ou l\'URL de l\'image est obligatoire'),
  altText: z.string().min(3, 'Le texte alternatif (SEO/Accessibilité) est obligatoire'),
  position: z.number().default(0),
});

const ProductInputSchema = z.object({
  name: z.string().min(3, 'Le nom du produit doit contenir au moins 3 caractères'),
  slug: z.string().optional(),
  description: z.string().min(10, 'La description doit être détaillée (10 caractères min)'),
  brand: z.enum(['IPHONE', 'SAMSUNG', 'ACCESSOIRE']),
  categoryId: z.string().min(1, 'Veuillez sélectionner une catégorie'),
  condition: z.enum(['NEUF_SCELLE', 'NEUF_NON_SCELLE', 'OCCASION']),
  tradeEligible: z.boolean().default(false),
  basePrice: z.number().min(100, 'Le prix de base doit être d\'au moins 100 FCFA'),
  promoPrice: z.number().optional().nullable(),
  warrantyMonths: z.number().default(12),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  specs: z.record(z.string(), z.string()).optional(),
  variants: z.array(VariantSchema).min(1, 'Au moins une variante (stock/prix) est requise'),
  images: z.array(ImageSchema).min(1, 'Au moins une image avec description SEO est requise'),
});

export type ProductInput = z.infer<typeof ProductInputSchema>;

async function checkAdminAuth() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
    return { isAuthorized: false, user: null };
  }
  return { isAuthorized: true, user };
}

/**
 * Récupère tous les produits pour le panel admin
 */
export async function getAdminProductsAction() {
  try {
    const auth = await checkAdminAuth();
    if (!auth.isAuthorized) {
      return { success: false, error: 'UNAUTHORIZED' };
    }

    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: true,
        images: { orderBy: { position: 'asc' } },
        _count: {
          select: {
            orderItems: true,
            tradeOffers: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, products };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Erreur serveur.' };
  }
}

/**
 * Récupère un produit par son ID pour édition
 */
export async function getAdminProductByIdAction(id: string) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.isAuthorized) {
      return { success: false, error: 'UNAUTHORIZED' };
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
        images: { orderBy: { position: 'asc' } },
      },
    });

    if (!product) {
      return { success: false, error: 'Produit non trouvé.' };
    }

    return { success: true, product };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Erreur lors de la récupération du produit.' };
  }
}

/**
 * Récupère la liste des catégories
 */
export async function getCategoriesAction() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    return { success: true, categories };
  } catch (error) {
    return { success: false, categories: [] };
  }
}

/**
 * Création d'un produit (CRUD Create)
 */
export async function createProductAction(rawData: any) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.isAuthorized || !auth.user) {
      return { success: false, error: 'UNAUTHORIZED' };
    }
    const admin = auth.user;
    const validated = ProductInputSchema.parse(rawData);

    const generatedSlug = validated.slug && validated.slug.trim().length > 0
      ? slugify(validated.slug)
      : slugify(validated.name);

    // Vérifier l'unicité du slug
    const existing = await prisma.product.findUnique({
      where: { slug: generatedSlug },
    });

    const finalSlug = existing ? `${generatedSlug}-${Date.now().toString().slice(-4)}` : generatedSlug;

    // Création transactionnelle du produit, de ses images et de ses variantes
    const createdProduct = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: validated.name,
          slug: finalSlug,
          description: validated.description,
          brand: validated.brand,
          categoryId: validated.categoryId,
          condition: validated.condition,
          tradeEligible: validated.tradeEligible,
          basePrice: validated.basePrice,
          promoPrice: validated.promoPrice || null,
          warrantyMonths: validated.warrantyMonths,
          isFeatured: validated.isFeatured,
          isActive: validated.isActive,
          specsJson: validated.specs ? JSON.stringify(validated.specs) : null,
          images: {
            create: validated.images.map((img, idx) => ({
              url: img.url,
              altText: img.altText,
              position: img.position ?? idx,
            })),
          },
          variants: {
            create: validated.variants.map((v, vIdx) => {
              let finalSku = v.sku?.trim();
              if (!finalSku || finalSku.length === 0) {
                const brandCode = validated.brand === 'IPHONE' ? 'APL' : validated.brand === 'SAMSUNG' ? 'SAM' : 'ACC';
                const nameClean = validated.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
                const storageClean = v.storage ? v.storage.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : 'STD';
                const colorClean = v.color ? v.color.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase() : 'DEF';
                const rand = Math.floor(1000 + Math.random() * 9000);
                finalSku = `TP229-${brandCode}-${nameClean}-${storageClean}-${colorClean}-${rand}`;
              }
              return {
                storage: v.storage || null,
                color: v.color || null,
                colorCode: v.colorCode || null,
                priceOverride: v.priceOverride || null,
                promoPrice: v.promoPrice || null,
                stock: v.stock,
                sku: finalSku,
              };
            }),
          },
        },
        include: {
          variants: true,
          images: true,
        },
      });

      // Journal d'audit
      await tx.auditLog.create({
        data: {
          adminUserId: admin.id,
          adminEmail: admin.email,
          action: 'product.created',
          targetType: 'Product',
          targetId: product.id,
          metadata: JSON.stringify({ name: product.name, basePrice: product.basePrice, skuList: product.variants.map((v) => v.sku) }),
        },
      });

      return product;
    });

    revalidatePath('/');
    revalidatePath('/boutique');
    revalidatePath('/admin/produits');

    return { success: true, product: createdProduct };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues?.[0]?.message || 'Données invalides.' };
    }
    return { success: false, error: error?.message || 'Erreur lors de la création du produit.' };
  }
}

/**
 * Mise à jour d'un produit (CRUD Update)
 */
export async function updateProductAction(id: string, rawData: any) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.isAuthorized || !auth.user) {
      return { success: false, error: 'UNAUTHORIZED' };
    }
    const admin = auth.user;
    const validated = ProductInputSchema.parse(rawData);

    const updatedProduct = await prisma.$transaction(async (tx) => {
      // 1. Supprimer les anciennes variantes et images associées pour les recréer proprement
      await tx.productVariant.deleteMany({ where: { productId: id } });
      await tx.productImage.deleteMany({ where: { productId: id } });

      // 2. Mettre à jour le produit
      const product = await tx.product.update({
        where: { id },
        data: {
          name: validated.name,
          description: validated.description,
          brand: validated.brand,
          categoryId: validated.categoryId,
          condition: validated.condition,
          tradeEligible: validated.tradeEligible,
          basePrice: validated.basePrice,
          promoPrice: validated.promoPrice || null,
          warrantyMonths: validated.warrantyMonths,
          isFeatured: validated.isFeatured,
          isActive: validated.isActive,
          specsJson: validated.specs ? JSON.stringify(validated.specs) : null,
          images: {
            create: validated.images.map((img, idx) => ({
              url: img.url,
              altText: img.altText,
              position: img.position ?? idx,
            })),
          },
          variants: {
            create: validated.variants.map((v) => {
              let finalSku = v.sku?.trim();
              if (!finalSku || finalSku.length === 0) {
                const brandCode = validated.brand === 'IPHONE' ? 'APL' : validated.brand === 'SAMSUNG' ? 'SAM' : 'ACC';
                const nameClean = validated.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
                const storageClean = v.storage ? v.storage.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : 'STD';
                const colorClean = v.color ? v.color.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase() : 'DEF';
                const rand = Math.floor(1000 + Math.random() * 9000);
                finalSku = `TP229-${brandCode}-${nameClean}-${storageClean}-${colorClean}-${rand}`;
              }
              return {
                storage: v.storage || null,
                color: v.color || null,
                colorCode: v.colorCode || null,
                priceOverride: v.priceOverride || null,
                promoPrice: v.promoPrice || null,
                stock: v.stock,
                sku: finalSku,
              };
            }),
          },
        },
        include: {
          variants: true,
          images: true,
        },
      });

      // Journal d'audit
      await tx.auditLog.create({
        data: {
          adminUserId: admin.id,
          adminEmail: admin.email,
          action: 'product.updated',
          targetType: 'Product',
          targetId: id,
          metadata: JSON.stringify({ name: product.name, basePrice: product.basePrice }),
        },
      });

      return product;
    });

    revalidatePath('/');
    revalidatePath('/boutique');
    revalidatePath(`/produit/${updatedProduct.slug}`);
    revalidatePath('/admin/produits');

    return { success: true, product: updatedProduct };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues?.[0]?.message || 'Données invalides.' };
    }
    return { success: false, error: error?.message || 'Erreur lors de la modification du produit.' };
  }
}

/**
 * Suppression d'un produit (CRUD Delete)
 */
export async function deleteProductAction(id: string) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.isAuthorized || !auth.user) {
      return { success: false, error: 'UNAUTHORIZED' };
    }
    const admin = auth.user;

    const product = await prisma.product.findUnique({
      where: { id },
      select: { name: true, slug: true },
    });

    if (!product) {
      return { success: false, error: 'Produit introuvable.' };
    }

    await prisma.product.delete({
      where: { id },
    });

    // Journal d'audit
    await txAudit(admin.id, admin.email, 'product.deleted', 'Product', id, { name: product.name, slug: product.slug });

    revalidatePath('/');
    revalidatePath('/boutique');
    revalidatePath('/admin/produits');

    return { success: true };
  } catch (error: any) {
    return { success: false, error: 'Impossible de supprimer ce produit (peut-être lié à une commande passée).' };
  }
}

async function txAudit(adminUserId: string, adminEmail: string, action: string, targetType: string, targetId: string, metadata?: any) {
  try {
    await prisma.auditLog.create({
      data: {
        adminUserId,
        adminEmail,
        action,
        targetType,
        targetId,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (_) {}
}

/**
 * Bascule rapide du statut Actif / Inactif
 */
export async function toggleProductStatusAction(id: string, isActive: boolean) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.isAuthorized || !auth.user) {
      return { success: false, error: 'UNAUTHORIZED' };
    }
    const admin = auth.user;

    const updated = await prisma.product.update({
      where: { id },
      data: { isActive },
    });

    await txAudit(admin.id, admin.email, isActive ? 'product.activated' : 'product.deactivated', 'Product', id);

    revalidatePath('/');
    revalidatePath('/boutique');
    revalidatePath('/admin/produits');

    return { success: true, isActive: updated.isActive };
  } catch (error: any) {
    return { success: false, error: 'Erreur mise à jour statut.' };
  }
}
