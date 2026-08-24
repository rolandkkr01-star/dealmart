'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatFCFA, getConditionBadgeInfo } from '@/lib/utils';
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
      setActionError(res.error || 'Erreur lors du chargement des produits.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = (id: string, name: string) => {
    setDialogState({
      isOpen: true,
      title: 'Supprimer ce produit ?',
      message: `Êtes-vous certain de vouloir supprimer définitivement "${name}" du catalogue ? Cette action est irréversible.`,
      type: 'danger',
      confirmText: 'Supprimer',
      cancelText: 'Conserver',
      onConfirm: async () => {
        setDialogState((prev) => ({ ...prev, isOpen: false }));
        setDeletingId(id);
        setActionError(null);
        setActionSuccess(null);

        const res = await deleteProductAction(id);
        setDeletingId(null);

        if (res.success) {
          setActionSuccess(`Le produit "${name}" a été supprimé avec succès.`);
          setProducts((prev) => prev.filter((p) => p.id !== id));
          setTimeout(() => setActionSuccess(null), 3500);
        } else {
          setDialogState({
            isOpen: true,
            title: 'Échec de suppression',
            message: res.error || 'Impossible de supprimer ce produit.',
            type: 'warning',
            isConfirmOnly: true,
            confirmText: 'Compris',
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
        title: 'Erreur',
        message: res.error || 'Impossible de modifier le statut du produit.',
        type: 'warning',
        isConfirmOnly: true,
        confirmText: 'Fermer',
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

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#FED700] text-[#1D2129] px-2 py-0.5 rounded">
              Gestion de Stock & Catalogue
            </span>
            <span className="text-xs text-gray-500 font-bold">
              {products.length} produit{products.length > 1 ? 's' : ''} en base
            </span>
          </div>
          <h1 className="font-heading font-black text-2xl text-gray-900">
            Catalogue des Smartphones & Accessoires
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Ajoutez, modifiez ou retirez des appareils avec suivi des variantes, garanties et éligibilité au troc.
          </p>
        </div>

        <Link
          href="/admin/produits/nouveau"
          className="bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-heading font-black text-xs uppercase tracking-wider px-5 py-3.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
        >
          <Icons.Plus size={18} />
          <span>Ajouter un Produit</span>
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

      {/* Barre de Recherche & Filtres */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center gap-4 text-xs">
        <div className="relative flex-1 w-full">
          <Icons.Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Rechercher par nom de modèle, catégorie ou SKU..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-[#0062BD] focus:outline-none"
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
            <option value="ALL">Toutes les marques</option>
            <option value="IPHONE">Apple iPhone</option>
            <option value="SAMSUNG">Samsung Galaxy</option>
            <option value="ACCESSOIRE">Accessoires</option>
          </select>

          <select
            value={conditionFilter}
            onChange={(e) => {
              setConditionFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 font-medium text-gray-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Tous les états</option>
            <option value="NEUF_SCELLE">Neuf scellé</option>
            <option value="NEUF_NON_SCELLE">Reconditionné A+</option>
            <option value="OCCASION">Occasion</option>
          </select>
        </div>
      </div>

      {/* Table des Produits */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-500 text-xs">
            <div className="w-8 h-8 border-3 border-[#FED700] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p>Chargement des produits depuis la base de données...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Icons.Smartphone size={32} />
            </div>
            <h3 className="font-heading font-bold text-base text-gray-900 mb-1">
              Aucun produit trouvé
            </h3>
            <p className="text-xs text-gray-500 mb-6 max-w-sm mx-auto">
              {products.length === 0
                ? 'La base de données est actuellement vide. Cliquez sur "Ajouter un Produit" pour créer votre premier smartphone ou accessoire.'
                : 'Aucun produit ne correspond à vos critères de recherche.'}
            </p>
            {products.length === 0 && (
              <Link
                href="/admin/produits/nouveau"
                className="bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-bold text-xs uppercase px-5 py-3 rounded-xl inline-flex items-center gap-2"
              >
                <Icons.Plus size={16} />
                <span>Créer le premier produit</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-[11px] font-black uppercase text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4">Produit</th>
                  <th className="py-3.5 px-4">État & Marque</th>
                  <th className="py-3.5 px-4">Prix de Vente</th>
                  <th className="py-3.5 px-4">Variantes & Stock</th>
                  <th className="py-3.5 px-4">Troc</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedProducts.map((prod) => {
                  const cond = getConditionBadgeInfo(prod.condition);
                  const totalStock = prod.variants.reduce((acc: number, v: any) => acc + v.stock, 0);
                  const mainImage = prod.images[0]?.url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=200&q=80';

                  return (
                    <tr key={prod.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Image & Nom */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                            <img src={mainImage} alt={prod.name} className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <Link href={`/produit/${prod.slug}`} target="_blank" className="font-bold text-gray-900 hover:text-[#0062BD] line-clamp-1">
                              {prod.name}
                            </Link>
                            <span className="text-[11px] text-gray-400 block">
                              {prod.category?.name || 'Sans catégorie'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* État & Marque */}
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

                      {/* Prix */}
                      <td className="py-3.5 px-4 font-medium">
                        <span className="font-heading font-black text-gray-900">
                          {formatFCFA(prod.basePrice)}
                        </span>
                        {prod.promoPrice && (
                          <span className="text-[11px] text-red-600 line-through block">
                            {formatFCFA(prod.promoPrice)}
                          </span>
                        )}
                      </td>

                      {/* Variantes & Stock */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                            totalStock > 5
                              ? 'bg-emerald-100 text-emerald-800'
                              : totalStock > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {totalStock > 0 ? `${totalStock} en stock` : 'Rupture de stock'}
                          </span>
                          <span className="text-[11px] text-gray-400 block">
                            {prod.variants.length} variante{prod.variants.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      </td>

                      {/* Troc */}
                      <td className="py-3.5 px-4">
                        {prod.tradeEligible ? (
                          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1 w-max">
                            <Icons.Check size={12} />
                            <span>Éligible</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-medium">Non éligible</span>
                        )}
                      </td>

                      {/* Statut Toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(prod.id, prod.isActive)}
                          className={`text-[10px] font-black px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                            prod.isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          {prod.isActive ? '● En Ligne' : '○ Masqué'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/produits/${prod.id}/modifier`}
                            className="p-2 bg-gray-100 hover:bg-[#0062BD] hover:text-white rounded-lg transition-colors text-gray-700"
                            title="Modifier le produit"
                          >
                            <Icons.Edit size={16} />
                          </Link>

                          <button
                            onClick={() => handleDelete(prod.id, prod.name)}
                            disabled={deletingId === prod.id}
                            className="p-2 bg-gray-100 hover:bg-red-600 hover:text-white rounded-lg transition-colors text-gray-700 cursor-pointer disabled:opacity-50"
                            title="Supprimer le produit"
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

            {/* Pagination Admin Produits */}
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
                itemLabel="produits"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
