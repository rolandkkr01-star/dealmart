'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/ui/Icons';
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
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
          <Icons.BrandCart
            size={36}
            className="text-[#1D2129] group-hover:text-[#0062BD] transition-all flex-shrink-0 sm:w-[42px] sm:h-[42px]"
          />
          <div className="flex flex-col">
            <span className="font-heading font-black text-xl sm:text-2xl tracking-tight text-[#1D2129] group-hover:text-[#0062BD] leading-none transition-colors">
              {siteConfig.name}
            </span>
            <span className="text-[9px] sm:text-[10px] text-gray-500 font-semibold tracking-wider uppercase mt-0.5">
              {siteConfig.country} • 100% Original
            </span>
          </div>
        </Link>

        {/* 2. Barre de recherche avec sélecteur de catégorie */}
        <div className="flex-1 max-w-2xl hidden md:block">
          <form onSubmit={handleSearch} className="flex items-center">
            <div className="relative flex-1 flex border-2 border-[#FED700] rounded-xl overflow-hidden shadow-xs focus-within:border-[#0062BD] transition-colors">
              {/* Sélecteur de rayon */}
              <select
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="bg-gray-50 text-xs font-semibold text-gray-700 border-r border-gray-200 px-3 py-2.5 outline-none cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <option value="ALL">Tous les rayons</option>
                <option value="IPHONE">Apple iPhone</option>
                <option value="SAMSUNG">Samsung Galaxy</option>
                <option value="ACCESSOIRE">Accessoires</option>
              </select>

              {/* Champ texte */}
              <input
                type="text"
                placeholder="Quel smartphone ou accessoire recherchez-vous (iPhone 15 Pro, S24 Ultra, chargeur 20W)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 outline-none"
              />

              {/* Bouton de recherche */}
              <button
                type="submit"
                className="bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] px-6 font-bold flex items-center justify-center transition-colors cursor-pointer"
                title="Lancer la recherche"
              >
                <Icons.Search size={18} />
              </button>
            </div>
          </form>
        </div>

        {/* 3. Actions utilisateur (Compte, Favoris, Panier) */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Espace Compte / Connexion */}
          <div className="relative">
            {user ? (
              <div>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 text-gray-700 hover:text-[#0062BD] transition-colors p-1.5 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${isAdmin ? 'bg-[#1D2129] text-[#FED700]' : 'bg-[#0062BD] text-white'}`}>
                    {user.firstName ? user.firstName[0] : 'U'}{user.lastName ? user.lastName[0] : ''}
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-[10px] text-gray-500 leading-tight">
                      Bonjour
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
                              className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-[#0062BD] font-medium"
                            >
                              <Icons.User size={14} />
                              <span>Mon Espace Client</span>
                            </Link>
                            <Link
                              href="/compte/commandes"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-[#0062BD] font-medium"
                            >
                              <Icons.ShoppingBag size={14} />
                              <span>Mes Commandes</span>
                            </Link>
                            <Link
                              href="/compte/troc"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-[#0062BD] font-medium"
                            >
                              <Icons.Repeat size={14} />
                              <span>Mes Trocs</span>
                            </Link>
                          </>
                        ) : (
                          <Link
                            href="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-amber-900 bg-amber-50/60 hover:bg-amber-100 font-bold"
                          >
                            <Icons.TrendingUp size={14} className="text-amber-700" />
                            <span>Console d'Administration</span>
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
                          <span>Se Déconnecter</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/connexion"
                className="flex items-center gap-2 text-gray-700 hover:text-[#0062BD] transition-colors p-1.5 rounded-lg hover:bg-gray-50"
                title="Se connecter"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700">
                  <Icons.User size={20} />
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-[10px] text-gray-500 leading-tight">Mon Compte</span>
                  <span className="text-xs font-bold text-gray-900 leading-tight">Connexion</span>
                </div>
              </Link>
            )}
          </div>

          {/* Favoris (Publics) */}
          <Link
            href="/favoris"
            className="relative p-2 text-gray-700 hover:text-[#DC3545] transition-colors rounded-lg hover:bg-gray-50 flex items-center justify-center"
            title="Mes Favoris"
          >
            <Icons.Heart size={24} className={wishlist.length > 0 ? "text-[#DC3545] fill-[#DC3545]" : ""} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#FED700] text-[#1D2129] border border-white font-extrabold rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-xs">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Panier Interactif */}
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="flex items-center gap-3 bg-gray-50 hover:bg-amber-50/80 p-2 sm:px-3 sm:py-2 rounded-xl border border-gray-200 hover:border-[#FED700] transition-all cursor-pointer group"
            title="Ouvrir mon Panier"
          >
            <div className="relative">
              <Icons.ShoppingCart size={24} className="text-gray-800 group-hover:text-[#0062BD] transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#DC3545] text-white font-extrabold rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-xs animate-pulse">
                  {cartCount}
                </span>
              )}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[10px] text-gray-500 leading-tight">Mon Panier</span>
              <span className="text-xs font-price font-extrabold text-gray-900 leading-tight">
                {(total || 0).toLocaleString('fr-FR')} F
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
