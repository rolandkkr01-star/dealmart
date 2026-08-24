'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { formatFCFA, getDiscountPercentage, getConditionBadgeInfo } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { Icons } from '@/components/ui/Icons';

interface ProductCardProps {
  product: Product;
  onOpenTrade?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenTrade }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const conditionInfo = getConditionBadgeInfo(product.condition);
  const discount = getDiscountPercentage(product.basePrice, product.promoPrice);
  const currentPrice = product.promoPrice ?? product.basePrice;
  const isWished = isInWishlist(product.id);

  return (
    <div className="product-card bg-white border border-[#E2E5E8] rounded-xl p-4 flex flex-col justify-between relative group hover:border-[#0062BD] transition-all">
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
              color: conditionInfo.badgeText
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
          <Icons.Heart size={16} className={isWished ? "text-[#DC3545] fill-[#DC3545]" : ""} />
        </button>
      </div>

      {/* Image du produit */}
      <Link href={`/produit/${product.slug}`} className="block relative aspect-square mb-3 overflow-hidden rounded-lg bg-gray-50 p-2">
        <img
          src={product.images[0]?.url}
          alt={product.images[0]?.altText || product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {product.tradeEligible && (
          <span className="absolute bottom-1.5 left-1.5 bg-[#1D2129]/90 text-[#FED700] text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1 backdrop-blur-2xs">
            <Icons.Repeat size={10} />
            Troc possible
          </span>
        )}
      </Link>

      {/* Informations : Marque, Titre, Notes */}
      <div className="flex-1 flex flex-col">
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
          {product.brand}
        </div>

        <Link
          href={`/produit/${product.slug}`}
          className="text-xs font-bold text-gray-900 group-hover:text-[#0062BD] transition-colors line-clamp-2 mb-2 leading-snug"
        >
          {product.name}
        </Link>

        {/* Note étoiles */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex text-[#FED700]">
            {[...Array(5)].map((_, i) => (
              <Icons.Star
                key={i}
                size={12}
                className={i < Math.floor(product.rating) ? "text-[#FED700]" : "text-gray-200"}
              />
            ))}
          </div>
          <span className="text-[10px] text-gray-500 font-medium">({product.reviewsCount})</span>
        </div>

        {/* Prix en FCFA */}
        <div className="mt-auto pt-2 border-t border-gray-100 flex items-baseline justify-between">
          <div>
            <div className="text-sm sm:text-base font-black text-[#DC3545] font-price">
              {formatFCFA(currentPrice)}
            </div>
            {product.promoPrice && (
              <div className="text-[11px] text-gray-400 line-through font-medium">
                {formatFCFA(product.basePrice)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bouton d'ajout rapide & Troc */}
      <div className="mt-3 grid grid-cols-1 gap-1.5 pt-1">
        <button
          onClick={() => addToCart(product)}
          className="w-full bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <Icons.ShoppingCart size={14} />
          <span>Ajouter</span>
        </button>

        {product.tradeEligible && onOpenTrade && (
          <button
            onClick={() => onOpenTrade(product)}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-[11px] font-semibold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <Icons.Repeat size={12} className="text-[#0062BD]" />
            <span>Proposer un troc</span>
          </button>
        )}
      </div>
    </div>
  );
};
