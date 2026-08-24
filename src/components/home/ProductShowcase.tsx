'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { Icons } from '@/components/ui/Icons';
import { siteConfig } from '@/lib/site-config';

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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* En-tête avec onglets */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6 pb-4 border-b border-[#E2E5E8]">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-[#0062BD] block mb-0.5 sm:mb-1">
            Sélection Certifiée
          </span>
          <h2 className="font-heading font-black text-xl sm:text-3xl text-gray-900 tracking-tight">
            Produits Populaires & Nouveautés
          </h2>
        </div>

        {/* Filtres Rapides / Segmented Control fluide sur Mobile */}
        <div className="w-full sm:w-auto grid grid-cols-3 sm:flex sm:items-center gap-1 sm:gap-2 bg-gray-100/90 sm:bg-transparent p-1 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-gray-200">
          <button
            onClick={() => setActiveTab('bestsellers')}
            className={`px-2 sm:px-4 py-2 sm:py-1.5 rounded-lg sm:rounded-full text-xs font-bold transition-all text-center flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
              activeTab === 'bestsellers'
                ? 'bg-[#FED700] text-[#1D2129] shadow-xs'
                : 'text-gray-600 hover:text-gray-900 sm:hover:bg-gray-100'
            }`}
          >
            <Icons.Star size={13} fill="currentColor" className="flex-shrink-0" />
            <span className="truncate">
              <span className="sm:hidden">Populaires</span>
              <span className="hidden sm:inline">Meilleures Ventes</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`px-2 sm:px-4 py-2 sm:py-1.5 rounded-lg sm:rounded-full text-xs font-bold transition-all text-center flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
              activeTab === 'new'
                ? 'bg-[#FED700] text-[#1D2129] shadow-xs'
                : 'text-gray-600 hover:text-gray-900 sm:hover:bg-gray-100'
            }`}
          >
            <Icons.Sparkles size={13} className="flex-shrink-0" />
            <span className="truncate">Nouveautés</span>
          </button>
          <button
            onClick={() => setActiveTab('trade')}
            className={`px-2 sm:px-4 py-2 sm:py-1.5 rounded-lg sm:rounded-full text-xs font-bold transition-all text-center flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
              activeTab === 'trade'
                ? 'bg-[#FED700] text-[#1D2129] shadow-xs'
                : 'text-gray-600 hover:text-gray-900 sm:hover:bg-gray-100'
            }`}
          >
            <Icons.Repeat size={13} className="flex-shrink-0" />
            <span className="truncate">
              <span className="sm:hidden">Troc</span>
              <span className="hidden sm:inline">Échangeables en Troc</span>
            </span>
          </button>
        </div>
      </div>

      {/* Grille de produits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
          <span>Voir tout le catalogue {siteConfig.name}</span>
          <Icons.ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
};
