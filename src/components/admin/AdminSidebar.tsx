'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/ui/Icons';
import { siteConfig } from '@/lib/site-config';

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Tableau de bord', href: '/admin', icon: Icons.TrendingUp, exact: true },
    { label: 'Catalogue Produits', href: '/admin/produits', icon: Icons.Smartphone, exact: false },
    { label: 'Commandes', href: '/admin/commandes', icon: Icons.ShoppingBag, exact: false },
    { label: 'Demandes de Troc', href: '/admin/troc', icon: Icons.Repeat, exact: false },
    { label: 'Avis Clients', href: '/admin/avis', icon: Icons.Star, exact: false },
  ];

  return (
    <>
      {/* Top Header pour Mobile */}
      <header className="md:hidden h-16 fixed top-0 left-0 w-full z-40 bg-[#1D2129] border-b border-gray-800 flex justify-between items-center px-4 shadow-sm text-white">
        <div className="flex items-center gap-2.5">
          <Icons.BrandCart size={28} className="text-[#FED700]" />
          <div>
            <h1 className="font-heading font-black text-base text-[#FED700] tracking-tight leading-tight">
              {siteConfig.name}
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none">
              Admin Console
            </p>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-gray-800 text-gray-300 hover:text-white cursor-pointer"
          aria-label="Menu"
        >
          {mobileMenuOpen ? <Icons.X size={20} /> : <Icons.Menu size={20} />}
        </button>
      </header>

      {/* Mobile Menu Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex">
          <div className="w-72 bg-[#191C22] h-full flex flex-col p-5 text-white shadow-2xl border-r border-gray-800">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800 mb-4">
              <div className="flex items-center gap-2.5">
                <Icons.BrandCart size={28} className="text-[#FED700]" />
                <div>
                  <h2 className="font-heading font-black text-base text-[#FED700]">{siteConfig.name}</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Console Admin</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white"
              >
                <Icons.X size={18} />
              </button>
            </div>

            <nav className="flex-1 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#FED700] text-[#1D2129] shadow-xs'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/70'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Profil Mobile */}
            <div className="pt-4 border-t border-gray-800 mt-auto space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-800 text-[#FED700] flex items-center justify-center font-black">
                  <Icons.User size={18} />
                </div>
                <div className="truncate">
                  <p className="font-bold text-xs text-white truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[10px] text-gray-400">Administrateur</p>
                </div>
              </div>
              <button
                onClick={() => logout('/admin/login')}
                className="w-full bg-red-950/50 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Icons.Lock size={13} />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Desktop Fixed SideNavBar */}
      <aside className="w-64 h-full fixed left-0 top-0 border-r border-gray-800/60 bg-[#191C22] shadow-xl z-30 flex-col hidden md:flex text-white">
        {/* Brand Header */}
        <div className="p-6 border-b border-gray-800/80 mb-2">
          <div className="flex items-center gap-3">
            <Icons.BrandCart size={32} className="text-[#FED700] flex-shrink-0" />
            <div>
              <h1 className="font-heading font-black text-xl text-[#FED700] tracking-tight leading-tight">
                {siteConfig.name}
              </h1>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider opacity-80 leading-none">
                Admin Console
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col gap-1.5 py-4 px-3 overflow-y-auto flex-grow">
          {navItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#FED700] text-[#1D2129] font-black shadow-xs translate-x-1'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/60 hover:translate-x-1'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-[#1D2129]' : 'text-gray-400'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Public Store Link */}
        <div className="px-4 py-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between p-3 rounded-xl bg-gray-800/40 hover:bg-gray-800 border border-gray-700/60 text-xs font-bold text-gray-300 hover:text-white transition-all group"
          >
            <span className="flex items-center gap-2">
              <Icons.ExternalLink size={14} className="text-[#FED700]" />
              <span>Voir la Boutique</span>
            </span>
            <Icons.ChevronRight size={14} className="text-gray-500 group-hover:text-white transition-colors" />
          </Link>
        </div>

        {/* Footer Profile & Logout */}
        <div className="p-4 border-t border-gray-800/80 mt-auto bg-[#14171C]/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-9 h-9 rounded-xl bg-gray-800 text-[#FED700] flex items-center justify-center font-bold flex-shrink-0 border border-gray-700">
              <Icons.User size={18} />
            </div>
            <div className="truncate">
              <p className="font-bold text-xs text-white truncate">{user?.firstName || 'Admin'} {user?.lastName || ''}</p>
              <p className="text-[10px] text-gray-400 font-medium truncate">{user?.email || 'Administrateur'}</p>
            </div>
          </div>

          <button
            onClick={() => logout('/admin/login')}
            title="Se déconnecter"
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer flex-shrink-0"
          >
            <Icons.Lock size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}
