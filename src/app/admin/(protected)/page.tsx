'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getAdminOrdersAction } from '@/actions/orders';
import { getAdminTradeOffersAction } from '@/actions/trades';
import { getAdminProductsAction } from '@/actions/admin-products';
import { formatFCFA, getOrderStatusInfo, getTradeStatusInfo } from '@/lib/utils';
import { Icons } from '@/components/ui/Icons';
import { siteConfig } from '@/lib/site-config';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [tradeOffers, setTradeOffers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
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
        setProducts(productsRes.products);
      }
      setLoading(false);
    }

    loadDashboardData();
  }, []);

  // Calculs statistiques
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.status !== 'CANCELLED' && o.status !== 'REFUNDED')
      .reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  }, [orders]);

  const activeOrders = useMemo(() => {
    return orders.filter((o) => o.status === 'PAID' || o.status === 'PROCESSING' || o.status === 'SHIPPED').length;
  }, [orders]);

  const urgentOrders = useMemo(() => {
    return orders.filter((o) => o.status === 'PAID' || o.status === 'PROCESSING').length;
  }, [orders]);

  const pendingTrades = useMemo(() => {
    return tradeOffers.filter((t) => t.status === 'PENDING').length;
  }, [tradeOffers]);

  // Alertes de stock critique (produits avec totalStock <= 3)
  const lowStockProducts = useMemo(() => {
    return products.filter((p) => {
      const totalStock = p.variants?.reduce((acc: number, v: any) => acc + (v.stock || 0), 0) ?? 0;
      return totalStock <= 3;
    });
  }, [products]);

  // Activités récentes combinées (Dernières commandes + Derniers trocs + Alertes stock)
  const recentActivities = useMemo(() => {
    const list: any[] = [];

    // Ajouter les 4 dernières commandes
    orders.slice(0, 4).forEach((ord) => {
      list.push({
        id: `ord-${ord.id}`,
        type: 'COMMANDE',
        title: `Commande #${ord.orderNumber} - ${ord.customerName}`,
        subtitle: `${ord.items?.length || 1} article(s) • ${formatFCFA(ord.totalAmount)}`,
        status: ord.status,
        date: ord.createdAt,
        link: `/admin/commandes`,
      });
    });

    // Ajouter les 4 derniers trocs
    tradeOffers.slice(0, 4).forEach((troc) => {
      list.push({
        id: `troc-${troc.id}`,
        type: 'TROC',
        title: `Troc #${troc.id.slice(-6)} - ${troc.offeredDeviceModel}`,
        subtitle: `Cible : ${troc.productName} • Client : ${troc.customerName}`,
        status: troc.status,
        date: troc.createdAt,
        link: `/admin/troc`,
      });
    });

    // Ajouter les alertes stock
    lowStockProducts.slice(0, 3).forEach((prod) => {
      const totalStock = prod.variants?.reduce((acc: number, v: any) => acc + (v.stock || 0), 0) ?? 0;
      list.push({
        id: `stock-${prod.id}`,
        type: 'STOCK',
        title: `Stock critique : ${prod.name}`,
        subtitle: `${totalStock} restant(s) en stock (${prod.category?.name || 'Smartphones'})`,
        status: totalStock === 0 ? 'RUPTURE' : 'FAIBLE',
        date: prod.updatedAt || prod.createdAt || new Date().toISOString(),
        link: `/admin/produits`,
      });
    });

    // Trier par date décroissante
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);
  }, [orders, tradeOffers, lowStockProducts]);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Fil d'Ariane & En-tête Hero */}
      <div className="space-y-2">
        <nav aria-label="Breadcrumb" className="flex text-xs text-gray-500 font-bold">
          <ol className="inline-flex items-center space-x-1.5">
            <li className="inline-flex items-center">
              <Link href="/" className="hover:text-[#0062BD] transition-colors">
                Accueil
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <Icons.ChevronRight size={14} className="text-gray-400 mx-1" />
                <span className="text-[#1D2129] font-black">Dashboard</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-gray-900 tracking-tight">
              Tableau de Bord
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Supervision et opérations courantes de la boutique {siteConfig.name}.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <Link
              href="/admin/produits/nouveau"
              className="bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-heading font-black text-xs uppercase px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2"
            >
              <Icons.Plus size={16} />
              <span>Nouveau Produit</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Grille des 4 Cartes KPI / Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stat Card 1 : Chiffre d'affaires */}
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none text-emerald-600">
            <Icons.Wallet size={64} />
          </div>
          <div className="relative z-10 space-y-2">
            <h3 className="font-bold text-[11px] text-gray-500 uppercase tracking-wider">
              Chiffre d'affaires
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-black text-xl sm:text-2xl text-gray-900 font-price">
                {loading ? '...' : formatFCFA(totalRevenue)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Icons.Check size={12} />
                <span>Encaissé réel</span>
              </span>
              <span className="text-[10px] text-gray-400">Totalité des ventes</span>
            </div>
          </div>
        </div>

        {/* Stat Card 2 : Commandes en cours */}
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none text-[#0062BD]">
            <Icons.Truck size={64} />
          </div>
          <div className="relative z-10 space-y-2">
            <h3 className="font-bold text-[11px] text-gray-500 uppercase tracking-wider">
              Commandes en cours
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-black text-2xl text-gray-900 font-price">
                {loading ? '...' : activeOrders}
              </span>
              {urgentOrders > 0 && (
                <span className="text-[10px] font-black text-[#0062BD] bg-blue-100 px-2 py-0.5 rounded-full mb-1">
                  {urgentOrders} à préparer
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-400">À expédier ou en cours de livraison</p>
          </div>
        </div>

        {/* Stat Card 3 : Demandes de Troc */}
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none text-amber-600">
            <Icons.Repeat size={64} />
          </div>
          <div className="relative z-10 space-y-2">
            <h3 className="font-bold text-[11px] text-gray-500 uppercase tracking-wider">
              Demandes de Troc
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-black text-2xl text-gray-900 font-price">
                {loading ? '...' : tradeOffers.length}
              </span>
              {pendingTrades > 0 && (
                <span className="text-[10px] font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full mb-1 flex items-center gap-1 border border-amber-200">
                  <Icons.AlertCircle size={11} className="text-amber-700" />
                  <span>{pendingTrades} en attente</span>
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-400">Évaluations techniques d'anciens téléphones</p>
          </div>
        </div>

        {/* Stat Card 4 : Catalogue Produits */}
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none text-gray-800">
            <Icons.Smartphone size={64} />
          </div>
          <div className="relative z-10 space-y-2">
            <h3 className="font-bold text-[11px] text-gray-500 uppercase tracking-wider">
              Catalogue Produits
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-black text-2xl text-gray-900 font-price">
                {loading ? '...' : products.length}
              </span>
            </div>
            <p className="text-[10px] text-gray-400">Smartphones & accessoires actifs</p>
          </div>
        </div>
      </div>

      {/* 2 Panneaux d'Action Rapides (Action Panels) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Action Panel 1 : Gestion du Catalogue */}
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between hover:border-gray-300 transition-all">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FED700] text-[#1D2129] flex flex-shrink-0 items-center justify-center shadow-xs">
              <Icons.Smartphone size={28} />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-gray-900 mb-1">
                Gestion du Catalogue
              </h3>
              <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
                Ajoutez, modifiez ou supprimez des smartphones. Mettez à jour les stocks, variantes et éligibilités au troc.
              </p>
            </div>
          </div>
          <Link
            href="/admin/produits"
            className="bg-[#1D2129] hover:bg-[#0062BD] text-white font-heading font-black text-xs uppercase py-3 px-5 rounded-xl transition-all whitespace-nowrap flex-shrink-0 self-stretch sm:self-auto text-center"
          >
            Accéder au catalogue
          </Link>
        </div>

        {/* Action Panel 2 : Examen des Trocs */}
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between hover:border-gray-300 transition-all">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#191C22] text-[#FED700] flex flex-shrink-0 items-center justify-center shadow-xs">
              <Icons.Repeat size={28} />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-gray-900 mb-1">
                Examen des Trocs & Échanges
              </h3>
              <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
                Gérez les demandes de troc des clients. Validez les conditions, formulez des contre-offres et organisez les retraits.
              </p>
            </div>
          </div>
          <Link
            href="/admin/troc"
            className="bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-heading font-black text-xs uppercase py-3 px-5 rounded-xl transition-all whitespace-nowrap flex-shrink-0 self-stretch sm:self-auto text-center"
          >
            Voir les demandes
          </Link>
        </div>
      </div>

      {/* Tableau des Dernières Activités */}
      <div className="bg-white border border-[#E2E5E8] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div>
            <h3 className="font-heading font-bold text-sm text-gray-900">
              Dernières Activités
            </h3>
            <p className="text-[11px] text-gray-500">Flux combiné des commandes, trocs et alertes de stock en temps réel.</p>
          </div>
          <Link
            href="/admin/commandes"
            className="font-bold text-xs text-[#0062BD] hover:underline"
          >
            Tout voir →
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500">
            <div className="w-8 h-8 border-3 border-[#FED700] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p>Chargement des activités récentes...</p>
          </div>
        ) : recentActivities.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            <Icons.ShoppingBag size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="font-bold text-gray-700">Aucune activité enregistrée</p>
            <p className="text-[11px] text-gray-400">Les nouvelles commandes et propositions de troc apparaîtront ici.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-black uppercase text-gray-500 tracking-wider">
                  <th className="py-3 px-5">Type</th>
                  <th className="py-3 px-5">Détail de l'activité</th>
                  <th className="py-3 px-5 hidden sm:table-cell">Date</th>
                  <th className="py-3 px-5 text-right">Statut / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentActivities.map((act) => {
                  let typeIcon = <Icons.ShoppingBag size={16} className="text-[#0062BD]" />;
                  let typeBadgeClass = 'bg-blue-50 text-[#0062BD] border-blue-200';
                  let typeLabel = 'Commande';

                  if (act.type === 'TROC') {
                    typeIcon = <Icons.Repeat size={16} className="text-amber-600" />;
                    typeBadgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
                    typeLabel = 'Troc';
                  } else if (act.type === 'STOCK') {
                    typeIcon = <Icons.Smartphone size={16} className="text-red-600" />;
                    typeBadgeClass = 'bg-red-50 text-red-700 border-red-200';
                    typeLabel = 'Stock';
                  }

                  let statusBadge = (
                    <span className="text-[10px] font-bold bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full">
                      {act.status}
                    </span>
                  );

                  if (act.type === 'COMMANDE') {
                    const info = getOrderStatusInfo(act.status);
                    statusBadge = (
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${info.className}`}>
                        {info.label}
                      </span>
                    );
                  } else if (act.type === 'TROC') {
                    const info = getTradeStatusInfo(act.status);
                    statusBadge = (
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${info.className}`}>
                        {info.label}
                      </span>
                    );
                  } else if (act.type === 'STOCK') {
                    statusBadge = (
                      <span className="text-[10px] font-black bg-red-100 text-red-800 border border-red-200 px-2.5 py-0.5 rounded-full">
                        {act.status === 'RUPTURE' ? 'Rupture' : 'Stock faible'}
                      </span>
                    );
                  }

                  return (
                    <tr
                      key={act.id}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border ${typeBadgeClass}`}>
                          {typeIcon}
                          <span>{typeLabel}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <Link href={act.link} className="font-bold text-gray-900 hover:text-[#0062BD] block">
                          {act.title}
                        </Link>
                        <span className="text-[11px] text-gray-500 block">{act.subtitle}</span>
                      </td>
                      <td className="py-3.5 px-5 text-gray-400 text-[11px] whitespace-nowrap hidden sm:table-cell">
                        {new Date(act.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <Link href={act.link}>
                          {statusBadge}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
