'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/ui/Icons';
import { siteConfig } from '@/lib/site-config';

export function AdminHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Tableau de bord', href: '/admin', icon: Icons.TrendingUp, exact: true },
    { label: 'Catalogue Produits', href: '/admin/produits', icon: Icons.Smartphone, exact: false },
    { label: 'Commandes', href: '/admin/commandes', icon: Icons.ShoppingBag, exact: false },
    { label: 'Demandes de Troc', href: '/admin/troc', icon: Icons.Repeat, exact: false },
    { label: 'Avis Clients', href: '/admin/avis', icon: Icons.Star, exact: false },
  ];

  return (
    <header className="bg-[#1E293B] border-b border-gray-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Admin Caddie */}
          <div className="flex items-center gap-3">
            <Icons.BrandCart size={32} className="text-[#FED700] flex-shrink-0" />
            <div>
              <span className="font-heading font-black text-base text-white tracking-tight block leading-tight">
                {siteConfig.name}
              </span>
              <span className="text-[10px] font-bold text-[#FED700] uppercase tracking-widest block leading-none">
                Console d'Administration
              </span>
            </div>
          </div>

          {/* Navigation interne Admin */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                    isActive
                      ? 'bg-[#FED700] text-[#1D2129] shadow-xs'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Profil Admin & Déconnexion */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right text-xs">
              <span className="font-bold text-gray-200">{user?.firstName} {user?.lastName}</span>
              <span className="text-[10px] text-gray-400 font-medium">Administrateur</span>
            </div>

            <button
              onClick={() => logout('/admin/login')}
              title="Se déconnecter de l'administration"
              className="bg-red-950/60 hover:bg-red-900 border border-red-800/80 text-red-300 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Icons.Lock size={13} />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center gap-1 py-2 border-t border-gray-800 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[#FED700] text-[#1D2129]'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon size={13} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
