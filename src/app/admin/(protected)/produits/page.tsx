'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatPrice, getConditionBadgeInfo } from '@/lib/utils';
import { Icons } from '@/components/ui/Icons';
import { getAdminProductsAction, deleteProductAction, toggleProductStatusAction } from '@/actions/admin-products';
import { DialogModal } from '@/components/ui/DialogModal';
import { Pagination } from '@/components/ui/Pagination';
import { useRouter } from 'next/navigation';

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('ALL');
  const [conditionFilter, setConditionFilter] = useState('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modal Dialog
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

  const fetchProducts = async () => {
    setLoading(true);
    const res = await getAdminProductsAction();
    if (res.success && res.products) {
      setProducts(res.products);
    } else {
      if (res.error === 'UNAUTHORIZED' || res.error === 'FORBIDDEN_ADMIN_ONLY' || res.error?.includes('autorisé')) {
        router.push('/admin/login?redirect=/admin/produits');
        return;
      }
      setActionError(res.error || 'Failed to load products.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = (id: string, name: string) => {
    setDialogState({
      isOpen: true,
      title: 'Delete this product?',
      message: `Are you sure you want to permanently delete "${name}" from the catalog? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        setDialogState((prev) => ({ ...prev, isOpen: false }));
        setDeletingId(id);
        setActionError(null);
        setActionSuccess(null);

        const res = await deleteProductAction(id);
        setDeletingId(null);

        if (res.success) {
          setActionSuccess(`Product "${name}" was deleted successfully.`);
          setProducts((prev) => prev.filter((p) => p.id !== id));
          setTimeout(() => setActionSuccess(null), 3500);
        } else {
          setDialogState({
            isOpen: true,
            title: 'Delete failed',
            message: res.error || 'Unable to delete product.',
            type: 'warning',
            isConfirmOnly: true,
            confirmText: 'Got it',
          });
        }
      },
    });
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    const res = await toggleProductStatusAction(id, nextStatus);

    if (res.success) {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: nextStatus } : p))
      );
    } else {
      setDialogState({
        isOpen: true,
        title: 'Error',
        message: res.error || 'Unable to change product status.',
        type: 'warning',
        isConfirmOnly: true,
        confirmText: 'Close',
      });
    }
  };

  const filteredProducts = React.useMemo(() => {
    return products.filter((prod) => {
      const matchesSearch =
        !searchQuery.trim() ||
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.category?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.variants?.some((v: any) => v.sku?.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesBrand = brandFilter === 'ALL' || prod.brand === brandFilter;
      const matchesCondition = conditionFilter === 'ALL' || prod.condition === conditionFilter;

      return matchesSearch && matchesBrand && matchesCondition;
    });
  }, [products, searchQuery, brandFilter, conditionFilter]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <DialogModal
        {...dialogState}
        onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#F1B20B] text-[#1D2129] px-2 py-0.5 rounded">
              Inventory & Catalog
            </span>
            <span className="text-xs text-gray-500 font-bold">
              {products.length} product{products.length > 1 ? 's' : ''} in database
            </span>
          </div>
          <h1 className="font-heading font-black text-2xl text-gray-900">
            Product Catalog
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage electronics, beauty, fashion, and home products with variant tracking and image galleries.
          </p>
        </div>

        <Link
          href="/admin/produits/nouveau"
          className="bg-[#F1B20B] hover:bg-[#D99F07] text-[#1D2129] font-heading font-black text-xs uppercase tracking-wider px-5 py-3.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
        >
          <Icons.Plus size={18} />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icons.CheckCircle size={18} className="text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">
            <Icons.X size={16} />
          </button>
        </div>
      )}

      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icons.AlertCircle size={18} className="text-red-600" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-red-600 hover:text-red-900 cursor-pointer">
            <Icons.X size={16} />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center gap-4 text-xs">
        <div className="relative flex-1 w-full">
          <Icons.Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by product name, category, or SKU..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-[#0054A4] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={brandFilter}
            onChange={(e) => {
              setBrandFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 font-medium text-gray-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Brands</option>
            <option value="Apple">Apple</option>
            <option value="Samsung">Samsung</option>
            <option value="DealMart">DealMart</option>
          </select>

          <select
            value={conditionFilter}
            onChange={(e) => {
              setConditionFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 font-medium text-gray-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Conditions</option>
            <option value="NEUF_SCELLE">Brand New Sealed</option>
            <option value="NEUF_NON_SCELLE">Certified Refurbished (Grade A+)</option>
            <option value="OCCASION">Certified Pre-Owned</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-500 text-xs">
            <div className="w-8 h-8 border-3 border-[#F1B20B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p>Loading products from database...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Icons.Smartphone size={32} />
            </div>
            <h3 className="font-heading font-bold text-base text-gray-900 mb-1">
              No products found
            </h3>
            <p className="text-xs text-gray-500 mb-6 max-w-sm mx-auto">
              {products.length === 0
                ? 'The product catalog is currently empty. Click "Add New Product" to create your first item.'
                : 'No products matched your search or filter criteria.'}
            </p>
            {products.length === 0 && (
              <Link
                href="/admin/produits/nouveau"
                className="bg-[#F1B20B] hover:bg-[#D99F07] text-[#1D2129] font-bold text-xs uppercase px-5 py-3 rounded-xl inline-flex items-center gap-2"
              >
                <Icons.Plus size={16} />
                <span>Create First Product</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-[11px] font-black uppercase text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Condition & Brand</th>
                  <th className="py-3.5 px-4">Retail Price</th>
                  <th className="py-3.5 px-4">Variants & Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedProducts.map((prod) => {
                  const cond = getConditionBadgeInfo(prod.condition);
                  const totalStock = prod.variants?.reduce((acc: number, v: any) => acc + v.stock, 0) ?? 0;
                  const mainImage = prod.images[0]?.url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=200&q=80';

                  return (
                    <tr key={prod.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Image & Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                            <img src={mainImage} alt={prod.name} className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <Link href={`/produit/${prod.slug}`} target="_blank" className="font-bold text-gray-900 hover:text-[#0054A4] line-clamp-1">
                              {prod.name}
                            </Link>
                            <span className="text-[11px] text-gray-400 block">
                              {prod.category?.name || 'Uncategorized'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Condition & Brand */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded ${cond.badgeClass}`}>
                            {cond.label}
                          </span>
                          <span className="text-[10px] bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded block w-max">
                            {prod.brand}
                          </span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-medium">
                        <span className="font-heading font-black text-gray-900">
                          {formatPrice(prod.basePrice)}
                        </span>
                        {prod.promoPrice && (
                          <span className="text-[11px] text-red-600 line-through block">
                            {formatPrice(prod.promoPrice)}
                          </span>
                        )}
                      </td>

                      {/* Variants & Stock */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                            totalStock > 5
                              ? 'bg-emerald-100 text-emerald-800'
                              : totalStock > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {totalStock > 0 ? `${totalStock} in stock` : 'Out of stock'}
                          </span>
                          <span className="text-[11px] text-gray-400 block">
                            {prod.variants.length} variant{prod.variants.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(prod.id, prod.isActive)}
                          className={`text-[10px] font-black px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                            prod.isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          {prod.isActive ? '● Published' : '○ Hidden'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/produits/${prod.id}/modifier`}
                            className="p-2 bg-gray-100 hover:bg-[#0054A4] hover:text-white rounded-lg transition-colors text-gray-700"
                            title="Edit product"
                          >
                            <Icons.Edit size={16} />
                          </Link>

                          <button
                            onClick={() => handleDelete(prod.id, prod.name)}
                            disabled={deletingId === prod.id}
                            className="p-2 bg-gray-100 hover:bg-red-600 hover:text-white rounded-lg transition-colors text-gray-700 cursor-pointer disabled:opacity-50"
                            title="Delete product"
                          >
                            <Icons.Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="border-t border-gray-200 px-4 py-2 bg-gray-50/50">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => {
                  setCurrentPage(p);
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
                totalItems={filteredProducts.length}
                itemsPerPage={pageSize}
                onItemsPerPageChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
                pageSizeOptions={[10, 25, 50]}
                itemLabel="products"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}