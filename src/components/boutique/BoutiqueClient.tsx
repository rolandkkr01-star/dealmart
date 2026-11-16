'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { Icons } from '@/components/ui/Icons';
import { Pagination } from '@/components/ui/Pagination';
import Link from 'next/link';

interface BoutiqueClientProps {
  initialProducts: Product[];
}

const DEPARTMENTS = [
  { label: 'All Departments', value: 'ALL' },
  { label: 'Electronics & Tech', value: 'electronics-gadgets' },
  { label: 'Beauty, Cosmetics & Skincare', value: 'beauty-cosmetics-skincare' },
  { label: 'Fashion & Accessories', value: 'fashion-accessories' },
  { label: 'Home, Living & Kitchen', value: 'home-kitchen-living' },
];

function BoutiqueContent({ initialProducts }: BoutiqueClientProps) {
  const searchParams = useSearchParams();
  const initialDept = searchParams.get('department') || searchParams.get('category') || 'ALL';
  const initialBrand = searchParams.get('brand') || 'ALL';
  const initialCondition = searchParams.get('condition') || 'ALL';
  const initialSearch = searchParams.get('search') || '';

  const [products] = useState<Product[]>(initialProducts);
  const [selectedDept, setSelectedDept] = useState<string>(initialDept);
  const [selectedBrand, setSelectedBrand] = useState<string>(initialBrand);
  const [selectedCondition, setSelectedCondition] = useState<string>(initialCondition);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);

  // Synchronisation dynamique quand les searchParams changent
  React.useEffect(() => {
    const dept = searchParams.get('department') || searchParams.get('category') || 'ALL';
    const brand = searchParams.get('brand') || 'ALL';
    const condition = searchParams.get('condition') || 'ALL';
    const search = searchParams.get('search') || '';

    setSelectedDept(dept);
    setSelectedBrand(brand);
    setSelectedCondition(condition);
    setSearchQuery(search);
    setCurrentPage(1);
  }, [searchParams]);

  // Extraire dynamiquement la liste des marques uniques présentes
  const availableBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    products.forEach((p) => {
      if (p.brand) brandsSet.add(p.brand);
    });
    return Array.from(brandsSet).sort();
  }, [products]);

  const handleDeptChange = (dept: string) => {
    setSelectedDept(dept);
    setCurrentPage(1);
  };

  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand);
    setCurrentPage(1);
  };

  const handleConditionChange = (cond: string) => {
    setSelectedCondition(cond);
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

  const resetFilters = () => {
    setSelectedDept('ALL');
    setSelectedBrand('ALL');
    setSelectedCondition('ALL');
    setSearchQuery('');
    setSortBy('featured');
    setCurrentPage(1);
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((prod) => {
        // Filtre rayon / catégorie
        if (selectedDept !== 'ALL') {
          const matchSlug = (prod as any).category?.slug === selectedDept;
          const matchId = prod.categoryId === selectedDept;
          if (!matchSlug && !matchId) return false;
        }
        // Filtre marque
        if (selectedBrand !== 'ALL' && prod.brand !== selectedBrand) return false;
        // Filtre état
        if (selectedCondition !== 'ALL' && prod.condition !== selectedCondition) return false;
        // Filtre recherche textuelle
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = prod.name.toLowerCase().includes(q);
          const matchDesc = prod.description.toLowerCase().includes(q);
          const matchBrand = prod.brand.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchBrand) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.basePrice - b.basePrice;
        if (sortBy === 'price-desc') return b.basePrice - a.basePrice;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [products, selectedDept, selectedBrand, selectedCondition, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb & Title */}
      <div className="mb-6">
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <Link href="/" className="hover:text-[#0054A4]">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-bold">Store</span>
        </nav>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-[#1D2129] tracking-tight">
          DealMart Store • Solomon Islands
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Electronics, Beauty & Cosmetics, Fashion, and Home essentials. Genuine products delivered in Honiara and across the provinces.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
          <div className="bg-white border border-[#E2E5E8] rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h2 className="font-heading font-black text-sm text-gray-900 flex items-center gap-2">
                <Icons.Sliders size={16} className="text-[#0054A4]" />
                <span>Filters</span>
              </h2>
              {(selectedDept !== 'ALL' || selectedBrand !== 'ALL' || selectedCondition !== 'ALL' || searchQuery) && (
                <button
                  onClick={resetFilters}
                  className="text-[11px] font-bold text-[#DC3545] hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Keyword search */}
            <div className="mb-5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Earbuds, Serum, Watch..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-[#F8F9FA] border border-[#E2E5E8] rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0054A4]"
                />
                <Icons.Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
              </div>
            </div>

            {/* Departments Filter */}
            <div className="mb-5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Departments
              </label>
              <div className="space-y-1">
                {DEPARTMENTS.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => handleDeptChange(d.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                      selectedDept === d.value
                        ? 'bg-[#F1B20B] text-[#1D2129] font-black shadow-xs'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="truncate">{d.label}</span>
                    {selectedDept === d.value && <Icons.Check size={14} className="text-[#1D2129] flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Brands Filter */}
            {availableBrands.length > 0 && (
              <div className="mb-5 border-t border-gray-100 pt-4">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Brands
                </label>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  <button
                    onClick={() => handleBrandChange('ALL')}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                      selectedBrand === 'ALL'
                        ? 'bg-[#0054A4] text-white font-bold shadow-xs'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>All Brands</span>
                    {selectedBrand === 'ALL' && <Icons.Check size={14} className="text-white" />}
                  </button>
                  {availableBrands.map((b) => (
                    <button
                      key={b}
                      onClick={() => handleBrandChange(b)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                        selectedBrand === b
                          ? 'bg-[#0054A4] text-white font-bold shadow-xs'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="truncate">{b}</span>
                      {selectedBrand === b && <Icons.Check size={14} className="text-white flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Condition Filter */}
            <div className="border-t border-gray-100 pt-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Product Condition
              </label>
              <div className="space-y-1.5">
                {[
                  { label: 'All Conditions', value: 'ALL' },
                  { label: 'Brand New Sealed', value: 'NEUF_SCELLE' },
                  { label: 'Refurbished / Grade A+', value: 'NEUF_NON_SCELLE' },
                  { label: 'Certified Pre-Owned', value: 'OCCASION' },
                ].map((c) => (
                  <button
                    key={c.value}
                    onClick={() => handleConditionChange(c.value)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                      selectedCondition === c.value
                        ? 'bg-gray-900 text-white font-bold shadow-xs'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="truncate">{c.label}</span>
                    {selectedCondition === c.value && <Icons.Check size={14} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Product list & sorting */}
        <div className="flex-1">
          {/* Catalog header */}
          <div className="bg-white border border-[#E2E5E8] rounded-xl p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-600">
              Showing <strong className="text-gray-900">{filteredProducts.length}</strong> product(s)
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <label className="text-xs text-gray-600 whitespace-nowrap font-medium">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as any)}
                className="bg-[#F8F9FA] border border-[#E2E5E8] rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured & Recommended</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Product grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-[#E2E5E8] rounded-xl p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400 mb-4">
                <Icons.ShoppingBag size={32} />
              </div>
              <h3 className="font-heading font-bold text-base text-gray-900 mb-2">
                {products.length === 0
                  ? 'No products currently available'
                  : 'No products match your criteria'}
              </h3>
              <p className="text-xs text-gray-500 mb-6">
                {products.length === 0
                  ? 'New stocks are arriving soon.'
                  : 'Try adjusting or clearing your filters.'}
              </p>
              <button
                onClick={resetFilters}
                className="bg-[#F1B20B] hover:bg-[#D99F07] text-[#1D2129] font-heading font-black text-xs uppercase px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
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
                    itemLabel="products"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function BoutiqueClient({ initialProducts }: BoutiqueClientProps) {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-gray-500">Loading DealMart store...</div>}>
      <BoutiqueContent initialProducts={initialProducts} />
    </Suspense>
  );
}
