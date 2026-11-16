'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { formatPrice, getDiscountPercentage, getConditionBadgeInfo } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { Icons } from '@/components/ui/Icons';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const conditionInfo = getConditionBadgeInfo(product.condition);
  const discount = getDiscountPercentage(product.basePrice, product.promoPrice);
  const currentPrice = product.promoPrice ?? product.basePrice;
  const isWished = isInWishlist(product.id);

  return (
    <div className="product-card bg-white border border-[#E2E5E8] rounded-xl p-4 flex flex-col justify-between relative group hover:border-[#0054A4] transition-all">
      {/* Badges supérieurs : Remise & État */}
      <div className="flex items-center justify-between gap-1 mb-2 z-10">
        <div className="flex flex-wrap gap-1">
          {discount && (
            <span className="bg-[#DC3545] text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-2xs">
              -{discount}%
            </span>
          )}
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-md border"
            style={{
              backgroundColor: conditionInfo.badgeBg,
              borderColor: conditionInfo.badgeBorder,
              color: conditionInfo.badgeText,
            }}
          >
            {conditionInfo.badgeShort}
          </span>
        </div>

        {/* Bouton Favoris */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className="w-8 h-8 rounded-full bg-gray-50 hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-[#DC3545] transition-colors cursor-pointer"
          title="Ajouter aux favoris"
        >
          <Icons.Heart size={16} className={isWished ? 'text-[#DC3545] fill-[#DC3545]' : ''} />
        </button>
      </div>

      {/* Image du produit */}
      <Link
        href={`/produit/${product.slug}`}
        className="block relative aspect-square max-h-60 sm:max-h-none mb-3 overflow-hidden rounded-lg bg-gray-50 p-3 flex items-center justify-center"
      >
        <img
          src={product.images[0]?.url || '/images/logo/dealmart_logo_square.png'}
          alt={product.images[0]?.altText || product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </Link>

      {/* Informations : Marque, Titre, Notes */}
      <div className="flex-1 flex flex-col">
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
          {product.brand}
        </div>

        <Link
          href={`/produit/${product.slug}`}
          className="text-sm sm:text-xs font-bold text-gray-900 group-hover:text-[#0054A4] transition-colors line-clamp-2 mb-2 leading-snug"
        >
          {product.name}
        </Link>

        {/* Note étoiles */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Icons.Star
                key={i}
                size={13}
                className={
                  i < Math.floor(product.rating || 5)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-300 fill-gray-200'
                }
              />
            ))}
          </div>
          <span className="text-[11px] sm:text-[10px] text-gray-500 font-medium">
            ({product.reviewsCount || 0})
          </span>
        </div>

        {/* Prix en SI$ */}
        <div className="mt-auto pt-2.5 border-t border-gray-100 flex items-baseline justify-between">
          <div>
            <div className="text-base sm:text-lg font-black text-[#0054A4] font-price">
              {formatPrice(currentPrice)}
            </div>
            {product.promoPrice && (
              <div className="text-xs text-gray-500 line-through font-medium">
                {formatPrice(product.basePrice)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bouton d'ajout rapide */}
      <div className="mt-3.5 pt-1">
        <button
          onClick={() => addToCart(product)}
          className="w-full bg-[#F1B20B] hover:bg-[#D99F07] text-[#1D2129] font-heading font-black text-xs uppercase py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <Icons.ShoppingCart size={15} />
          <span>Ajouter au Panier</span>
        </button>
      </div>
    </div>
  );
};
