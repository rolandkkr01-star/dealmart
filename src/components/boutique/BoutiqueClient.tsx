'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product, Brand, ProductCondition } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { TradeModal } from '@/components/product/TradeModal';
import { Icons } from '@/components/ui/Icons';
import Link from 'next/link';

interface BoutiqueClientProps {
  initialProducts: Product[];
}

function BoutiqueContent({ initialProducts }: BoutiqueClientProps) {
  const searchParams = useSearchParams();
  const initialBrand = searchParams.get('brand') || 'ALL';
  const initialCondition = searchParams.get('condition') || 'ALL';
  const initialSearch = searchParams.get('search') || '';
  const initialTrade = searchParams.get('trade') === 'true';

  const [products] = useState<Product[]>(initialProducts);
  const [selectedBrand, setSelectedBrand] = useState<string>(initialBrand);
  const [selectedCondition, setSelectedCondition] = useState<string>(initialCondition);
  const [tradeOnly, setTradeOnly] = useState<boolean>(initialTrade);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [selectedTradeProduct, setSelectedTradeProduct] = useState<Product | null>(null);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

  // Synchronisation dynamique quand l'utilisateur soumet une recherche depuis le Header
  React.useEffect(() => {
    const brand = searchParams.get('brand') || 'ALL';
    const condition = searchParams.get('condition') || 'ALL';
    const search = searchParams.get('search') || '';
    const trade = searchParams.get('trade') === 'true';
    
    setSelectedBrand(brand);
    setSelectedCondition(condition);
    setSearchQuery(search);
    setTradeOnly(trade);
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Filtre marque
      if (selectedBrand !== 'ALL' && prod.brand !== selectedBrand) return false;
      // Filtre état
      if (selectedCondition !== 'ALL' && prod.condition !== selectedCondition) return false;
      // Filtre troc
      if (tradeOnly && !prod.tradeEligible) return false;
      // Filtre recherche
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = prod.name.toLowerCase().includes(q);
        const matchDesc = prod.description.toLowerCase().includes(q);
        const matchBrand = prod.brand.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchBrand) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.basePrice - b.basePrice;
      if (sortBy === 'price-desc') return b.basePrice - a.basePrice;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [products, selectedBrand, selectedCondition, tradeOnly, searchQuery, sortBy]);

  const handleOpenTrade = (product: Product) => {
    setSelectedTradeProduct(product);
    setIsTradeModalOpen(true);
  };

  const resetFilters = () => {
    setSelectedBrand('ALL');
    setSelectedCondition('ALL');
    setTradeOnly(false);
    setSearchQuery('');
    setSortBy('featured');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Fil d'Ariane & Titre */}
      <div className="mb-6">
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <Link href="/" className="hover:text-[#0062BD]">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-bold">Boutique</span>
        </nav>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-[#1D2129] tracking-tight">
          Catalogue Smartphones & Accessoires Certifiés
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Appareils garantis authentiques avec vérification du numéro de série à la livraison à Cotonou.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filtres (Desktop) */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
          <div className="bg-white border border-[#E2E5E8] rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h2 className="font-heading font-black text-sm text-gray-900 flex items-center gap-2">
                <Icons.Sliders size={16} className="text-[#0062BD]" />
                <span>Filtres</span>
              </h2>
              {(selectedBrand !== 'ALL' || selectedCondition !== 'ALL' || tradeOnly || searchQuery) && (
                <button
                  onClick={resetFilters}
                  className="text-[11px] font-bold text-[#DC3545] hover:underline cursor-pointer"
                >
                  Réinitialiser
                </button>
              )}
            </div>

            {/* Filtre Marque */}
            <div className="mb-5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Marque Constructeur
              </label>
              <div className="space-y-1.5">
                {[
                  { label: 'Toutes les marques', value: 'ALL' },
                  { label: 'Apple iPhone', value: 'IPHONE' },
                  { label: 'Samsung Galaxy', value: 'SAMSUNG' },
                  { label: 'Accessoires & Chargeurs', value: 'ACCESSOIRE' },
                ].map((b) => (
                  <button
                    key={b.value}
                    onClick={() => setSelectedBrand(b.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                      selectedBrand === b.value
                        ? 'bg-[#FED700] text-[#1D2129] font-black shadow-xs'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{b.label}</span>
                    {selectedBrand === b.value && <Icons.Check size={14} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtre État de l'appareil (Exigence Spécifique) */}
            <div className="mb-5 border-t border-gray-100 pt-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                État de l'Appareil
              </label>
              <div className="space-y-1.5">
                {[
                  { label: 'Tous les états', value: 'ALL' },
                  { label: 'Neuf Scellé (Boîte d\'origine)', value: 'NEUF_SCELLE' },
                  { label: 'Reconditionné A+ (Impeccable)', value: 'NEUF_NON_SCELLE' },
                  { label: 'Occasion Certifiée TechPhone', value: 'OCCASION' },
                ].map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setSelectedCondition(c.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                      selectedCondition === c.value
                        ? 'bg-[#0062BD] text-white font-bold shadow-xs'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="truncate">{c.label}</span>
                    {selectedCondition === c.value && <Icons.Check size={14} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtre Troc Uniquement */}
            <div className="border-t border-gray-100 pt-4">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={tradeOnly}
                  onChange={(e) => setTradeOnly(e.target.checked)}
                  className="w-4 h-4 text-[#FED700] rounded focus:ring-[#FED700] border-gray-300"
                />
                <div className="text-xs">
                  <span className="font-bold text-gray-900 block">Troc Possible</span>
                  <span className="text-[10px] text-gray-500">Échangez votre ancien smartphone</span>
                </div>
              </label>
            </div>
          </div>
        </aside>

        {/* Liste des produits & Barre de tri */}
        <div className="flex-1">
          {/* Entête catalogue */}
          <div className="bg-white border border-[#E2E5E8] rounded-xl p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-600">
              Affichage de <strong className="text-gray-900">{filteredProducts.length}</strong> produit(s)
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <label className="text-xs text-gray-600 whitespace-nowrap font-medium">Trier par :</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#F8F9FA] border border-[#E2E5E8] rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none"
              >
                <option value="featured">Populaires & Recommandés</option>
                <option value="price-asc">Prix : Moins cher au plus cher</option>
                <option value="price-desc">Prix : Plus cher au moins cher</option>
                <option value="rating">Mieux notés</option>
              </select>
            </div>
          </div>

          {/* Grille de résultats */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-[#E2E5E8] rounded-xl p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400 mb-4">
                <Icons.Smartphone size={32} />
              </div>
              <h3 className="font-heading font-bold text-base text-gray-900 mb-2">
                {products.length === 0
                  ? 'Aucun produit disponible pour le moment'
                  : 'Aucun produit ne correspond à ces critères'}
              </h3>
              <p className="text-xs text-gray-500 mb-6">
                {products.length === 0
                  ? 'Nos nouveaux stocks de smartphones neufs et accessoires sont en cours d\'enregistrement.'
                  : 'Essayez de réinitialiser vos filtres ou de chercher un autre modèle.'}
              </p>
              <button
                onClick={resetFilters}
                className="bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-heading font-black text-xs uppercase px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenTrade={handleOpenTrade}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Troc */}
      <TradeModal
        product={selectedTradeProduct}
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
      />
    </div>
  );
}

export function BoutiqueClient({ initialProducts }: BoutiqueClientProps) {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-gray-500">Chargement de la boutique...</div>}>
      <BoutiqueContent initialProducts={initialProducts} />
    </Suspense>
  );
}
