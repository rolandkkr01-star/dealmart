import React from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';

export const BrandShowcase: React.FC = () => {
  return (
    <section className="mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Espace Apple */}
        <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between shadow-md group">
          <div className="relative z-10">
            <span className="text-[11px] font-bold text-[#FED700] uppercase tracking-widest block mb-2">
              Univers Apple Officiel
            </span>
            <h3 className="font-heading font-black text-2xl sm:text-3xl text-white mb-2">
              iPhone Série 15 & 16 Pro
            </h3>
            <p className="text-xs text-gray-300 max-w-sm mb-6 leading-relaxed">
              Design Titane aérospatial, puce A17 Pro, zoom optique 5x et compatibilité USB-C. Garantie constructeur 12 mois.
            </p>
            <Link
              href="/boutique?brand=IPHONE"
              className="inline-flex items-center gap-2 bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-heading font-black text-xs uppercase px-5 py-2.5 rounded-lg shadow-sm transition-transform group-hover:translate-x-1"
            >
              <span>Voir les iPhones</span>
              <Icons.ChevronRight size={14} />
            </Link>
          </div>
          <div className="absolute right-2 -bottom-6 w-44 sm:w-52 opacity-80 group-hover:scale-105 transition-transform duration-500 pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=400&q=80"
              alt="Apple iPhone 15 Pro Max"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>

        {/* Espace Samsung */}
        <div className="bg-gradient-to-br from-[#0B1E38] to-[#040C18] text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between shadow-md group">
          <div className="relative z-10">
            <span className="text-[11px] font-bold text-[#5D9EFD] uppercase tracking-widest block mb-2">
              Univers Samsung Galaxy
            </span>
            <h3 className="font-heading font-black text-2xl sm:text-3xl text-white mb-2">
              Galaxy S24 Ultra & Galaxy AI
            </h3>
            <p className="text-xs text-gray-300 max-w-sm mb-6 leading-relaxed">
              Passez à l'intelligence artificielle embarquée avec Circle to Search, S-Pen ultra-précis et capteur 200 Mpx.
            </p>
            <Link
              href="/boutique?brand=SAMSUNG"
              className="inline-flex items-center gap-2 bg-[#0062BD] hover:bg-[#004F99] text-white font-heading font-black text-xs uppercase px-5 py-2.5 rounded-lg shadow-sm transition-transform group-hover:translate-x-1"
            >
              <span>Voir les Galaxy</span>
              <Icons.ChevronRight size={14} />
            </Link>
          </div>
          <div className="absolute right-2 -bottom-6 w-44 sm:w-52 opacity-80 group-hover:scale-105 transition-transform duration-500 pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=400&q=80"
              alt="Samsung Galaxy S24 Ultra"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
