'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/ui/Icons';

export const MainNav: React.FC = () => {
  const pathname = usePathname();
  const [isDepartmentMenuOpen, setIsDepartmentMenuOpen] = useState(false);

  const departments = [
    { name: 'Electronics & Tech', href: '/boutique?category=electronics-gadgets', icon: Icons.Smartphone },
    { name: 'Beauty & Skincare', href: '/boutique?category=beauty-cosmetics-skincare', icon: Icons.Sparkles },
    { name: 'Fashion & Apparel', href: '/boutique?category=fashion-accessories', icon: Icons.Tag },
    { name: 'Home, Living & Kitchen', href: '/boutique?category=home-kitchen-living', icon: Icons.Package },
    { name: 'Audio & Accessories', href: '/boutique?search=audio', icon: Icons.Headset },
  ];

  return (
    <nav className="bg-[#F1B20B] border-b border-[#D99F07] text-[#1D2129] relative z-20 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-12">
        {/* Bouton "Tout le catalogue" */}
        <div className="relative">
          <button
            onClick={() => setIsDepartmentMenuOpen(!isDepartmentMenuOpen)}
            className="bg-[#1D2129] text-[#F1B20B] hover:bg-[#2C3039] font-bold text-xs uppercase tracking-wider px-5 h-12 flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <Icons.Menu size={18} />
            <span>All Departments</span>
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
                {departments.map((dept, idx) => {
                  const Icon = dept.icon;
                  return (
                    <Link
                      key={idx}
                      href={dept.href}
                      onClick={() => setIsDepartmentMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50 text-gray-700 hover:text-[#0054A4] text-xs font-semibold transition-colors"
                    >
                      <Icon size={16} className="text-[#0054A4] flex-shrink-0" />
                      <span>{dept.name}</span>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Liens de navigation principaux */}
        <div className="hidden md:flex items-center gap-7 text-xs font-extrabold uppercase tracking-wide">
          <Link
            href="/boutique?category=electronics-gadgets"
            className={`hover:text-[#0054A4] transition-colors py-1 ${pathname.includes('electronics') ? 'border-b-2 border-[#1D2129]' : ''}`}
          >
            ELECTRONICS
          </Link>
          <Link
            href="/boutique?category=beauty-cosmetics-skincare"
            className={`hover:text-[#0054A4] transition-colors py-1 ${pathname.includes('beauty') ? 'border-b-2 border-[#1D2129]' : ''}`}
          >
            BEAUTY & SKINCARE
          </Link>
          <Link
            href="/boutique?category=fashion-accessories"
            className={`hover:text-[#0054A4] transition-colors py-1 ${pathname.includes('fashion') ? 'border-b-2 border-[#1D2129]' : ''}`}
          >
            FASHION
          </Link>
          <Link
            href="/boutique?category=home-kitchen-living"
            className={`hover:text-[#0054A4] transition-colors py-1 ${pathname.includes('home') ? 'border-b-2 border-[#1D2129]' : ''}`}
          >
            HOME & LIVING
          </Link>
          <Link
            href="/boutique?promo=true"
            className="text-[#DC3545] hover:underline flex items-center gap-1 font-black"
          >
            <Icons.Flame size={14} />
            <span>FLASH DEALS</span>
          </Link>
        </div>

        {/* Info livraison rapide */}
        <div className="hidden xl:flex items-center gap-2 text-xs font-semibold text-[#1D2129]/90">
          <Icons.Truck size={16} />
          <span>Fast Delivery across Honiara & Solomon Islands</span>
        </div>
      </div>
    </nav>
  );
};
