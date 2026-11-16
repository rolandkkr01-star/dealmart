'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getAdminOrdersAction, updateOrderStatusAction } from '@/actions/orders';
import { formatPrice, getOrderStatusInfo } from '@/lib/utils';
import { OrderStatus } from '@/types';
import { Icons } from '@/components/ui/Icons';
import { Pagination } from '@/components/ui/Pagination';

export default function AdminCommandesPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const fetchOrders = async () => {
    setLoading(true);
    const res = await getAdminOrdersAction();
    if (res.success && Array.isArray(res.orders)) {
      setOrders(res.orders);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    const res = await updateOrderStatusAction(orderId, newStatus);
    if (res.success) {
      await fetchOrders();
    }
    setUpdatingId(null);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      if (statusFilter !== 'ALL' && ord.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNum = ord.orderNumber?.toLowerCase().includes(q);
        const matchClient = ord.customerName?.toLowerCase().includes(q);
        const matchPhone = ord.customerPhone?.toLowerCase().includes(q);
        const matchEmail = ord.customerEmail?.toLowerCase().includes(q);
        const matchItems = ord.items?.some((i: any) => i.productName?.toLowerCase().includes(q));
        if (!matchNum && !matchClient && !matchPhone && !matchEmail && !matchItems) return false;
      }
      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <Link href="/admin" className="hover:text-[#0054A4]">Administration</Link>
        <span>/</span>
        <span className="text-gray-900 font-bold">Order Management</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#F1B20B] text-[#1D2129] px-2 py-0.5 rounded">
              Sales & Fulfillment
            </span>
            <span className="text-xs text-gray-500 font-bold">
              {orders.length} order{orders.length > 1 ? 's' : ''} total
            </span>
          </div>
          <h1 className="font-heading font-black text-2xl text-gray-900 tracking-tight">
            Customer Order Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Monitor payment clearances, update fulfillment milestones, and manage dispatch.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Icons.Repeat size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search & Status Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center gap-4 text-xs">
        <div className="relative flex-1 w-full">
          <Icons.Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by order #, customer name, phone or product..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-[#0054A4] focus:outline-none font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-[11px] font-bold text-gray-500 whitespace-nowrap">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 font-bold text-gray-700 focus:outline-none cursor-pointer w-full md:w-auto"
          >
            <option value="ALL">All Statuses ({orders.length})</option>
            <option value="PENDING">PENDING (Awaiting Payment)</option>
            <option value="PAID">PAID (Confirmed)</option>
            <option value="PROCESSING">PROCESSING (In Preparation)</option>
            <option value="SHIPPED">SHIPPED (Out for Delivery)</option>
            <option value="DELIVERED">DELIVERED (Completed)</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-gray-500 bg-white border border-[#E2E5E8] rounded-2xl shadow-xs">
          <div className="w-8 h-8 border-3 border-[#F1B20B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p>Loading customer orders from database...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-16 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-3">
            <Icons.ShoppingBag size={28} />
          </div>
          <h3 className="font-heading font-bold text-base text-gray-900 mb-1">
            No orders recorded in database
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Customer purchases will appear here with delivery contact details and status management options.
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-12 text-center shadow-xs">
          <p className="text-xs text-gray-500 mb-4">No orders match your search criteria.</p>
          <button
            onClick={() => {
              setStatusFilter('ALL');
              setSearchQuery('');
              setCurrentPage(1);
            }}
            className="bg-[#F1B20B] text-[#1D2129] font-heading font-black text-xs uppercase px-5 py-2.5 rounded-xl cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="bg-white border border-[#E2E5E8] rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] border-b border-[#E2E5E8] text-gray-700 uppercase font-black tracking-wider text-[11px]">
                <tr>
                  <th className="p-4">Order Ref</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Destination</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Current Status</th>
                  <th className="p-4">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedOrders.map((ord) => {
                  const statusInfo = getOrderStatusInfo(ord.status);
                  return (
                    <tr key={ord.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-4 font-heading font-bold text-gray-900 font-price">
                        <Link href={`/commande/${ord.orderNumber}`} className="text-[#0054A4] hover:underline font-black">
                          #{ord.orderNumber}
                        </Link>
                        <span className="block text-[10px] text-gray-400 font-normal">
                          {new Date(ord.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{ord.customerName}</div>
                        <div className="text-[11px] text-gray-600">{ord.customerPhone}</div>
                        {ord.customerEmail && <div className="text-[10px] text-gray-400">{ord.customerEmail}</div>}
                      </td>
                      <td className="p-4 text-gray-700">
                        <div className="font-semibold">{ord.city} {ord.district ? `(${ord.district})` : ''}</div>
                        {ord.streetDetails && <div className="text-[10px] text-gray-400">{ord.streetDetails}</div>}
                      </td>
                      <td className="p-4 text-gray-700">
                        <span className="font-bold text-gray-900">{ord.items.length} item(s)</span>
                        <div className="text-[11px] text-gray-500 truncate max-w-[180px]" title={ord.items.map((i: any) => i.productName).join(', ')}>
                          {ord.items.map((i: any) => i.productName).join(', ')}
                        </div>
                      </td>
                      <td className="p-4 font-black text-[#0054A4] font-price text-sm">
                        {formatPrice(ord.totalAmount)}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-[11px] bg-gray-100 px-2.5 py-1 rounded-lg text-gray-700 border border-gray-200">
                          {ord.paymentProvider?.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={ord.status}
                          disabled={updatingId === ord.id}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                          className="border border-gray-300 rounded-xl p-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#0054A4] bg-white cursor-pointer disabled:opacity-50 shadow-2xs"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PAID">PAID</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                          <option value="REFUNDED">REFUNDED</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="border-t border-gray-200 px-4 py-2 bg-gray-50/50">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => {
                setCurrentPage(p);
                window.scrollTo({ top: 120, behavior: 'smooth' });
              }}
              totalItems={filteredOrders.length}
              itemsPerPage={pageSize}
              onItemsPerPageChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
              pageSizeOptions={[10, 25, 50]}
              itemLabel="orders"
            />
          </div>
        </div>
      )}
    </div>
  );
}