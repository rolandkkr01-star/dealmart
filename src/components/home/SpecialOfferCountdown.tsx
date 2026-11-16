'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { formatPrice, getDiscountPercentage } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { Icons } from '@/components/ui/Icons';

interface SpecialOfferCountdownProps {
  product: Product;
}

export const SpecialOfferCountdown: React.FC<SpecialOfferCountdownProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 32,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const discount = getDiscountPercentage(product.basePrice, product.promoPrice);
  const currentPrice = product.promoPrice ?? product.basePrice;

  return (
    <div className="border-2 border-[#F1B20B] rounded-2xl p-6 relative bg-white flex flex-col justify-between h-full">
      {/* Badge Offre Spéciale */}
      <div className="absolute -top-3.5 left-6 bg-[#DC3545] text-white font-extrabold text-[11px] uppercase tracking-wider px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
        <Icons.Flame size={13} className="text-white fill-white" />
        <span>Offre Spéciale du Jour</span>
      </div>

      {/* Pastille Remise */}
      {discount && (
        <div className="absolute top-4 right-4 bg-[#F1B20B] text-[#1D2129] font-black rounded-full w-14 h-14 flex flex-col items-center justify-center text-xs shadow-xs border border-[#D99F07]">
          <span className="text-[10px] uppercase font-bold leading-none">Éco.</span>
          <span className="text-sm font-black leading-none">{discount}%</span>
        </div>
      )}

      {/* Titre & Marque */}
      <div className="mt-4 mb-2 text-center">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{product.brand}</span>
        <h3 className="font-heading font-black text-lg text-gray-900 line-clamp-1 hover:text-[#0054A4] transition-colors">
          <Link href={`/produit/${product.slug}`}>
            {product.name}
          </Link>
        </h3>
      </div>

      {/* Image Produit */}
      <Link href={`/produit/${product.slug}`} className="block aspect-square max-h-56 mx-auto my-3 p-2 relative group">
        <img
          src={product.images[0]?.url || '/images/logo/dealmart_logo_square.png'}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </Link>

      {/* Prix Promo */}
      <div className="text-center my-3">
        <div className="text-2xl font-black text-[#0054A4] font-price">
          {formatPrice(currentPrice)}
        </div>
        {product.promoPrice && (
          <div className="text-xs text-gray-400 line-through font-medium mt-0.5">
            {formatPrice(product.basePrice)}
          </div>
        )}
      </div>

      {/* Compte à Rebours */}
      <div className="text-center my-2">
        <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-2">
          Fin de l'offre flash dans :
        </p>
        <div className="flex justify-center items-center gap-2">
          <div className="bg-[#F5F7FA] border border-[#E2E5E8] px-3 py-1.5 rounded-lg min-w-[55px]">
            <span className="font-heading font-black text-base text-[#DC3545] block">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="text-[9px] uppercase font-bold text-gray-500">Heures</span>
          </div>
          <span className="font-black text-[#DC3545]">:</span>
          <div className="bg-[#F5F7FA] border border-[#E2E5E8] px-3 py-1.5 rounded-lg min-w-[55px]">
            <span className="font-heading font-black text-base text-[#DC3545] block">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="text-[9px] uppercase font-bold text-gray-500">Mins</span>
          </div>
          <span className="font-black text-[#DC3545]">:</span>
          <div className="bg-[#F5F7FA] border border-[#E2E5E8] px-3 py-1.5 rounded-lg min-w-[55px]">
            <span className="font-heading font-black text-base text-[#DC3545] block">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="text-[9px] uppercase font-bold text-gray-500">Secs</span>
          </div>
        </div>
      </div>

      {/* Barre de Stock Restant */}
      <div className="my-3">
        <div className="flex justify-between text-[11px] font-semibold text-gray-600 mb-1">
          <span>Stock disponible :</span>
          <span className="text-emerald-700 font-bold">Plus que quelques unités</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-[#0054A4] rounded-full w-3/4" />
        </div>
      </div>

      {/* Action Panier */}
      <div className="mt-2">
        <button
          onClick={() => addToCart(product)}
          className="w-full bg-[#F1B20B] hover:bg-[#D99F07] text-[#1D2129] font-heading font-black text-xs uppercase tracking-wider py-3 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
        >
          <Icons.ShoppingCart size={16} />
          <span>Ajouter au Panier</span>
        </button>
      </div>
    </div>
  );
};
