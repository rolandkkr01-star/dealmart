'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

/**
 * Soumettre un avis client sur un produit
 */
export async function submitReviewAction(data: {
  productId: string;
  authorName: string;
  city?: string;
  rating: number;
  comment: string;
}) {
  try {
    if (!data.productId || !data.authorName || !data.comment) {
      return { success: false, error: 'Champs obligatoires manquants.' };
    }

    const review = await prisma.review.create({
      data: {
        productId: data.productId,
        authorName: data.authorName.trim(),
        city: data.city?.trim() || 'Honiara, Solomon Islands',
        rating: Math.min(5, Math.max(1, data.rating)),
        comment: data.comment.trim(),
        isApproved: true,
        isFeaturedHome: false,
      },
    });

    // Mettre à jour la moyenne et le nombre d'avis sur le produit
    const allProductReviews = await prisma.review.findMany({
      where: { productId: data.productId, isApproved: true },
      select: { rating: true },
    });

    const reviewsCount = allProductReviews.length;
    const avgRating = reviewsCount > 0
      ? Number((allProductReviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount).toFixed(1))
      : 5.0;

    await prisma.product.update({
      where: { id: data.productId },
      data: {
        reviewsCount,
        rating: avgRating,
      },
    });

    revalidatePath('/');
    revalidatePath(`/produit/[slug]`, 'page');

    return { success: true, review };
  } catch (error) {
    console.error('Erreur soumission avis:', error);
    return { success: false, error: 'Impossible d\'enregistrer votre avis.' };
  }
}

/**
 * Récupérer les avis approuvés d'un produit
 */
export async function getProductReviewsAction(productId: string) {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId, isApproved: true },
      orderBy: { createdAt: 'desc' },
    });
    return reviews;
  } catch (error) {
    console.error('Erreur récupération avis produit:', error);
    return [];
  }
}

/**
 * Récupérer les 3 avis mis en avant pour la page d'accueil
 */
export async function getFeaturedHomeReviewsAction() {
  try {
    // 1. Chercher d'abord les avis explicitement cochés "isFeaturedHome: true"
    let featured = await prisma.review.findMany({
      where: { isFeaturedHome: true, isApproved: true },
      include: {
        product: {
          select: { name: true, slug: true, images: { take: 1, select: { url: true } } }
        }
      },
      take: 3,
      orderBy: { createdAt: 'desc' },
    });

    // 2. Si moins de 3 sont choisis, compléter avec les meilleurs avis 5 étoiles
    if (featured.length < 3) {
      const existingIds = featured.map((f) => f.id);
      const remainingCount = 3 - featured.length;

      const fallback = await prisma.review.findMany({
        where: {
          id: { notIn: existingIds },
          isApproved: true,
          rating: 5,
        },
        include: {
          product: {
            select: { name: true, slug: true, images: { take: 1, select: { url: true } } }
          }
        },
        take: remainingCount,
        orderBy: { createdAt: 'desc' },
      });

      featured = [...featured, ...fallback];
    }

    return featured.map((r) => ({
      id: r.id,
      name: r.authorName,
      city: r.city || 'Honiara, Solomon Islands',
      rating: r.rating,
      comment: r.comment,
      productName: r.product?.name || 'Smartphone',
      productSlug: r.product?.slug,
      productImage: r.product?.images?.[0]?.url,
      date: new Date(r.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      isFeaturedHome: r.isFeaturedHome,
    }));
  } catch (error) {
    console.error('Erreur récupération avis accueil:', error);
    return [];
  }
}

/**
 * [Admin] Récupérer tous les avis clients pour modération
 */
export async function getAllReviewsAdminAction() {
  await requireAdmin();
  try {
    const reviews = await prisma.review.findMany({
      include: {
        product: {
          select: { name: true, slug: true, images: { take: 1, select: { url: true } } }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return reviews;
  } catch (error) {
    console.error('Erreur admin avis:', error);
    return [];
  }
}

/**
 * [Admin] Basculer la mise en avant d'un avis sur l'accueil (Max 3)
 */
export async function toggleFeatureReviewAction(reviewId: string) {
  await requireAdmin();
  try {
    const current = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!current) {
      return { success: false, error: 'Avis introuvable.' };
    }

    const willBeFeatured = !current.isFeaturedHome;

    if (willBeFeatured) {
      const countFeatured = await prisma.review.count({
        where: { isFeaturedHome: true },
      });

      if (countFeatured >= 3) {
        return {
          success: false,
          error: 'Vous avez déjà sélectionné 3 avis pour la page d\'accueil. Décochez-en un avant d\'en ajouter un nouveau.'
        };
      }
    }

    await prisma.review.update({
      where: { id: reviewId },
      data: { isFeaturedHome: willBeFeatured, isApproved: true },
    });

    revalidatePath('/');
    revalidatePath('/admin/avis');

    return { success: true, isFeaturedHome: willBeFeatured };
  } catch (error) {
    console.error('Erreur basculement mise en avant:', error);
    return { success: false, error: 'Erreur lors de la mise à jour.' };
  }
}

/**
 * [Admin] Supprimer un avis client
 */
export async function deleteReviewAction(reviewId: string) {
  await requireAdmin();
  try {
    const review = await prisma.review.delete({
      where: { id: reviewId },
    });

    // Mettre à jour la moyenne du produit
    const allReviews = await prisma.review.findMany({
      where: { productId: review.productId, isApproved: true },
      select: { rating: true },
    });

    const reviewsCount = allReviews.length;
    const avgRating = reviewsCount > 0
      ? Number((allReviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount).toFixed(1))
      : 5.0;

    await prisma.product.update({
      where: { id: review.productId },
      data: { reviewsCount, rating: avgRating },
    });

    revalidatePath('/');
    revalidatePath('/admin/avis');

    return { success: true };
  } catch (error) {
    console.error('Erreur suppression avis:', error);
    return { success: false, error: 'Impossible de supprimer cet avis.' };
  }
}
