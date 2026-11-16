'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { getUserOrdersAction } from '@/actions/orders';
import { formatPrice, getOrderStatusInfo } from '@/lib/utils';
import { Icons } from '@/components/ui/Icons';

export default function ClientDashboardPage() {
  const { user, logout } = useAuth();
  const { wishlist } = useCart();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await getUserOrdersAction();
      if (res.success && Array.isArray(res.orders)) {
        setOrders(res.orders);
      }
      setLoadingOrders(false);
    }
    load();
  }, []);

  const pendingOrders = orders.filter((o) => o.status === 'PENDING');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Entête client */}
      <div className="bg-white border border-[#E2E5E8] rounded-3xl p-6 sm:p-8 shadow-xs mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0054A4] text-white flex items-center justify-center font-heading font-black text-xl shadow-xs">
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

      {/* Alerte si des commandes sont en attente de règlement */}
      {pendingOrders.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 mb-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center flex-shrink-0">
                <Icons.AlertCircle size={22} />
              </div>
              <div>
                <h3 className="font-heading font-black text-sm text-gray-900">
                  Vous avez {pendingOrders.length} commande(s) en attente de paiement
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  Finalisez votre paiement Mobile Money pour que notre équipe prépare et expédie votre colis.
                </p>
              </div>
            </div>
            <Link
              href="/compte/commandes"
              className="bg-[#F1B20B] hover:bg-[#D99F07] text-[#1D2129] font-heading font-black text-xs uppercase px-6 py-3 rounded-xl shadow-xs transition-all inline-flex items-center gap-2"
            >
              <Icons.CreditCard size={16} />
              <span>Régler maintenant</span>
            </Link>
          </div>
        </div>
      )}

      {/* Cartes KPI / Raccourcis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <Link
          href="/compte/commandes"
          className="bg-white border border-[#E2E5E8] hover:border-[#0054A4] rounded-3xl p-6 shadow-xs transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Mes Commandes</span>
            <span className="font-heading font-black text-xl text-gray-900">
              {orders.length} commande(s)
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0054A4] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Icons.ShoppingBag size={24} />
          </div>
        </Link>

        <Link
          href="/compte/adresses"
          className="bg-white border border-[#E2E5E8] hover:border-emerald-500 rounded-3xl p-6 shadow-xs transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Mes Adresses</span>
            <span className="font-heading font-black text-xl text-gray-900">Lieux de livraison</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Icons.MapPin size={24} />
          </div>
        </Link>

        <Link
          href="/compte/troc"
          className="bg-white border border-[#E2E5E8] hover:border-[#F1B20B] rounded-3xl p-6 shadow-xs transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Mes Échanges</span>
            <span className="font-heading font-black text-xl text-[#1D2129]">Propositions de Troc</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#1D2129] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Icons.Repeat size={24} className="text-[#1D2129]" />
          </div>
        </Link>

        <Link
          href="/favoris"
          className="bg-white border border-[#E2E5E8] hover:border-[#DC3545] rounded-3xl p-6 shadow-xs transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Mes Favoris</span>
            <span className="font-heading font-black text-xl text-[#DC3545] font-price">{wishlist.length} article(s)</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#DC3545] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Icons.Heart size={24} />
          </div>
        </Link>
      </div>

      {/* Dernières Commandes Récentes */}
      <div className="bg-white border border-[#E2E5E8] rounded-3xl p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
          <h2 className="font-heading font-black text-base text-gray-900">
            Dernières Commandes
          </h2>
          <Link href="/compte/commandes" className="text-xs font-bold text-[#0054A4] hover:underline">
            Voir tout ({orders.length}) →
          </Link>
        </div>

        {loadingOrders ? (
          <div className="py-8 text-center text-xs text-gray-400">Chargement...</div>
        ) : orders.length === 0 ? (
          <p className="text-xs text-gray-500 py-4">Aucune commande enregistrée.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {orders.slice(0, 3).map((ord) => {
              const statusInfo = getOrderStatusInfo(ord.status);
              const isPending = ord.status === 'PENDING';
              return (
                <div key={ord.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-heading font-black text-sm text-gray-900">#{ord.orderNumber}</span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400 block mt-0.5">
                      {new Date(ord.createdAt).toLocaleDateString('fr-FR')} • {formatPrice(ord.totalAmount)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isPending ? (
                      <Link
                        href={`/commande/${ord.orderNumber}`}
                        className="bg-[#F1B20B] hover:bg-[#D99F07] text-[#1D2129] font-bold text-xs uppercase px-4 py-2 rounded-xl transition-all"
                      >
                        Payer
                      </Link>
                    ) : (
                      <Link
                        href={`/commande/${ord.orderNumber}`}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs px-4 py-2 rounded-xl transition-all"
                      >
                        Suivi
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Actions rapides */}
      <div className="bg-white border border-[#E2E5E8] rounded-3xl p-6 shadow-xs">
        <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-gray-900 mb-4 pb-2 border-b border-gray-100">
          Actions rapides
        </h3>
        <div className="flex flex-wrap gap-4 text-xs">
          <Link
            href="/boutique"
            className="bg-[#F1B20B] hover:bg-[#D99F07] text-[#1D2129] font-heading font-black text-xs uppercase px-5 py-3 rounded-xl inline-block shadow-xs"
          >
            Explorer les rayons & articles DealMart
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
