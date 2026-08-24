'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product, Brand, ProductCondition } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { TradeModal } from '@/components/product/TradeModal';
import { Icons } from '@/components/ui/Icons';
import { Pagination } from '@/components/ui/Pagination';
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

  // États de Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);

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
    setCurrentPage(1);
  }, [searchParams]);

  // Réinitialisation de la page quand un filtre change
  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand);
    setCurrentPage(1);
  };

  const handleConditionChange = (cond: string) => {
    setSelectedCondition(cond);
    setCurrentPage(1);
  };

  const handleTradeChange = (trade: boolean) => {
    setTradeOnly(trade);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: 'featured' | 'price-asc' | 'price-desc' | 'rating') => {
    setSortBy(sort);
    setCurrentPage(1);
  };

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

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

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
    setCurrentPage(1);
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
                  Effacer
                </button>
              )}
            </div>

            {/* Recherche textuelle directe */}
            <div className="mb-5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Recherche par nom
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ex: iPhone 15, S24, Chargeur..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-[#F8F9FA] border border-[#E2E5E8] rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0062BD]"
                />
                <Icons.Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
              </div>
            </div>

            {/* Filtre Marque */}
            <div className="mb-5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Marques
              </label>
              <div className="space-y-1">
                {[
                  { label: 'Toutes les marques', value: 'ALL' },
                  { label: 'Apple iPhone', value: 'IPHONE' },
                  { label: 'Samsung Galaxy', value: 'SAMSUNG' },
                  { label: 'Accessoires & Audio', value: 'ACCESSOIRE' },
                ].map((b) => (
                  <button
                    key={b.value}
                    onClick={() => handleBrandChange(b.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                      selectedBrand === b.value
                        ? 'bg-[#FED700] text-[#1D2129] font-black shadow-xs'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{b.label}</span>
                    {selectedBrand === b.value && <Icons.Check size={14} className="text-[#1D2129]" />}
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
                  { label: 'Occasion Certifiée & Garantie', value: 'OCCASION' },
                ].map((c) => (
                  <button
                    key={c.value}
                    onClick={() => handleConditionChange(c.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                      selectedCondition === c.value
                        ? 'bg-[#0062BD] text-white font-bold shadow-xs'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="truncate">{c.label}</span>
                    {selectedCondition === c.value && <Icons.Check size={14} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtre Troc Uniquement */}
            <div className="border-t border-gray-100 pt-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={tradeOnly}
                  onChange={(e) => handleTradeChange(e.target.checked)}
                  className="w-4 h-4 text-[#0062BD] rounded-sm border-gray-300 focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-gray-800 group-hover:text-[#0062BD] transition-colors flex items-center gap-1.5">
                    <Icons.Repeat size={13} className="text-emerald-600" />
                    <span>Éligible au Troc</span>
                  </span>
                  <p className="text-[10px] text-gray-400">Échangez votre ancien smartphone</p>
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
                onChange={(e) => handleSortChange(e.target.value as any)}
                className="bg-[#F8F9FA] border border-[#E2E5E8] rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none cursor-pointer"
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
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpenTrade={handleOpenTrade}
                  />
                ))}
              </div>

              {/* Contrôle de Pagination */}
              <div className="mt-8 bg-white border border-[#E2E5E8] rounded-xl p-2 shadow-xs">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(p) => {
                    setCurrentPage(p);
                    window.scrollTo({ top: 180, behavior: 'smooth' });
                  }}
                  totalItems={filteredProducts.length}
                  itemsPerPage={pageSize}
                  onItemsPerPageChange={(newSize) => {
                    setPageSize(newSize);
                    setCurrentPage(1);
                  }}
                  pageSizeOptions={[6, 12, 24, 48]}
                  itemLabel="produits"
                />
              </div>
            </>
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
