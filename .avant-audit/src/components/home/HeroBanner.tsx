'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { formatFCFA, getConditionBadgeInfo } from '@/lib/utils';
import { Icons } from '@/components/ui/Icons';

interface HeroBannerProps {
  tradeProducts?: Product[];
  onOpenTrade?: (product: Product) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ tradeProducts = [], onOpenTrade }) => {
  const [tradeIndex, setTradeIndex] = useState(0);

  // Rotation automatique du carrousel de troc si plusieurs produits
  useEffect(() => {
    if (tradeProducts.length <= 1) return;
    const interval = setInterval(() => {
      setTradeIndex((prev) => (prev + 1) % tradeProducts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [tradeProducts.length]);

  const hasTradeProducts = tradeProducts.length > 0;
  const currentTradeProduct = hasTradeProducts ? tradeProducts[tradeIndex] : null;

  return (
    <section className="mt-4 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Bloc Troc & Échange (Visible uniquement si des téléphones sont éligibles au troc et sur grand écran) */}
        {hasTradeProducts && currentTradeProduct && (
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
            <div className="bg-white border-2 border-[#FED700] rounded-2xl overflow-hidden shadow-md h-full flex flex-col justify-between p-4 relative group">
              {/* En-tête du bloc troc */}
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#1D2129] text-[#FED700] flex items-center justify-center font-bold text-xs">
                      <Icons.Repeat size={14} />
                    </div>
                    <div>
                      <h3 className="font-heading font-black text-xs uppercase tracking-wider text-[#1D2129] leading-tight">
                        Troc & Échange
                      </h3>
                      <span className="text-[10px] text-emerald-600 font-bold">
                        Éligible maintenant
                      </span>
                    </div>
                  </div>

                  {tradeProducts.length > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setTradeIndex((prev) => (prev - 1 + tradeProducts.length) % tradeProducts.length)}
                        className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
                        title="Précédent"
                      >
                        <Icons.ChevronLeft size={12} />
                      </button>
                      <button
                        onClick={() => setTradeIndex((prev) => (prev + 1) % tradeProducts.length)}
                        className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
                        title="Suivant"
                      >
                        <Icons.ChevronRight size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Badge État & Marque */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${getConditionBadgeInfo(currentTradeProduct.condition).badgeClass}`}>
                    {getConditionBadgeInfo(currentTradeProduct.condition).label}
                  </span>
                  <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {currentTradeProduct.brand}
                  </span>
                </div>

                {/* Image du produit */}
                <div className="relative w-full h-40 bg-gray-50 rounded-xl overflow-hidden mb-3 border border-gray-100 flex items-center justify-center p-2">
                  <img
                    src={currentTradeProduct.images?.[0]?.url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80'}
                    alt={currentTradeProduct.name}
                    className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105 duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-[#1D2129] text-[#FED700] text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                    <Icons.Repeat size={10} />
                    <span>Troc possible</span>
                  </div>
                </div>

                {/* Titre & Prix */}
                <h4 className="font-heading font-black text-sm text-[#1D2129] line-clamp-1 mb-1 hover:text-[#0062BD] transition-colors">
                  <Link href={`/produit/${currentTradeProduct.slug}`}>
                    {currentTradeProduct.name}
                  </Link>
                </h4>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-price font-black text-sm text-[#0062BD]">
                    {formatFCFA(currentTradeProduct.basePrice)}
                  </span>
                  <span className="text-[10px] text-gray-400">ou échange</span>
                </div>
              </div>

              {/* Action Troc & Pagination */}
              <div>
                <button
                  onClick={() => onOpenTrade && onOpenTrade(currentTradeProduct)}
                  className="w-full bg-[#1D2129] hover:bg-[#0062BD] text-[#FED700] hover:text-white font-heading font-black text-xs uppercase tracking-wider py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Icons.Repeat size={14} />
                  <span>Proposer un Troc</span>
                </button>

                {tradeProducts.length > 1 && (
                  <div className="flex justify-center gap-1.5 mt-3">
                    {tradeProducts.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setTradeIndex(i)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          i === tradeIndex ? 'w-5 bg-[#FED700]' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                        }`}
                        title={`Article ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. Bannière Hero Principale (Prend 100% de la largeur si 0 produit en troc, ou 8-9 colonnes sinon) */}
        <div className={hasTradeProducts ? 'lg:col-span-8 xl:col-span-9' : 'lg:col-span-12'}>
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0A0F1D] text-white p-6 sm:p-10 lg:p-12 min-h-[380px] flex items-center shadow-lg border border-gray-800">
            {/* Décoration d'arrière-plan */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#FED700]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-20 w-80 h-80 bg-[#0062BD]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-xl">
              <div className="inline-flex items-center gap-2 bg-[#FED700] text-[#1D2129] font-black text-[11px] uppercase tracking-wider px-3.5 py-1 rounded-full mb-4 shadow-sm">
                <Icons.Sparkles size={13} />
                <span>Nouveautés & Flagships Certifiés</span>
              </div>

              <h1 className="font-heading font-black text-2xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight mb-4">
                L'excellence mobile au <span className="text-[#FED700]">Bénin</span>, 100% Authentique.
              </h1>

              <p className="text-xs sm:text-sm text-gray-300 mb-8 leading-relaxed">
                Achetez vos <strong>iPhones 15 / 16</strong> et <strong>Samsung Galaxy S24</strong> neufs sous scellé avec garantie constructeur, paiement Mobile Money sécurisé et livraison express à Cotonou.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/boutique"
                  className="bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-heading font-black text-xs uppercase tracking-wider px-7 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <span>Explorer le Catalogue</span>
                  <Icons.ArrowRight size={16} />
                </Link>

                <Link
                  href="/boutique?trade=true"
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold text-xs uppercase tracking-wider px-5 py-3.5 rounded-xl transition-colors backdrop-blur-xs flex items-center gap-2"
                >
                  <Icons.Repeat size={15} className="text-[#FED700]" />
                  <span>Faire estimer un Troc</span>
                </Link>
              </div>

              {/* Badges de confiance miniatures */}
              <div className="mt-8 pt-6 border-t border-gray-800 flex flex-wrap items-center gap-6 text-[11px] text-gray-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <Icons.ShieldCheck size={16} className="text-emerald-400" />
                  <span>Zéro contrefaçon</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icons.Truck size={16} className="text-[#FED700]" />
                  <span>Livraison express à Cotonou</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icons.Wallet size={16} className="text-blue-400" />
                  <span>MTN MoMo & Moov Money</span>
                </div>
              </div>
            </div>

            {/* Mockup visuel smartphone à droite sur écrans larges */}
            <div className="hidden md:block absolute right-6 lg:right-10 top-1/2 -translate-y-1/2 w-64 lg:w-80">
              <img
                src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80"
                alt="Smartphones certifiés TechPhone229"
                className="w-full h-auto drop-shadow-2xl object-contain transform rotate-6 hover:rotate-0 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
