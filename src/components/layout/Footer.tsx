import React from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';
import { siteConfig } from '@/lib/site-config';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#111827] text-gray-400 pt-12 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b border-gray-800 text-xs">
          {/* Colonne 1: Marque & Coordonnées */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/images/logo/dealmart_logo_horizontal_transparent.svg"
                alt={siteConfig.name}
                className="h-9 w-auto object-contain brightness-0 invert"
              />
            </div>
            <p className="text-gray-400 leading-relaxed mb-5">
              {siteConfig.slogan}
            </p>

            <div className="flex items-start gap-3 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center text-gray-300 flex-shrink-0 mt-0.5">
                <Icons.Headset size={14} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Customer Service & Orders</p>
                <a href={`tel:${siteConfig.phone.replace(/\s+/g, '')}`} className="text-xs font-bold text-white hover:text-[#F1B20B] transition-colors">
                  {siteConfig.phone}
                </a>
              </div>
            </div>

            <div className="text-gray-400 space-y-1.5 pt-2">
              <p><span className="text-gray-500 font-medium">Location:</span> {siteConfig.address}</p>
              <p><span className="text-gray-500 font-medium">Email:</span> {siteConfig.email}</p>
              <p><span className="text-gray-500 font-medium">Hours:</span> {siteConfig.openingHours}</p>
            </div>
          </div>

          {/* Colonne 2: Rayons Populaires */}
          <div>
            <h4 className="font-heading text-xs font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-gray-800">
              Top Departments
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/boutique?category=electronics-gadgets" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <Icons.ChevronRight size={12} className="text-gray-600" />
                  <span>Electronics & Tech</span>
                </Link>
              </li>
              <li>
                <Link href="/boutique?category=beauty-cosmetics-skincare" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <Icons.ChevronRight size={12} className="text-gray-600" />
                  <span>Beauty, Cosmetics & Skincare</span>
                </Link>
              </li>
              <li>
                <Link href="/boutique?category=fashion-accessories" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <Icons.ChevronRight size={12} className="text-gray-600" />
                  <span>Fashion & Accessories</span>
                </Link>
              </li>
              <li>
                <Link href="/boutique?category=home-kitchen-living" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <Icons.ChevronRight size={12} className="text-gray-600" />
                  <span>Home, Kitchen & Living</span>
                </Link>
              </li>
              <li>
                <Link href="/boutique?promo=true" className="text-[#DC3545] hover:text-red-400 transition-colors flex items-center gap-2 font-bold">
                  <Icons.Flame size={12} />
                  <span>Flash Deals & Specials</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3: Service Client */}
          <div>
            <h4 className="font-heading text-xs font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-gray-800">
              Customer Care
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/suivi" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <Icons.Truck size={12} className="text-gray-600" />
                  <span>Track My Order</span>
                </Link>
              </li>
              <li>
                <Link href="/favoris" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <Icons.Heart size={12} className="text-gray-600" />
                  <span>Wishlist</span>
                </Link>
              </li>
              <li>
                <Link href="/compte" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <Icons.User size={12} className="text-gray-600" />
                  <span>My Account</span>
                </Link>
              </li>
              <li>
                <Link href="/compte/commandes" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <Icons.ShoppingBag size={12} className="text-gray-600" />
                  <span>Order History</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 4: Paiements & Sécurité */}
          <div>
            <h4 className="font-heading text-xs font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-gray-800">
              Payment & Security
            </h4>
            <p className="text-gray-400 mb-4 leading-relaxed">
              Safe & flexible checkout options available across Honiara and Solomon Islands.
            </p>

            <div className="flex flex-col gap-2 my-4 text-[11px] text-gray-300">
              <div className="flex items-center gap-2 bg-gray-800/80 p-2 rounded-lg border border-gray-700">
                <Icons.Wallet size={16} className="text-[#F1B20B]" />
                <span className="font-semibold">Cash on Delivery (Honiara)</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-800/80 p-2 rounded-lg border border-gray-700">
                <Icons.CreditCard size={16} className="text-[#0054A4]" />
                <span className="font-semibold">Direct Bank Transfer (BSP / ANZ)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-gray-400 pt-2">
              <Icons.ShieldCheck size={14} className="text-gray-500" />
              <span>100% Genuine Products & Local Support</span>
            </div>
          </div>
        </div>

        {/* Copyright & Mentions */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-gray-500">
          <p className="text-center sm:text-left">© {new Date().getFullYear()} {siteConfig.name} • Operated by {siteConfig.legalName}. All rights reserved. {siteConfig.city}, {siteConfig.country}.</p>
          <div className="flex flex-wrap justify-center sm:justify-end items-center gap-x-4 gap-y-2 text-gray-500 text-center sm:text-right">
            <Link href="/cgv" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
            <span>•</span>
            <Link href="/confidentialite" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
