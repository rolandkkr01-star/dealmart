'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getAdminOrdersAction } from '@/actions/orders';
import { getAdminProductsAction } from '@/actions/admin-products';
import { formatPrice, getOrderStatusInfo } from '@/lib/utils';
import { Icons } from '@/components/ui/Icons';
import { siteConfig } from '@/lib/site-config';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      const [ordersRes, productsRes] = await Promise.all([
        getAdminOrdersAction(),
        getAdminProductsAction(),
      ]);

      if (ordersRes.success && Array.isArray(ordersRes.orders)) {
        setOrders(ordersRes.orders);
      }
      if (productsRes.success && Array.isArray(productsRes.products)) {
        setProducts(productsRes.products);
      }
      setLoading(false);
    }

    loadDashboardData();
  }, []);

  // Statistical calculations
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

  // Low stock products (totalStock <= 3)
  const lowStockProducts = useMemo(() => {
    return products.filter((p) => {
      const totalStock = p.variants?.reduce((acc: number, v: any) => acc + (v.stock || 0), 0) ?? 0;
      return totalStock <= 3;
    });
  }, [products]);

  // Combined recent activities (Recent orders + Stock alerts)
  const recentActivities = useMemo(() => {
    const list: any[] = [];

    // Add up to 6 recent orders
    orders.slice(0, 6).forEach((ord) => {
      list.push({
        id: `ord-${ord.id}`,
        type: 'ORDER',
        title: `Order #${ord.orderNumber} - ${ord.customerName}`,
        subtitle: `${ord.items?.length || 1} item(s) • ${formatPrice(ord.totalAmount)}`,
        status: ord.status,
        date: ord.createdAt,
        link: `/admin/commandes`,
      });
    });

    // Add stock alerts
    lowStockProducts.slice(0, 3).forEach((prod) => {
      const totalStock = prod.variants?.reduce((acc: number, v: any) => acc + (v.stock || 0), 0) ?? 0;
      list.push({
        id: `stock-${prod.id}`,
        type: 'STOCK',
        title: `Low Stock: ${prod.name}`,
        subtitle: `${totalStock} unit(s) remaining (${prod.category?.name || 'Catalog'})`,
        status: totalStock === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
        date: prod.updatedAt || prod.createdAt || new Date().toISOString(),
        link: `/admin/produits`,
      });
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);
  }, [orders, lowStockProducts]);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Breadcrumb & Header */}
      <div className="space-y-2">
        <nav aria-label="Breadcrumb" className="flex text-xs text-gray-500 font-bold">
          <ol className="inline-flex items-center space-x-1.5">
            <li className="inline-flex items-center">
              <Link href="/" className="hover:text-[#0054A4] transition-colors">
                Storefront
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
              Admin Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Supervision and store operations for {siteConfig.name}.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <Link
              href="/admin/produits/nouveau"
              className="bg-[#F1B20B] hover:bg-[#D99F07] text-[#1D2129] font-heading font-black text-xs uppercase px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2"
            >
              <Icons.Plus size={16} />
              <span>New Product</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stat Card 1 : Revenue */}
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none text-emerald-600">
            <Icons.Wallet size={64} />
          </div>
          <div className="relative z-10 space-y-2">
            <h3 className="font-bold text-[11px] text-gray-500 uppercase tracking-wider">
              Total Revenue
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-black text-xl sm:text-2xl text-gray-900 font-price">
                {loading ? '...' : formatPrice(totalRevenue)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Icons.Check size={12} />
                <span>Realized Sales</span>
              </span>
              <span className="text-[10px] text-gray-400">Excluding cancelled</span>
            </div>
          </div>
        </div>

        {/* Stat Card 2 : Active Orders */}
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none text-[#0054A4]">
            <Icons.Truck size={64} />
          </div>
          <div className="relative z-10 space-y-2">
            <h3 className="font-bold text-[11px] text-gray-500 uppercase tracking-wider">
              Active Orders
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-black text-2xl text-gray-900 font-price">
                {loading ? '...' : activeOrders}
              </span>
              {urgentOrders > 0 && (
                <span className="text-[10px] font-black text-[#0054A4] bg-blue-100 px-2 py-0.5 rounded-full mb-1">
                  {urgentOrders} to fulfill
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-400">Processing or out for delivery</p>
          </div>
        </div>

        {/* Stat Card 3 : Live Products */}
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none text-gray-800">
            <Icons.Package size={64} />
          </div>
          <div className="relative z-10 space-y-2">
            <h3 className="font-bold text-[11px] text-gray-500 uppercase tracking-wider">
              Live Products
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-black text-2xl text-gray-900 font-price">
                {loading ? '...' : products.length}
              </span>
            </div>
            <p className="text-[10px] text-gray-400">Published in active catalog</p>
          </div>
        </div>

        {/* Stat Card 4 : Stock Alerts */}
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none text-red-600">
            <Icons.AlertCircle size={64} />
          </div>
          <div className="relative z-10 space-y-2">
            <h3 className="font-bold text-[11px] text-gray-500 uppercase tracking-wider">
              Low Stock Alerts
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-black text-2xl text-red-600 font-price">
                {loading ? '...' : lowStockProducts.length}
              </span>
              {lowStockProducts.length > 0 && (
                <span className="text-[10px] font-black text-red-900 bg-red-100 px-2 py-0.5 rounded-full mb-1 border border-red-200">
                  Restock required
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-400">Items with stock ≤ 3</p>
          </div>
        </div>
      </div>

      {/* Quick Action Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Action Panel 1 : Catalog */}
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between hover:border-gray-300 transition-all">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F1B20B] text-[#1D2129] flex flex-shrink-0 items-center justify-center shadow-xs">
              <Icons.Package size={28} />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-gray-900 mb-1">
                Catalog Management
              </h3>
              <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
                Add, update, or organize products across all departments (Electronics, Beauty, Fashion, Home).
              </p>
            </div>
          </div>
          <Link
            href="/admin/produits"
            className="bg-[#1D2129] hover:bg-[#0054A4] text-white font-heading font-black text-xs uppercase py-3 px-5 rounded-xl transition-all whitespace-nowrap flex-shrink-0 self-stretch sm:self-auto text-center"
          >
            Manage Products
          </Link>
        </div>

        {/* Action Panel 2 : Orders */}
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between hover:border-gray-300 transition-all">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0054A4] text-white flex flex-shrink-0 items-center justify-center shadow-xs">
              <Icons.Truck size={28} />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-gray-900 mb-1">
                Orders & Shipments
              </h3>
              <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
                Track incoming purchases, verify cash-on-delivery or BSP bank transfers, and update dispatch milestones.
              </p>
            </div>
          </div>
          <Link
            href="/admin/commandes"
            className="bg-[#F1B20B] hover:bg-[#D99F07] text-[#1D2129] font-heading font-black text-xs uppercase py-3 px-5 rounded-xl transition-all whitespace-nowrap flex-shrink-0 self-stretch sm:self-auto text-center"
          >
            View Orders
          </Link>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white border border-[#E2E5E8] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div>
            <h3 className="font-heading font-bold text-sm text-gray-900">
              Recent Activity
            </h3>
            <p className="text-[11px] text-gray-500">Live order activity stream and inventory alerts.</p>
          </div>
          <Link
            href="/admin/commandes"
            className="font-bold text-xs text-[#0054A4] hover:underline"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500">
            <div className="w-8 h-8 border-3 border-[#F1B20B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p>Loading recent activity...</p>
          </div>
        ) : recentActivities.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            <Icons.ShoppingBag size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="font-bold text-gray-700">No activity recorded</p>
            <p className="text-[11px] text-gray-400">Incoming orders and inventory updates will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-black uppercase text-gray-500 tracking-wider">
                  <th className="py-3 px-5">Type</th>
                  <th className="py-3 px-5">Activity Details</th>
                  <th className="py-3 px-5 hidden sm:table-cell">Date</th>
                  <th className="py-3 px-5 text-right">Status / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentActivities.map((act) => {
                  let typeIcon = <Icons.ShoppingBag size={16} className="text-[#0054A4]" />;
                  let typeBadgeClass = 'bg-blue-50 text-[#0054A4] border-blue-200';
                  let typeLabel = 'Order';

                  if (act.type === 'STOCK') {
                    typeIcon = <Icons.Package size={16} className="text-red-600" />;
                    typeBadgeClass = 'bg-red-50 text-red-700 border-red-200';
                    typeLabel = 'Stock';
                  }

                  let statusBadge = (
                    <span className="text-[10px] font-bold bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full">
                      {act.status}
                    </span>
                  );

                  if (act.type === 'ORDER') {
                    const info = getOrderStatusInfo(act.status);
                    statusBadge = (
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${info.className}`}>
                        {info.label}
                      </span>
                    );
                  } else if (act.type === 'STOCK') {
                    statusBadge = (
                      <span className="text-[10px] font-black bg-red-100 text-red-800 border border-red-200 px-2.5 py-0.5 rounded-full">
                        {act.status === 'OUT_OF_STOCK' ? 'Out of Stock' : 'Low Stock'}
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
                        <Link href={act.link} className="font-bold text-gray-900 hover:text-[#0054A4] block">
                          {act.title}
                        </Link>
                        <span className="text-[11px] text-gray-500 block">{act.subtitle}</span>
                      </td>
                      <td className="py-3.5 px-5 text-gray-400 text-[11px] whitespace-nowrap hidden sm:table-cell">
                        {new Date(act.date).toLocaleDateString('en-GB', {
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