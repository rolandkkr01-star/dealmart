import React from 'react';
import { prisma } from '@/lib/prisma';
import { Product } from '@/types';
import { HomePageClient } from '@/components/home/HomePageClient';
import { getFeaturedHomeReviewsAction } from '@/actions/reviews';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [dbProducts, featuredReviews] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
        variants: true,
        images: { orderBy: { position: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    getFeaturedHomeReviewsAction(),
  ]);

  const products: Product[] = dbProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    shortDescription: p.description.slice(0, 120),
    brand: p.brand as any,
    categoryId: p.categoryId,
    categoryName: p.category?.name || '',
    condition: p.condition as any,
    tradeEligible: p.tradeEligible,
    basePrice: p.basePrice,
    promoPrice: p.promoPrice || undefined,
    warrantyMonths: p.warrantyMonths,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    isBestSeller: p.isFeatured,
    isNewArrival: true,
    rating: p.rating || 5.0,
    reviewsCount: p.reviewsCount || 0,
    images: p.images.map((img) => ({
      id: img.id,
      url: img.url,
      altText: img.altText,
      position: img.position,
    })),
    variants: p.variants.map((v) => ({
      id: v.id,
      productId: p.id,
      storage: v.storage || undefined,
      color: v.color || undefined,
      colorCode: v.colorCode || undefined,
      priceOverride: v.priceOverride || undefined,
      promoPrice: v.promoPrice || undefined,
      stock: v.stock,
      sku: v.sku,
    })),
    specs: p.specsJson ? JSON.parse(p.specsJson) : undefined,
    createdAt: p.createdAt.toISOString(),
  }));

  return <HomePageClient initialProducts={products} featuredReviews={featuredReviews} />;
}
