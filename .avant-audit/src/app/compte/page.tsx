'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Icons } from '@/components/ui/Icons';

export default function ClientDashboardPage() {
  const { user, logout } = useAuth();
  const { wishlist } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Entête client */}
      <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 sm:p-8 shadow-xs mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0062BD] text-white flex items-center justify-center font-heading font-black text-xl shadow-xs">
            {user?.firstName ? user.firstName[0].toUpperCase() : 'U'}
            {user?.lastName ? user.lastName[0].toUpperCase() : ''}
          </div>
          <div>
            <h1 className="font-heading font-black text-xl sm:text-2xl text-gray-900">
              Bienvenue, {user?.firstName} {user?.lastName} !
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {user?.email} {user?.phone ? `• ${user.phone}` : ''}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="bg-red-50 hover:bg-red-100 text-[#DC3545] text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Icons.X size={14} />
          <span>Se déconnecter</span>
        </button>
      </div>

      {/* Cartes KPI / Raccourcis */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <Link
          href="/compte/commandes"
          className="bg-white border border-[#E2E5E8] hover:border-[#0062BD] rounded-2xl p-6 shadow-xs transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Mes Commandes</span>
            <span className="font-heading font-black text-lg text-gray-900">Historique & Suivi</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0062BD] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Icons.ShoppingBag size={24} />
          </div>
        </Link>

        <Link
          href="/compte/troc"
          className="bg-white border border-[#E2E5E8] hover:border-[#FED700] rounded-2xl p-6 shadow-xs transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Mes Échanges</span>
            <span className="font-heading font-black text-lg text-[#1D2129]">Propositions de Troc</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#1D2129] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Icons.Repeat size={24} className="text-[#1D2129]" />
          </div>
        </Link>

        <Link
          href="/favoris"
          className="bg-white border border-[#E2E5E8] hover:border-[#DC3545] rounded-2xl p-6 shadow-xs transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Mes Favoris</span>
            <span className="font-heading font-black text-lg text-[#DC3545] font-price">{wishlist.length} article(s)</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 text-[#DC3545] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Icons.Heart size={24} />
          </div>
        </Link>
      </div>

      <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-xs">
        <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-gray-900 mb-4 pb-2 border-b border-gray-100">
          Actions rapides
        </h3>
        <div className="flex flex-wrap gap-4 text-xs">
          <Link
            href="/boutique"
            className="bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-heading font-black text-xs uppercase px-5 py-3 rounded-xl inline-block shadow-xs"
          >
            Explorer les smartphones & accessoires
          </Link>
          <Link
            href="/suivi"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-5 py-3 rounded-xl inline-block"
          >
            Suivre un colis par référence
          </Link>
        </div>
      </div>
    </div>
  );
}
