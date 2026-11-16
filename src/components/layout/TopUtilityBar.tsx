import React from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';
import { siteConfig } from '@/lib/site-config';

export const TopUtilityBar: React.FC = () => {
  return (
    <div className="bg-[#F5F7FA] text-[#4A5568] py-1.5 sm:py-2 border-b border-[#E2E5E8] text-[11px] sm:text-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2">
        {/* Trust badge */}
        <div className="flex items-center gap-1.5 font-medium truncate">
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex-shrink-0">
            <Icons.Check size={10} strokeWidth={3} />
          </span>
          <span className="text-gray-900 font-bold truncate">100% Genuine Guaranteed</span>
          <span className="hidden md:inline text-gray-400">•</span>
          <span className="hidden md:inline text-gray-600">Express Delivery {siteConfig.city} & Provinces</span>
        </div>

        {/* Quick links & Direct Call */}
        <div className="flex items-center gap-2 sm:gap-4 font-medium flex-shrink-0">
          <Link
            href="/suivi"
            className="hidden sm:flex hover:text-[#0054A4] transition-colors items-center gap-1 text-gray-600"
          >
            <Icons.Truck size={13} className="text-[#0054A4]" />
            <span>Track Order</span>
          </Link>
          <span className="hidden sm:inline text-gray-300">|</span>
          <a
            href={`tel:${siteConfig.phone.replace(/\s+/g, '')}`}
            className="hover:text-[#0054A4] transition-colors flex items-center gap-1.5 font-bold text-gray-900 bg-white sm:bg-transparent px-2.5 py-1 sm:p-0 rounded-full sm:rounded-none border border-gray-200 sm:border-0 shadow-2xs sm:shadow-none"
            title="Call Customer Service"
          >
            <Icons.Phone size={13} className="text-emerald-600 flex-shrink-0" />
            <span className="text-[11px] sm:text-xs tracking-tight">{siteConfig.phone}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
