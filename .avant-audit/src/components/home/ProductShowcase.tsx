'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { Icons } from '@/components/ui/Icons';

interface ProductShowcaseProps {
  products: Product[];
  onOpenTrade?: (product: Product) => void;
}

export const ProductShowcase: React.FC<ProductShowcaseProps> = ({ products, onOpenTrade }) => {
  const [activeTab, setActiveTab] = useState<'bestsellers' | 'new' | 'trade'>('bestsellers');

  const filteredProducts = products.filter((p) => {
    if (activeTab === 'bestsellers') return p.isBestSeller;
    if (activeTab === 'new') return p.isNewArrival || p.isFeatured;
    if (activeTab === 'trade') return p.tradeEligible;
    return true;
  });

  return (
    <section className="mb-12">
      {/* Header des onglets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-gray-200 pb-3 mb-6 gap-3">
        <h2 className="font-heading font-black text-xl sm:text-2xl text-[#1D2129] tracking-tight">
          Nos Meilleurs Smartphones & Accessoires
        </h2>

        {/* Onglets interactifs */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
          <button
            onClick={() => setActiveTab('bestsellers')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'bestsellers'
                ? 'bg-[#FED700] text-[#1D2129] shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ⭐ Meilleures Ventes
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'new'
                ? 'bg-[#FED700] text-[#1D2129] shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ✨ Nouveautés 2024
          </button>
          <button
            onClick={() => setActiveTab('trade')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'trade'
                ? 'bg-[#FED700] text-[#1D2129] shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🔄 Échangeables en Troc
          </button>
        </div>
      </div>

      {/* Grille de produits */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {filteredProducts.slice(0, 8).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onOpenTrade={onOpenTrade}
          />
        ))}
      </div>

      {/* Bouton voir tout */}
      <div className="text-center mt-8">
        <Link
          href="/boutique"
          className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-[#0062BD] border-2 border-[#0062BD] font-heading font-black text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl shadow-xs transition-all hover:shadow-md"
        >
          <span>Voir tout le catalogue TechPhone229</span>
          <Icons.ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
};
