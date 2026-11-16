import React from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';

export const BrandShowcase: React.FC = () => {
  return (
    <section className="mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* High-Tech & Gadgets */}
        <div className="bg-gradient-to-br from-[#0B1E38] to-[#040C18] text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between border border-[#0F2D54] group">
          <div className="relative z-10 max-w-xs">
            <span className="text-[11px] font-bold text-[#F1B20B] uppercase tracking-widest block mb-2">
              High-Tech & Gadgets World
            </span>
            <h3 className="font-heading font-black text-2xl sm:text-3xl text-white mb-2">
              Smartphones & Premium Audio
            </h3>
            <p className="text-xs text-gray-300 mb-6 leading-relaxed">
              Noise-cancelling headphones, ultra-fast GaN chargers, and latest smartphones with local warranty.
            </p>
            <Link
              href="/boutique?category=electronics-gadgets"
              className="inline-flex items-center gap-2 bg-[#F1B20B] hover:bg-[#D99F07] text-[#1D2129] font-heading font-black text-xs uppercase px-5 py-2.5 rounded-xl transition-transform group-hover:translate-x-0.5"
            >
              <span>Shop Tech</span>
              <Icons.ChevronRight size={14} />
            </Link>
          </div>
          <div className="absolute right-0 bottom-0 w-48 sm:w-60 opacity-80 group-hover:scale-105 transition-transform duration-500 pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80"
              alt="High-fidelity audio headphones"
              className="w-full h-auto object-contain rounded-tl-2xl"
            />
          </div>
        </div>

        {/* Beauty & Cosmetics */}
        <div className="bg-gradient-to-br from-[#1E1128] to-[#0D0712] text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between border border-pink-950/60 group">
          <div className="relative z-10 max-w-xs">
            <span className="text-[11px] font-bold text-pink-400 uppercase tracking-widest block mb-2">
              Beauty & Wellness World
            </span>
            <h3 className="font-heading font-black text-2xl sm:text-3xl text-white mb-2">
              Glow Skincare & Cosmetics
            </h3>
            <p className="text-xs text-gray-300 mb-6 leading-relaxed">
              Nourish your skin with concentrated serums, hydrating creams, and tested gentle formulas.
            </p>
            <Link
              href="/boutique?category=beauty-cosmetics-skincare"
              className="inline-flex items-center gap-2 bg-[#0054A4] hover:bg-[#004383] text-white font-heading font-black text-xs uppercase px-5 py-2.5 rounded-xl transition-transform group-hover:translate-x-0.5"
            >
              <span>Shop Beauty</span>
              <Icons.ChevronRight size={14} />
            </Link>
          </div>
          <div className="absolute right-0 bottom-0 w-48 sm:w-60 opacity-80 group-hover:scale-105 transition-transform duration-500 pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=400&q=80"
              alt="Skincare cosmetics"
              className="w-full h-auto object-contain rounded-tl-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
