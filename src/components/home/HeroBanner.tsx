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

const HERO_SLIDES = [
  {
    id: 1,
    badge: 'Nouveautés & Flagships Certifiés',
    badgeIcon: Icons.Sparkles,
    badgeBg: 'bg-[#FED700] text-[#1D2129]',
    title: "L'excellence Apple au",
    highlight: 'Bénin',
    subtitle: '100% Authentique & Neuf sous scellé.',
    description: 'iPhones 15 Pro Max, 15 Pro et 14 avec garantie constructeur, paiement Mobile Money sécurisé et livraison express en 2h à Cotonou.',
    primaryCtaText: 'Voir les iPhones',
    primaryCtaLink: '/boutique?brand=IPHONE',
    secondaryCtaText: 'Faire estimer un Troc',
    secondaryCtaLink: '/boutique?trade=true',
    image: '/images/products/daniel-romero-bR_r3fJu-vk-unsplash.jpg',
    alt: 'iPhone 15 Pro Max Titane Naturel',
    priceTag: 'À partir de 520 000 FCFA',
  },
  {
    id: 2,
    badge: 'Flagship Galaxy AI & Pliables',
    badgeIcon: Icons.Zap,
    badgeBg: 'bg-[#0062BD] text-white',
    title: 'Samsung Galaxy S24 Ultra &',
    highlight: 'Z Fold 5',
    subtitle: 'La puissance de pointe entre vos mains.',
    description: 'Capteur révolutionnaire 200 Mpx, stylet S-Pen intégré et processeur Snapdragon 8 Gen 3. Garantie 24 mois officielle.',
    primaryCtaText: 'Voir les Samsung',
    primaryCtaLink: '/boutique?brand=SAMSUNG',
    secondaryCtaText: 'Acheter avec MoMo',
    secondaryCtaLink: '/boutique',
    image: '/images/products/zana-latif-5uJMG9fUAO0-unsplash.jpg',
    alt: 'Samsung Galaxy S24 Ultra et Z Fold',
    priceTag: 'Garantie 2 ans incluse',
  },
  {
    id: 3,
    badge: 'Service Unique au Bénin',
    badgeIcon: Icons.Repeat,
    badgeBg: 'bg-emerald-500 text-white',
    title: 'Échangez votre ancien smartphone :',
    highlight: 'Troc Facile',
    subtitle: 'Réduisez votre facture instantanément.',
    description: 'Proposez votre ancien iPhone ou Samsung en ligne. Recevez une estimation claire et repartez avec le modèle de vos rêves.',
    primaryCtaText: 'Lancer un Troc',
    primaryCtaLink: '/boutique?trade=true',
    secondaryCtaText: 'Comment ça marche ?',
    secondaryCtaLink: '/aide',
    image: '/images/products/anh-nhat-PdALQmfEqvE-unsplash.jpg',
    alt: 'Programme de troc et reprise smartphone Bénin',
    priceTag: 'Estimation transparente',
  },
  {
    id: 4,
    badge: '100% Originaux & Certifiés',
    badgeIcon: Icons.ShieldCheck,
    badgeBg: 'bg-[#FED700] text-[#1D2129]',
    title: 'Chargeurs & Accessoires',
    highlight: 'Garantis Zéro Contrefaçon',
    subtitle: 'Préservez la santé de votre batterie.',
    description: 'Adaptateurs 20W Apple et 45W Samsung authentiques avec numéro de série certifié. Vos appareils méritent le meilleur.',
    primaryCtaText: 'Voir les Accessoires',
    primaryCtaLink: '/boutique?brand=ACCESSOIRE',
    secondaryCtaText: 'Tout le Catalogue',
    secondaryCtaLink: '/boutique',
    image: '/images/products/ubeyonroad-oLZ2htMNhbA-unsplash.jpg',
    alt: 'Accessoires officiels et chargeurs rapides Apple et Samsung',
    priceTag: 'Dès 18 500 FCFA',
  }
];

export const HeroBanner: React.FC<HeroBannerProps> = ({ tradeProducts = [], onOpenTrade }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [tradeIndex, setTradeIndex] = useState(0);

  // Rotation automatique du carrousel principal
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  // Rotation automatique du troc latéral
  useEffect(() => {
    if (tradeProducts.length <= 1) return;
    const interval = setInterval(() => {
      setTradeIndex((prev) => (prev + 1) % tradeProducts.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [tradeProducts.length]);

  const hasTradeProducts = tradeProducts.length > 0;
  const currentTradeProduct = hasTradeProducts ? tradeProducts[tradeIndex] : null;
  const slide = HERO_SLIDES[currentSlide];
  const BadgeIcon = slide.badgeIcon;

  return (
    <section className="mt-4 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* 1. Bloc Troc & Échange latéral (sur grand écran) */}
        {hasTradeProducts && currentTradeProduct && (
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
            <div className="bg-white border-2 border-[#FED700] rounded-2xl overflow-hidden shadow-md h-full flex flex-col justify-between p-4 relative group">
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
                    src={currentTradeProduct.images?.[0]?.url || '/images/products/daniel-romero-bR_r3fJu-vk-unsplash.jpg'}
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

              {/* Action Troc */}
              <div>
                <button
                  onClick={() => onOpenTrade && onOpenTrade(currentTradeProduct)}
                  className="w-full bg-[#1D2129] hover:bg-[#0062BD] text-[#FED700] hover:text-white font-heading font-black text-xs uppercase tracking-wider py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Icons.Repeat size={14} />
                  <span>Proposer un Troc</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. Carrousel Hero Principal */}
        <div
          className={`${hasTradeProducts ? 'lg:col-span-8 xl:col-span-9' : 'lg:col-span-12'} relative`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative rounded-2xl overflow-hidden bg-[#0F172A] text-white p-6 sm:p-10 lg:p-12 min-h-[420px] flex items-center border border-gray-800 shadow-md">
            {/* Contenu textuel de la slide */}
            <div className="relative z-10 max-w-xl pr-0 md:pr-4">
              <div className={`inline-flex items-center gap-2 font-black text-[11px] uppercase tracking-wider px-3.5 py-1 rounded-full mb-4 shadow-sm ${slide.badgeBg}`}>
                <BadgeIcon size={13} />
                <span>{slide.badge}</span>
              </div>

              <h1 className="font-heading font-black text-2xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight mb-3">
                {slide.title} <span className="text-[#FED700]">{slide.highlight}</span>
              </h1>

              <p className="font-bold text-xs sm:text-sm text-gray-200 mb-2">
                {slide.subtitle}
              </p>

              <p className="text-xs sm:text-xs text-gray-300 mb-7 leading-relaxed max-w-md">
                {slide.description}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={slide.primaryCtaLink}
                  className="bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-heading font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-xs transition-all flex items-center gap-2"
                >
                  <span>{slide.primaryCtaText}</span>
                  <Icons.ArrowRight size={16} />
                </Link>

                <Link
                  href={slide.secondaryCtaLink}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold text-xs uppercase tracking-wider px-5 py-3.5 rounded-xl transition-colors flex items-center gap-2"
                >
                  <span>{slide.secondaryCtaText}</span>
                </Link>
              </div>

              {/* Badges de confiance */}
              <div className="mt-8 pt-5 border-t border-gray-800 flex flex-wrap items-center gap-5 text-[11px] text-gray-300 font-medium">
                <div className="flex items-center gap-1.5">
                  <Icons.ShieldCheck size={15} className="text-emerald-400" />
                  <span>Zéro contrefaçon</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icons.Truck size={15} className="text-[#FED700]" />
                  <span>Livraison 2h Cotonou</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icons.Wallet size={15} className="text-blue-400" />
                  <span>MTN MoMo / Moov / Kkiapay</span>
                </div>
              </div>
            </div>

            {/* Image d'illustration de la slide */}
            <div className="hidden md:flex absolute right-6 lg:right-10 top-1/2 -translate-y-1/2 w-64 lg:w-84 h-72 items-center justify-center">
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className="max-h-full max-w-full object-contain drop-shadow-2xl rounded-xl transition-all duration-700 ease-in-out"
                />
                <div className="absolute bottom-2 right-2 bg-[#1D2129]/90 border border-gray-700 text-[#FED700] text-[10px] font-bold px-3 py-1 rounded-lg backdrop-blur-xs shadow-md">
                  {slide.priceTag}
                </div>
              </div>
            </div>

            {/* Flèches de navigation */}
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer z-20"
              aria-label="Slide précédente"
            >
              <Icons.ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer z-20"
              aria-label="Slide suivante"
            >
              <Icons.ChevronRight size={18} />
            </button>

            {/* Indicateurs de pagination (Bullets) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
              {HERO_SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentSlide
                      ? 'w-7 bg-[#FED700]'
                      : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Aller au slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
