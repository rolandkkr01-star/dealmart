'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';
import { getProductsAction } from '@/actions/products';
import { ProductCard } from '@/components/product/ProductCard';
import { TradeModal } from '@/components/product/TradeModal';
import { Icons } from '@/components/ui/Icons';
import { Pagination } from '@/components/ui/Pagination';

export default function PublicFavorisPage() {
  const { wishlist } = useCart();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTradeProduct, setSelectedTradeProduct] = useState<Product | null>(null);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

  // Filtres & Pagination
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(8);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      const res = await getProductsAction();
      if (res && Array.isArray(res)) {
        const mapped = res.map((p: any) => ({
          ...p,
          shortDescription: p.description.slice(0, 120),
          categoryName: p.category?.name || '',
          rating: 4.8,
          reviewsCount: 12,
          specs: p.specsJson ? JSON.parse(p.specsJson) : undefined,
          createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
        }));
        setAllProducts(mapped as Product[]);
      }
      setLoading(false);
    }
    loadProducts();
  }, []);

  const favoriteProducts = React.useMemo(() => {
    return allProducts
      .filter((p) => wishlist.includes(p.id))
      .filter((p) => {
        if (selectedBrand !== 'ALL' && p.brand !== selectedBrand) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          if (!matchName && !matchDesc) return false;
        }
        return true;
      });
  }, [allProducts, wishlist, selectedBrand, searchQuery]);

  const totalPages = Math.ceil(favoriteProducts.length / pageSize);
  const paginatedFavorites = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return favoriteProducts.slice(start, start + pageSize);
  }, [favoriteProducts, currentPage, pageSize]);

  const handleOpenTrade = (product: Product) => {
    setSelectedTradeProduct(product);
    setIsTradeModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <Link href="/" className="hover:text-[#0062BD]">Accueil</Link>
        <span>/</span>
        <span className="text-gray-900 font-bold">Mes Favoris</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-4 mb-6 gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-[#1D2129] tracking-tight flex items-center gap-3">
            <Icons.Heart size={28} className="text-[#DC3545] fill-[#DC3545]" />
            <span>Ma Liste de Favoris</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Vos smartphones et accessoires enregistrés (conservés automatiquement sur votre appareil).
          </p>
        </div>
        <span className="text-xs font-bold bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full self-start sm:self-auto">
          {wishlist.length} article(s) enregistré(s)
        </span>
      </div>

      {/* Barre de Filtres et Recherche */}
      {wishlist.length > 0 && (
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-4 mb-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Rechercher dans mes favoris..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-[#F8F9FA] border border-[#E2E5E8] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0062BD]"
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

          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {[
              { label: 'Tous', value: 'ALL' },
              { label: 'Apple iPhone', value: 'IPHONE' },
              { label: 'Samsung Galaxy', value: 'SAMSUNG' },
              { label: 'Accessoires', value: 'ACCESSOIRE' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setSelectedBrand(tab.value);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedBrand === tab.value
                    ? 'bg-[#1D2129] text-[#FED700] shadow-xs'
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
          <div className="w-8 h-8 border-3 border-[#FED700] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p>Chargement de vos favoris...</p>
        </div>
      ) : wishlist.length === 0 ? (
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-full bg-red-50 text-[#DC3545] flex items-center justify-center mx-auto mb-4">
            <Icons.Heart size={32} />
          </div>
          <h3 className="font-heading font-bold text-base text-gray-900 mb-2">
            Votre liste de favoris est vide
          </h3>
          <p className="text-xs text-gray-500 mb-6">
            Parcourez notre catalogue et cliquez sur l'icône cœur pour sauvegarder les articles qui vous intéressent.
          </p>
          <Link
            href="/boutique"
            className="bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-heading font-black text-xs uppercase px-6 py-3 rounded-xl inline-block shadow-sm transition-transform hover:scale-105"
          >
            Découvrir les smartphones & accessoires
          </Link>
        </div>
      ) : favoriteProducts.length === 0 ? (
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-12 text-center">
          <p className="text-xs text-gray-500 mb-4">Aucun article favori ne correspond à ces critères.</p>
          <button
            onClick={() => {
              setSelectedBrand('ALL');
              setSearchQuery('');
              setCurrentPage(1);
            }}
            className="bg-[#FED700] text-[#1D2129] font-heading font-black text-xs uppercase px-6 py-2.5 rounded-xl"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {paginatedFavorites.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenTrade={handleOpenTrade}
              />
            ))}
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
              totalItems={favoriteProducts.length}
              itemsPerPage={pageSize}
              onItemsPerPageChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
              pageSizeOptions={[4, 8, 16, 24]}
              itemLabel="favoris"
            />
          </div>
        </>
      )}

      {/* Modal Troc */}
      <TradeModal
        product={selectedTradeProduct}
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
      />
    </div>
  );
}
