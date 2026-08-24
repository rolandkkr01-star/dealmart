'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { HeroBanner } from '@/components/home/HeroBanner';
import { TrustBadges } from '@/components/home/TrustBadges';
import { ProductShowcase } from '@/components/home/ProductShowcase';
import { BrandShowcase } from '@/components/home/BrandShowcase';
import { TradePromoBanner } from '@/components/home/TradePromoBanner';
import { TradeModal } from '@/components/product/TradeModal';
import { formatFCFA } from '@/lib/utils';
import { siteConfig } from '@/lib/site-config';
import { Icons } from '@/components/ui/Icons';

interface HomePageClientProps {
  initialProducts: Product[];
  featuredReviews?: any[];
}

export const HomePageClient: React.FC<HomePageClientProps> = ({ initialProducts, featuredReviews = [] }) => {
  const [products] = useState<Product[]>(initialProducts);
  const [selectedTradeProduct, setSelectedTradeProduct] = useState<Product | null>(null);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

  const handleOpenTrade = (product: Product) => {
    setSelectedTradeProduct(product);
    setIsTradeModalOpen(true);
  };

  const tradeProducts = products.filter((p) => p.tradeEligible && p.isActive);
  const featuredDeal = products.find((p) => p.isFeatured && p.promoPrice);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* 1. Hero Banner avec Bloc Troc Dynamique / Pleine Largeur */}
      <HeroBanner
        tradeProducts={tradeProducts}
        onOpenTrade={handleOpenTrade}
      />

      {/* 2. Réassurance & Valeur Ajoutée */}
      <TrustBadges />

      {/* 3. Offre Spéciale / Deal Flash (Si un produit est en vedette) */}
      {featuredDeal ? (
        <div className="bg-[#DC3545] rounded-2xl p-6 sm:p-8 text-white my-8 relative overflow-hidden shadow-xs">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 bg-[#FED700] text-[#1D2129] font-black text-[11px] uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                <Icons.Flame size={14} className="text-red-600 fill-red-600" />
                <span>Offre Vedette Limitée</span>
              </span>
              <h2 className="font-heading font-black text-2xl sm:text-3xl tracking-tight">
                {featuredDeal.name}
              </h2>
              <p className="text-xs sm:text-sm text-red-100 max-w-lg">
                Garantie constructeur authentique avec certificat et livraison express incluse à {siteConfig.city}.
              </p>
            </div>

            <div className="flex items-center gap-6 bg-black/20 p-4 rounded-xl border border-white/10">
              <div>
                <span className="text-[10px] uppercase text-red-200 block">Prix Spécial</span>
                <span className="font-price font-black text-2xl text-[#FED700]">
                  {formatFCFA(featuredDeal.promoPrice || featuredDeal.basePrice)}
                </span>
                {featuredDeal.promoPrice && (
                  <span className="text-xs text-red-200 line-through block">
                    {formatFCFA(featuredDeal.basePrice)}
                  </span>
                )}
              </div>

              <Link
                href={`/produit/${featuredDeal.slug}`}
                className="bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-heading font-black text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-xs"
              >
                Commander
              </Link>
            </div>
          </div>
        </div>
      ) : products.length === 0 ? (
        /* Message élégant catalogue en approvisionnement */
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-10 text-center my-8 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center mx-auto mb-3">
            <Icons.Smartphone size={28} />
          </div>
          <h3 className="font-heading font-black text-lg text-gray-900 mb-2">
            Nouveaux arrivages en préparation
          </h3>
          <p className="text-xs text-gray-600 max-w-md mx-auto mb-5 leading-relaxed">
            Notre catalogue de smartphones neufs scellés et certifiés est en cours de mise à jour. Parcourez nos rayons ou contactez notre équipe pour toute demande d'appareil spécifique.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/boutique"
              className="bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-heading font-black text-xs uppercase px-5 py-3 rounded-xl inline-block shadow-xs transition-colors"
            >
              Consulter le catalogue
            </Link>
            <a
              href={`tel:${siteConfig.phone.replace(/\s+/g, '')}`}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-heading font-bold text-xs uppercase px-5 py-3 rounded-xl inline-flex items-center gap-2 transition-colors"
            >
              <Icons.Phone size={14} />
              <span>Nous joindre ({siteConfig.phone})</span>
            </a>
          </div>
        </div>
      ) : null}

      {/* 4. Vitrine des Meilleurs Produits par Onglets (si produits existent) */}
      {products.length > 0 && (
        <ProductShowcase
          products={products}
          onOpenTrade={handleOpenTrade}
        />
      )}

      {/* 5. Rayons par Marques Phares (iPhone & Samsung) */}
      <BrandShowcase />

      {/* 6. Bannière Promotionnelle Troc */}
      <TradePromoBanner />

      {/* Modal de Troc Interactif */}
      <TradeModal
        product={selectedTradeProduct}
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
      />
    </div>
  );
};
