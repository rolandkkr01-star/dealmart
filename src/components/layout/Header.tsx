'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/ui/Icons';
import { formatPrice } from '@/lib/utils';
import { siteConfig } from '@/lib/site-config';

export const Header: React.FC = () => {
  const router = useRouter();
  const { wishlist, cartCount, total, setIsCartDrawerOpen } = useCart();
  const { user, isAdmin, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('ALL');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    }
    if (searchCategory !== 'ALL') {
      params.set('brand', searchCategory);
    }
    const queryString = params.toString();
    router.push(queryString ? `/boutique?${queryString}` : '/boutique');
  };

  return (
    <header className="bg-white border-b border-[#E2E5E8] sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4 sm:gap-8">
        {/* 1. Logo & Identité Boutique */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <img
            src="/images/logo/dealmart_logo_horizontal_transparent.svg"
            alt={siteConfig.name}
            className="h-8 sm:h-10 w-auto object-contain transition-transform group-hover:scale-[1.02]"
          />
        </Link>

        {/* 2. Barre de recherche avec sélecteur de catégorie */}
        <div className="flex-1 max-w-2xl hidden md:block">
          <form onSubmit={handleSearch} className="flex items-center">
            <div className="relative flex-1 flex border-2 border-[#F1B20B] rounded-xl overflow-hidden shadow-xs focus-within:border-[#0054A4] transition-colors">
              {/* Sélecteur de rayon */}
              <select
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="bg-gray-50 text-xs font-semibold text-gray-700 border-r border-gray-200 px-3 py-2.5 outline-none cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <option value="ALL">All Categories</option>
                <option value="electronics-gadgets">Electronics & Tech</option>
                <option value="beauty-cosmetics-skincare">Beauty & Skincare</option>
                <option value="fashion-accessories">Fashion & Style</option>
                <option value="home-kitchen-living">Home & Living</option>
              </select>

              {/* Champ texte */}
              <input
                type="text"
                placeholder="Search products across Solomon Islands (Electronics, Beauty, Fashion, Home)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 outline-none"
              />

              {/* Bouton de recherche */}
              <button
                type="submit"
                className="bg-[#F1B20B] hover:bg-[#D99F07] text-[#1D2129] px-6 font-bold flex items-center justify-center transition-colors cursor-pointer"
                title="Search"
              >
                <Icons.Search size={18} />
              </button>
            </div>
          </form>
        </div>

        {/* 3. User actions (Account, Wishlist, Cart) */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Account / Sign in */}
          <div className="relative">
            {user ? (
              <div>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 text-gray-700 hover:text-[#0054A4] transition-colors p-1.5 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${isAdmin ? 'bg-[#1D2129] text-[#F1B20B]' : 'bg-[#0054A4] text-white'}`}>
                    {user.firstName ? user.firstName[0] : 'U'}{user.lastName ? user.lastName[0] : ''}
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-[10px] text-gray-500 leading-tight">
                      Hello,
                    </span>
                    <span className="text-xs font-bold text-gray-900 leading-tight truncate max-w-[100px]">
                      {user.firstName}
                    </span>
                  </div>
                  <Icons.ChevronDown size={14} className="text-gray-400" />
                </button>

                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-[#E2E5E8] rounded-xl shadow-xl z-50 py-2 text-xs divide-y divide-gray-100">
                      <div className="px-4 py-2.5 bg-gray-50/70">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <p className="font-bold text-gray-900">{user.firstName} {user.lastName}</p>
                          {user.role !== 'CLIENT' && (
                            <span className="bg-amber-100 text-amber-900 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                      </div>

                      <div className="py-1">
                        {user.role === 'CLIENT' ? (
                          <>
                            <Link
                              href="/compte"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-[#0054A4] font-medium"
                            >
                              <Icons.User size={14} />
                              <span>My Account</span>
                            </Link>
                            <Link
                              href="/compte/commandes"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-[#0054A4] font-medium"
                            >
                              <Icons.ShoppingBag size={14} />
                              <span>My Orders</span>
                            </Link>
                          </>
                        ) : (
                          <Link
                            href="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-amber-900 bg-amber-50/60 hover:bg-amber-100 font-bold"
                          >
                            <Icons.TrendingUp size={14} className="text-amber-700" />
                            <span>Admin Console</span>
                          </Link>
                        )}
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-red-600 hover:bg-red-50 font-bold text-left cursor-pointer"
                        >
                          <Icons.X size={14} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/connexion"
                className="flex items-center gap-2 text-gray-700 hover:text-[#0054A4] transition-colors p-1.5 rounded-lg hover:bg-gray-50"
                title="Sign in"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700">
                  <Icons.User size={20} />
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-[10px] text-gray-500 leading-tight">My Account</span>
                  <span className="text-xs font-bold text-gray-900 leading-tight">Sign In</span>
                </div>
              </Link>
            )}
          </div>

          {/* Favoris (Publics) */}
          <Link
            href="/favoris"
            className="relative p-2 text-gray-700 hover:text-[#DC3545] transition-colors rounded-lg hover:bg-gray-50 flex items-center justify-center"
            title="Wishlist"
          >
            <Icons.Heart size={24} className={wishlist.length > 0 ? "text-[#DC3545] fill-[#DC3545]" : ""} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#F1B20B] text-[#1D2129] border border-white font-extrabold rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-xs">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Interactive Cart */}
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="flex items-center gap-3 bg-gray-50 hover:bg-amber-50/80 p-2 sm:px-3 sm:py-2 rounded-xl border border-gray-200 hover:border-[#F1B20B] transition-all cursor-pointer group"
            title="Open Cart"
          >
            <div className="relative">
              <Icons.ShoppingCart size={24} className="text-gray-800 group-hover:text-[#0054A4] transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#DC3545] text-white font-extrabold rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-xs animate-pulse">
                  {cartCount}
                </span>
              )}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[10px] text-gray-500 leading-tight">Cart</span>
              <span className="text-xs font-price font-extrabold text-gray-900 leading-tight">
                {formatPrice(total || 0)}
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
