'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAdminOrdersAction } from '@/actions/orders';
import { getAdminTradeOffersAction } from '@/actions/trades';
import { getAdminProductsAction } from '@/actions/admin-products';
import { formatFCFA } from '@/lib/utils';
import { Icons } from '@/components/ui/Icons';
import { siteConfig } from '@/lib/site-config';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [tradeOffers, setTradeOffers] = useState<any[]>([]);
  const [productsCount, setProductsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      const [ordersRes, tradesRes, productsRes] = await Promise.all([
        getAdminOrdersAction(),
        getAdminTradeOffersAction(),
        getAdminProductsAction(),
      ]);

      if (ordersRes.success && Array.isArray(ordersRes.orders)) {
        setOrders(ordersRes.orders);
      }
      if (tradesRes.success && Array.isArray(tradesRes.offers)) {
        setTradeOffers(tradesRes.offers);
      }
      if (productsRes.success && Array.isArray(productsRes.products)) {
        setProductsCount(productsRes.products.length);
      }
      setLoading(false);
    }

    loadStats();
  }, []);

  const totalRevenue = orders
    .filter((o) => o.status !== 'CANCELLED' && o.status !== 'REFUNDED')
    .reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  const pendingTrades = tradeOffers.filter((t) => t.status === 'PENDING').length;
  const activeOrders = orders.filter((o) => o.status === 'PAID' || o.status === 'PROCESSING' || o.status === 'SHIPPED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Admin */}
      <div className="bg-[#1D2129] text-white rounded-2xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-gray-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#FED700] text-[#1D2129] font-black text-[10px] uppercase px-2.5 py-0.5 rounded">
              ADMINISTRATEUR
            </span>
            <span className="text-xs text-gray-300 flex items-center gap-1.5 font-medium">
              <Icons.BrandCart size={14} className="text-[#FED700]" />
              <span>Panel de Gestion {siteConfig.name}</span>
            </span>
          </div>
          <h1 className="font-heading font-black text-2xl text-white tracking-tight">
            Tableau de Bord & Supervision
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/troc"
            className="bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-bold text-xs uppercase px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Icons.Repeat size={14} />
            <span>Examiner les Trocs ({pendingTrades})</span>
          </Link>
        </div>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-xs">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Chiffre d'Affaires</span>
          <span className="font-heading font-black text-2xl text-emerald-600 font-price">
            {loading ? '...' : formatFCFA(totalRevenue)}
          </span>
          <span className="text-[11px] text-gray-400 block mt-1">Transactions réelles validées</span>
        </div>

        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-xs">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Commandes en Cours</span>
          <span className="font-heading font-black text-2xl text-[#0062BD] font-price">
            {loading ? '...' : activeOrders}
          </span>
          <span className="text-[11px] text-gray-400 block mt-1">À préparer ou en livraison</span>
        </div>

        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-xs">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Demandes de Troc</span>
          <span className="font-heading font-black text-2xl text-[#1D2129] font-price">
            {loading ? '...' : `${pendingTrades} en attente`}
          </span>
          <span className="text-[11px] text-amber-600 font-semibold block mt-1">Nécessite évaluation</span>
        </div>

        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-xs">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Catalogue Produits</span>
          <span className="font-heading font-black text-2xl text-gray-900 font-price">
            {loading ? '...' : `${productsCount} référence(s)`}
          </span>
          <span className="text-[11px] text-gray-400 block mt-1">En base de données</span>
        </div>
      </div>

      {/* Raccourcis de navigation Admin */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/admin/produits"
          className="bg-white border border-[#E2E5E8] hover:border-[#FED700] rounded-2xl p-6 shadow-xs transition-all flex items-center justify-between group"
        >
          <div>
            <h3 className="font-heading font-bold text-base text-gray-900 mb-1">Gestion du Catalogue</h3>
            <p className="text-xs text-gray-500">Ajouter des smartphones, gérer stocks, prix et trocs</p>
          </div>
          <Icons.ChevronRight size={20} className="text-gray-400 group-hover:text-[#FED700] transition-colors" />
        </Link>

        <Link
          href="/admin/commandes"
          className="bg-white border border-[#E2E5E8] hover:border-[#0062BD] rounded-2xl p-6 shadow-xs transition-all flex items-center justify-between group"
        >
          <div>
            <h3 className="font-heading font-bold text-base text-gray-900 mb-1">Gestion des Commandes</h3>
            <p className="text-xs text-gray-500">Mettre à jour les statuts (En préparation, Expédiée, Livrée)</p>
          </div>
          <Icons.ChevronRight size={20} className="text-gray-400 group-hover:text-[#0062BD] transition-colors" />
        </Link>

        <Link
          href="/admin/troc"
          className="bg-white border border-[#E2E5E8] hover:border-[#FED700] rounded-2xl p-6 shadow-xs transition-all flex items-center justify-between group"
        >
          <div>
            <h3 className="font-heading font-bold text-base text-gray-900 mb-1">Examen des Trocs & Échanges</h3>
            <p className="text-xs text-gray-500">Examiner les photos, accepter ou contre-proposer un montant</p>
          </div>
          <Icons.ChevronRight size={20} className="text-gray-400 group-hover:text-[#FED700] transition-colors" />
        </Link>
      </div>
    </div>
  );
}
