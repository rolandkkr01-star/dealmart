'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getUserOrdersAction, cancelPendingOrderAction } from '@/actions/orders';
import { formatPrice, getOrderStatusInfo } from '@/lib/utils';
import { Icons } from '@/components/ui/Icons';
import { DialogModal } from '@/components/ui/DialogModal';
import { Pagination } from '@/components/ui/Pagination';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  // Confirmation / alert modal
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info' | 'success';
    confirmText?: string;
    cancelText?: string;
    isConfirmOnly?: boolean;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
  });

  const loadOrders = async () => {
    setLoading(true);
    const res = await getUserOrdersAction();
    if (res.success && Array.isArray(res.orders)) {
      setOrders(res.orders);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = React.useMemo(() => {
    return orders.filter((ord) => {
      if (statusFilter !== 'ALL' && ord.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNum = ord.orderNumber?.toLowerCase().includes(q);
        const matchItems = ord.items?.some((item: any) =>
          item.productName?.toLowerCase().includes(q)
        );
        if (!matchNum && !matchItems) return false;
      }
      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const handleCancelOrder = (orderNumber: string) => {
    setDialogState({
      isOpen: true,
      title: 'Cancel this order?',
      message: `Are you sure you want to cancel order #${orderNumber}? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Yes, cancel order',
      cancelText: 'No, keep order',
      onConfirm: async () => {
        setCancellingId(orderNumber);
        setDialogState((prev) => ({ ...prev, isOpen: false }));
        const res = await cancelPendingOrderAction(orderNumber);
        if (res.success) {
          await loadOrders();
        } else {
          setDialogState({
            isOpen: true,
            title: 'Cancellation failed',
            message: res.error || 'Unable to cancel this order.',
            type: 'warning',
            isConfirmOnly: true,
            confirmText: 'Got it',
          });
        }
        setCancellingId(null);
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DialogModal
        {...dialogState}
        onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
      />
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <Link href="/" className="hover:text-[#0054A4]">Home</Link>
        <span>/</span>
        <Link href="/compte" className="hover:text-[#0054A4]">My Account</Link>
        <span>/</span>
        <span className="text-gray-900 font-bold">My Orders</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-gray-900 tracking-tight">
            My Orders ({orders.length})
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Review your purchase history, complete pending payments, and track live deliveries.
          </p>
        </div>

        <Link
          href="/boutique"
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs px-4 py-2.5 rounded-xl transition-all self-start sm:self-auto inline-flex items-center gap-2"
        >
          <Icons.ShoppingCart size={14} />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {/* Search Bar & Status Filters */}
      {orders.length > 0 && (
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-4 mb-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search by order # or product name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-[#F8F9FA] border border-[#E2E5E8] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0054A4]"
            />
            <Icons.Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {[
              { label: 'All Orders', value: 'ALL' },
              { label: 'Pending Payment', value: 'PENDING' },
              { label: 'Paid', value: 'PAID' },
              { label: 'Processing', value: 'PROCESSING' },
              { label: 'Shipped', value: 'SHIPPED' },
              { label: 'Delivered', value: 'DELIVERED' },
              { label: 'Cancelled', value: 'CANCELLED' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setStatusFilter(tab.value);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === tab.value
                    ? 'bg-[#1D2129] text-[#F1B20B] shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center text-xs text-gray-500">
          <div className="w-8 h-8 border-3 border-[#F1B20B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p>Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-[#E2E5E8] rounded-3xl p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#0054A4] flex items-center justify-center mx-auto mb-4">
            <Icons.ShoppingBag size={32} />
          </div>
          <h3 className="font-heading font-black text-lg text-gray-900 mb-2">
            No orders placed yet
          </h3>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            Your purchases of iPhones, Samsung phones, and certified accessories will appear here once you place your first order.
          </p>
          <Link
            href="/boutique"
            className="bg-[#F1B20B] hover:bg-[#D99F07] text-[#1D2129] font-heading font-black text-xs uppercase px-8 py-3.5 rounded-xl inline-block shadow-xs transition-all"
          >
            Explore the Store
          </Link>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-12 text-center">
          <p className="text-xs text-gray-500 mb-4">No orders match your search criteria.</p>
          <button
            onClick={() => {
              setStatusFilter('ALL');
              setSearchQuery('');
              setCurrentPage(1);
            }}
            className="bg-[#F1B20B] text-[#1D2129] font-heading font-black text-xs uppercase px-6 py-2.5 rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedOrders.map((ord) => {
              const isPending = ord.status === 'PENDING';
              const statusInfo = getOrderStatusInfo(ord.status);

              return (
                <div
                  key={ord.id}
                  className={`bg-white border rounded-3xl p-6 shadow-xs transition-all ${
                    isPending ? 'border-amber-300 bg-amber-50/20' : 'border-[#E2E5E8]'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    {/* Order Details */}
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-heading font-black text-lg text-gray-900">
                          #{ord.orderNumber}
                        </span>
                        <span className={`text-[11px] font-bold px-3 py-0.5 rounded-full border ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">
                          {new Date(ord.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {isPending && (
                        <div className="bg-amber-100/70 border border-amber-200 text-amber-900 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2">
                          <Icons.AlertCircle size={15} className="text-amber-700 flex-shrink-0" />
                          <span>
                            <strong>Pending Payment</strong>: You can complete payment now to start order dispatch.
                          </span>
                        </div>
                      )}

                      {/* Items list */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {ord.items.map((item: any, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs bg-gray-100/80 border border-gray-200 px-3 py-1.5 rounded-xl text-gray-800 font-medium"
                          >
                            {item.productName} {item.variantInfo ? `(${item.variantInfo})` : ''} <strong className="text-gray-900">×{item.quantity}</strong>
                          </span>
                        ))}
                      </div>

                      <div className="text-[11px] text-gray-500 flex items-center gap-4">
                        <span>Destination: <strong>{ord.city} ({ord.district})</strong></span>
                        <span>•</span>
                        <span>Payment Method: <strong>{ord.paymentProvider?.toUpperCase()}</strong></span>
                      </div>
                    </div>

                    {/* Actions & Amount */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between w-full lg:w-auto gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-100">
                      <div className="text-left lg:text-right">
                        <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">Total Amount</span>
                        <span className="font-heading font-black text-xl text-[#0054A4]">
                          {formatPrice(ord.totalAmount)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 w-full sm:w-auto">
                        {isPending ? (
                          <>
                            <Link
                              href={`/commande/${ord.orderNumber}`}
                              className="flex-1 sm:flex-initial bg-[#F1B20B] hover:bg-[#D99F07] text-[#1D2129] font-heading font-black text-xs uppercase px-5 py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Icons.CreditCard size={15} />
                              <span>Pay Now</span>
                            </Link>
                            <button
                              type="button"
                              disabled={cancellingId === ord.orderNumber}
                              onClick={() => handleCancelOrder(ord.orderNumber)}
                              className="bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-3.5 py-3 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                              title="Cancel this order"
                            >
                              {cancellingId === ord.orderNumber ? (
                                <div className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Icons.X size={15} />
                              )}
                            </button>
                          </>
                        ) : (
                          <Link
                            href={`/commande/${ord.orderNumber}`}
                            className="flex-1 sm:flex-initial bg-white border border-gray-300 hover:border-[#0054A4] hover:text-[#0054A4] text-gray-800 font-bold text-xs uppercase px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                          >
                            <Icons.Truck size={14} />
                            <span>Track Package</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="mt-8 bg-white border border-[#E2E5E8] rounded-2xl p-2 shadow-xs">
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
              pageSizeOptions={[5, 10, 20]}
              itemLabel="orders"
            />
          </div>
        </>
      )}
    </div>
  );
}