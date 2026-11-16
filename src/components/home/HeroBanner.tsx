'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';

const HERO_SLIDES = [
  {
    id: 1,
    badge: 'Electronics & Tech',
    badgeIcon: Icons.Sparkles,
    badgeBg: 'bg-[#F1B20B] text-[#1D2129]',
    title: 'The Best of Tech in the',
    highlight: 'Solomon Islands',
    subtitle: '100% Genuine & Certified Products.',
    description: 'Latest smartphones, noise-cancelling wireless earbuds, fast chargers and innovative smart gadgets at honest prices in Honiara.',
    primaryCtaText: 'Shop Electronics',
    primaryCtaLink: '/boutique?category=electronics-gadgets',
    secondaryCtaText: 'View Deals',
    secondaryCtaLink: '/boutique',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
    alt: 'Wireless earbuds and high-tech gadgets',
    priceTag: 'From SI$ 120',
  },
  {
    id: 2,
    badge: 'Beauty, Cosmetics & Skincare',
    badgeIcon: Icons.Heart,
    badgeBg: 'bg-[#0054A4] text-white',
    title: 'Elevate Your Everyday',
    highlight: 'Self-Care Routine',
    subtitle: 'Premium face and body care collections.',
    description: 'Hydrating Vitamin C serums, soothing repair creams, hair care and luxury cosmetics to enhance your natural glow.',
    primaryCtaText: 'Shop Beauty',
    primaryCtaLink: '/boutique?category=beauty-cosmetics-skincare',
    secondaryCtaText: 'New Arrivals',
    secondaryCtaLink: '/boutique',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
    alt: 'Beauty products and cosmetics',
    priceTag: 'From SI$ 45',
  },
  {
    id: 3,
    badge: 'Fashion & Accessories',
    badgeIcon: Icons.Zap,
    badgeBg: 'bg-emerald-500 text-white',
    title: 'Modern Style & Classic',
    highlight: 'Elegance',
    subtitle: 'Fashion essentials for men, women and kids.',
    description: 'Quartz timepieces, travel bags, footwear and trendy apparel designed for comfort and everyday distinction.',
    primaryCtaText: 'Explore Fashion',
    primaryCtaLink: '/boutique?category=fashion-accessories',
    secondaryCtaText: 'Trending Now',
    secondaryCtaLink: '/boutique',
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80',
    alt: 'Chronograph watch and accessories',
    priceTag: 'From SI$ 80',
  },
  {
    id: 4,
    badge: 'Home, Living & Wellness',
    badgeIcon: Icons.Home,
    badgeBg: 'bg-[#F1B20B] text-[#1D2129]',
    title: 'Make Your Home Feel',
    highlight: 'Truly Complete',
    subtitle: 'Comfort, wellness and smart living essentials.',
    description: 'Aroma diffusers, shiatsu massagers, practical kitchenware and home organizers designed for your family.',
    primaryCtaText: 'Shop Home',
    primaryCtaLink: '/boutique?category=home-kitchen-living',
    secondaryCtaText: 'All Catalog',
    secondaryCtaLink: '/boutique',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80',
    alt: 'Aroma diffuser and home goods',
    priceTag: 'From SI$ 50',
  },
];

export const HeroBanner: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Rotation automatique du carrousel principal
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const slide = HERO_SLIDES[currentSlide];
  const BadgeIcon = slide.badgeIcon;

  return (
    <section className="mt-4 mb-8">
      <div
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0B1E38] via-[#0F172A] to-[#040C18] text-white p-6 sm:p-10 lg:p-12 min-h-[440px] flex items-center border border-gray-800 shadow-xl">
          {/* Contenu textuel de la slide */}
          <div className="relative z-10 max-w-xl pr-0 md:pr-4">
            <div className={`inline-flex items-center gap-2 font-black text-[11px] uppercase tracking-wider px-3.5 py-1 rounded-full mb-4 shadow-sm ${slide.badgeBg}`}>
              <BadgeIcon size={13} />
              <span>{slide.badge}</span>
            </div>

            <h1 className="font-heading font-black text-2xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight mb-3">
              {slide.title} <span className="text-[#F1B20B]">{slide.highlight}</span>
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
                className="bg-[#F1B20B] hover:bg-[#D99F07] text-[#1D2129] font-heading font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-xs transition-all flex items-center gap-2"
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

            {/* Reassurance badges */}
            <div className="mt-8 pt-5 border-t border-gray-800/80 flex flex-wrap items-center gap-5 text-[11px] text-gray-300 font-medium">
              <div className="flex items-center gap-1.5">
                <Icons.ShieldCheck size={15} className="text-emerald-400" />
                <span>100% Genuine Quality</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Icons.Truck size={15} className="text-[#F1B20B]" />
                <span>Fast Delivery in Honiara</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Icons.Wallet size={15} className="text-blue-400" />
                <span>Cash on Delivery & BSP Transfer</span>
              </div>
            </div>
          </div>

          {/* Illustration image */}
          <div className="hidden md:flex absolute right-6 lg:right-12 top-1/2 -translate-y-1/2 w-72 lg:w-96 h-80 items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={slide.image}
                alt={slide.alt}
                className="max-h-full max-w-full object-cover rounded-2xl border-2 border-white/10 drop-shadow-2xl transition-all duration-700 ease-in-out"
              />
              <div className="absolute bottom-3 right-3 bg-[#111827]/90 border border-gray-700 text-[#F1B20B] text-xs font-black px-3.5 py-1.5 rounded-lg backdrop-blur-xs shadow-md">
                {slide.priceTag}
              </div>
            </div>
          </div>

          {/* Navigation arrows */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer z-20"
            aria-label="Previous slide"
          >
            <Icons.ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer z-20"
            aria-label="Next slide"
          >
            <Icons.ChevronRight size={18} />
          </button>

          {/* Bullets */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {HERO_SLIDES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentSlide
                    ? 'w-7 bg-[#F1B20B]'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
