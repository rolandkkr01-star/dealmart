'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';
import { getProductsAction } from '@/actions/products';
import { ProductCard } from '@/components/product/ProductCard';
import { TradeModal } from '@/components/product/TradeModal';
import { Icons } from '@/components/ui/Icons';

export default function PublicFavorisPage() {
  const { wishlist } = useCart();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTradeProduct, setSelectedTradeProduct] = useState<Product | null>(null);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

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

  const favoriteProducts = allProducts.filter((p) => wishlist.includes(p.id));

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

      <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-8">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-[#1D2129] tracking-tight flex items-center gap-3">
            <Icons.Heart size={28} className="text-[#DC3545] fill-[#DC3545]" />
            <span>Ma Liste de Favoris</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Vos smartphones et accessoires enregistrés (conservés automatiquement sur votre appareil).
          </p>
        </div>
        <span className="text-xs font-bold bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full">
          {wishlist.length} article(s)
        </span>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-gray-500">
          <div className="w-8 h-8 border-3 border-[#FED700] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p>Chargement de vos favoris...</p>
        </div>
      ) : favoriteProducts.length === 0 ? (
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {favoriteProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenTrade={handleOpenTrade}
            />
          ))}
        </div>
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
