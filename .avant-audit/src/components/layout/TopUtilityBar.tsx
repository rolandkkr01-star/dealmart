import React from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';
import { siteConfig } from '@/lib/site-config';

export const TopUtilityBar: React.FC = () => {
  return (
    <div className="bg-[#F5F7FA] text-[#4A5568] py-2 border-b border-[#E2E5E8] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-2 font-medium">
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-100 text-emerald-700">
            ✓
          </span>
          <span className="text-gray-900 font-semibold">100% Authentique garanti</span>
          <span className="hidden md:inline text-gray-400">•</span>
          <span className="hidden md:inline">Livraison Express {siteConfig.city}, Calavi & tout le {siteConfig.country}</span>
        </div>

        <div className="flex items-center gap-5 font-medium">
          <Link
            href="/suivi"
            className="hover:text-[#0062BD] transition-colors flex items-center gap-1.5"
          >
            <Icons.Truck size={14} className="text-[#0062BD]" />
            <span>Suivi de commande</span>
          </Link>
          <span className="text-gray-300">|</span>
          <Link
            href="/boutique"
            className="hover:text-[#0062BD] transition-colors flex items-center gap-1.5"
          >
            <Icons.ShoppingBag size={14} className="text-[#0062BD]" />
            <span>Boutique</span>
          </Link>
          <span className="text-gray-300">|</span>
          <a
            href={`tel:${siteConfig.phone.replace(/\s+/g, '')}`}
            className="hover:text-[#0062BD] transition-colors flex items-center gap-1.5 font-bold text-gray-900"
          >
            <Icons.Phone size={14} className="text-emerald-600" />
            <span>{siteConfig.phone}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
