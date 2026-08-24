'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/ui/Icons';

export const MainNav: React.FC = () => {
  const pathname = usePathname();
  const [isDepartmentMenuOpen, setIsDepartmentMenuOpen] = useState(false);

  const departments = [
    { name: 'Smartphones Apple iPhone', href: '/boutique?brand=IPHONE', icon: '📱' },
    { name: 'Samsung Galaxy Série S & Fold', href: '/boutique?brand=SAMSUNG', icon: '✨' },
    { name: 'Occasions & Reconditionnés Certifiés', href: '/boutique?condition=OCCASION', icon: '🛡️' },
    { name: 'Chargeurs Originaux & Câbles Rapides', href: '/boutique?brand=ACCESSOIRE', icon: '⚡' },
    { name: 'Écouteurs & Audio (AirPods, Galaxy Buds)', href: '/boutique?search=audio', icon: '🎧' },
    { name: 'Module Troc & Échange Smartphone', href: '/boutique?trade=true', icon: '🔄' }
  ];

  return (
    <nav className="bg-[#FED700] border-b border-[#E8C400] text-[#1D2129] relative z-20 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-12">
        {/* Bouton "Tout le catalogue" */}
        <div className="relative">
          <button
            onClick={() => setIsDepartmentMenuOpen(!isDepartmentMenuOpen)}
            className="bg-[#1D2129] text-[#FED700] hover:bg-[#2C3039] font-bold text-xs uppercase tracking-wider px-5 h-12 flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <Icons.Menu size={18} />
            <span>Tout le catalogue</span>
            <Icons.ChevronDown size={16} className={`transition-transform duration-200 ${isDepartmentMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Menu déroulant des rayons */}
          {isDepartmentMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/20"
                onClick={() => setIsDepartmentMenuOpen(false)}
              />
              <div className="absolute top-full left-0 w-72 bg-white border border-[#E2E5E8] shadow-2xl rounded-b-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {departments.map((dept, idx) => (
                  <Link
                    key={idx}
                    href={dept.href}
                    onClick={() => setIsDepartmentMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-800 hover:bg-amber-50 hover:text-[#0062BD] transition-colors border-b border-gray-50 last:border-none"
                  >
                    <span className="text-base">{dept.icon}</span>
                    <span>{dept.name}</span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Liens de navigation principaux */}
        <div className="hidden md:flex items-center gap-7 text-xs font-extrabold uppercase tracking-wide">
          <Link
            href="/boutique?brand=IPHONE"
            className={`hover:text-[#0062BD] transition-colors py-1 ${pathname.includes('IPHONE') ? 'border-b-2 border-[#1D2129]' : ''}`}
          >
            IPHONE
          </Link>
          <Link
            href="/boutique?brand=SAMSUNG"
            className={`hover:text-[#0062BD] transition-colors py-1 ${pathname.includes('SAMSUNG') ? 'border-b-2 border-[#1D2129]' : ''}`}
          >
            SAMSUNG
          </Link>
          <Link
            href="/boutique?brand=ACCESSOIRE"
            className="hover:text-[#0062BD] transition-colors py-1"
          >
            ACCESSOIRES
          </Link>
          <Link
            href="/boutique?trade=true"
            className="flex items-center gap-1 bg-[#1D2129] text-white px-2.5 py-1 rounded-md hover:bg-[#0062BD] transition-all"
          >
            <Icons.Repeat size={13} className="text-[#FED700]" />
            <span>TROC & ÉCHANGE</span>
          </Link>
          <Link
            href="/boutique?promo=true"
            className="text-[#DC3545] hover:underline flex items-center gap-1 font-black"
          >
            <Icons.Flame size={14} />
            <span>OFFRES FLASH</span>
          </Link>
        </div>

        {/* Info livraison rapide */}
        <div className="hidden xl:flex items-center gap-2 text-xs font-semibold text-[#1D2129]/90">
          <Icons.Truck size={16} />
          <span>Livraison Express à Cotonou & environs</span>
        </div>
      </div>
    </nav>
  );
};
