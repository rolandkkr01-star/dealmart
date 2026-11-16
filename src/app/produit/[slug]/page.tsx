'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlugAction } from '@/actions/products';
import { formatPrice, getDiscountPercentage, getConditionBadgeInfo } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { ProductReviews } from '@/components/product/ProductReviews';
import { Icons } from '@/components/ui/Icons';
import { Product } from '@/types';
import { siteConfig } from '@/lib/site-config';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      const res = await getProductBySlugAction(resolvedParams.slug);
      if (res) {
        const mapped: Product = {
          ...res,
          brand: res.brand as any,
          condition: res.condition as any,
          categoryName: res.category?.name || '',
          specs: res.specsJson ? JSON.parse(res.specsJson) : undefined,
          createdAt: res.createdAt ? new Date(res.createdAt).toISOString() : new Date().toISOString(),
        } as unknown as Product;

        setProduct(mapped);
        if (mapped.variants && mapped.variants.length > 0) {
          setSelectedVariant(mapped.variants[0]);
        }
      }
      setLoading(false);
    }
    loadProduct();
  }, [resolvedParams.slug]);

  // Calcul dynamique des photos associées à la variante sélectionnée
  const activeImages = React.useMemo(() => {
    if (!product) return [];

    if (selectedVariant?.imagesJson) {
      try {
        const parsed = JSON.parse(selectedVariant.imagesJson);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (_) {}
    }

    if (selectedVariant?.images && selectedVariant.images.length > 0) {
      return selectedVariant.images;
    }

    if (selectedVariant?.color && product.images) {
      const colorMatches = product.images.filter(
        (img: any) => img.color && img.color.toLowerCase() === selectedVariant.color.toLowerCase()
      );
      if (colorMatches.length > 0) return colorMatches;
    }

    return product.images && product.images.length > 0 ? product.images : [];
  }, [product, selectedVariant]);

  const handleVariantSelect = (v: any) => {
    setSelectedVariant(v);
    setSelectedImageIndex(0);
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, selectedVariant || undefined, quantity);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-3 border-[#F1B20B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-gray-500 font-medium">Chargement des détails du produit...</p>
      </div>
    );
  }

  if (!product) {
    return notFound();
  }

  const conditionInfo = getConditionBadgeInfo(product.condition);
  const currentPrice = selectedVariant?.priceOverride ?? (product.promoPrice ?? product.basePrice);
  const discount = getDiscountPercentage(product.basePrice, currentPrice);
  const isWished = isInWishlist(product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-[#0054A4]">Accueil</Link>
        <span>/</span>
        <Link href="/boutique" className="hover:text-[#0054A4]">Boutique</Link>
        <span>/</span>
        {product.categoryName && (
          <>
            <Link href={`/boutique?category=${product.categoryId}`} className="hover:text-[#0054A4]">
              {product.categoryName}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-900 font-bold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Fiche Produit Principale */}
      <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 sm:p-8 shadow-xs mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Galerie Photos Dynamique (Gauche) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-square rounded-2xl bg-gray-50 border border-gray-200 p-6 flex items-center justify-center overflow-hidden">
              <img
                src={activeImages[selectedImageIndex]?.url || product.images[0]?.url || '/images/logo/dealmart_logo_square.png'}
                alt={activeImages[selectedImageIndex]?.altText || product.name}
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
              />

              {discount && (
                <div className="absolute top-3 left-3 bg-[#DC3545] text-white text-xs font-black px-2.5 py-1 rounded-md shadow-xs">
                  -{discount}%
                </div>
              )}

              <button
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-gray-400 hover:text-[#DC3545] transition-colors cursor-pointer"
                title="Ajouter aux favoris"
              >
                <Icons.Heart size={18} className={isWished ? 'text-[#DC3545] fill-[#DC3545]' : ''} />
              </button>
            </div>

            {/* Vignettes miniatures */}
            {activeImages.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {activeImages.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl border-2 p-1 bg-white flex-shrink-0 overflow-hidden transition-all cursor-pointer ${
                      selectedImageIndex === idx
                        ? 'border-[#0054A4] ring-2 ring-[#0054A4]/20'
                        : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={img.altText || ''} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            {/* Badge réassurance qualité */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 text-xs text-emerald-900">
              <Icons.ShieldCheck size={24} className="text-emerald-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-heading font-bold text-emerald-950">
                  Garantie & Authenticité DealMart
                </strong>
                <span>
                  Chaque article est inspecté avant expédition. Vous pouvez vérifier votre commande à la réception à {siteConfig.city} ou dans les provinces.
                </span>
              </div>
            </div>
          </div>

          {/* Détails & Options d'Achat (Droite) */}
          <div className="lg:col-span-7 flex flex-col">
            {/* Marque & État */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-black text-gray-500 uppercase tracking-wider">{product.brand}</span>
              <span>•</span>
              <span
                className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full ${conditionInfo.badgeClass}`}
              >
                {conditionInfo.label}
              </span>
              {product.categoryName && (
                <>
                  <span>•</span>
                  <span className="text-[11px] font-bold text-[#0054A4] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {product.categoryName}
                  </span>
                </>
              )}
            </div>

            {/* Titre */}
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-gray-900 mb-3 leading-tight">
              {product.name}
            </h1>

            {/* Avis / Évaluations */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Icons.Star
                    key={i}
                    size={16}
                    className={i < Math.floor(product.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-200'}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-700">{(product.rating || 5).toFixed(1)}</span>
              <span className="text-xs text-gray-400">({product.reviewsCount || 0} avis clients)</span>
            </div>

            {/* Prix & Économie */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 mb-6">
              <div className="flex items-baseline gap-3">
                <span className="font-heading font-black text-3xl sm:text-4xl text-[#0054A4]">
                  {formatPrice(currentPrice)}
                </span>
                {product.promoPrice && (
                  <span className="text-sm font-semibold text-gray-400 line-through">
                    {formatPrice(product.basePrice)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Toutes taxes comprises • Livraison à domicile à {siteConfig.city} & expédition inter-îles
              </p>
            </div>

            {/* Sélection de la Variante / Couleur */}
            {product.variants.length > 1 && (
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Option / Couleur : <span className="text-[#0054A4]">{selectedVariant?.color || 'Standard'}</span>
                  </label>
                  {selectedVariant?.stock > 0 ? (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      ✓ En stock ({selectedVariant.stock} disponible{selectedVariant.stock > 1 ? 's' : ''})
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                      Rupture de stock pour cette option
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => handleVariantSelect(v)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-2.5 ${
                        selectedVariant?.id === v.id
                          ? 'border-[#0054A4] bg-blue-50/50 text-[#0054A4] ring-2 ring-[#0054A4]/20 shadow-xs'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {v.colorCode && (
                        <span
                          className="w-4 h-4 rounded-full border border-gray-300 shadow-2xs flex-shrink-0"
                          style={{ backgroundColor: v.colorCode }}
                        />
                      )}
                      <span>{v.color || v.sku || 'Standard'}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bloc Actions : Achat Direct */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Sélecteur de quantité */}
                <div className="flex items-center border border-gray-300 rounded-xl bg-white w-32 justify-between p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center font-bold text-gray-600 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold text-gray-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center font-bold text-gray-600 cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Bouton Ajouter au Panier */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#F1B20B] hover:bg-[#D99F07] text-[#1D2129] font-heading font-black text-xs uppercase tracking-wider py-4 px-6 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Icons.ShoppingBag size={18} />
                  <span>Ajouter au Panier ({formatPrice(currentPrice * quantity)})</span>
                </button>
              </div>
            </div>

            {/* Caractéristiques rapides */}
            <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Icons.Truck size={18} className="text-[#0054A4]" />
                <span>Livraison express à {siteConfig.city}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icons.CreditCard size={18} className="text-[#0054A4]" />
                <span>Paiement à la livraison / Virement BSP</span>
              </div>
              <div className="flex items-center gap-2">
                <Icons.ShieldCheck size={18} className="text-[#0054A4]" />
                <span>Garantie {product.warrantyMonths || 12} mois DealMart</span>
              </div>
              <div className="flex items-center gap-2">
                <Icons.PhoneCall size={18} className="text-[#0054A4]" />
                <span>Support local ({siteConfig.phone})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Fiche Technique */}
      <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 sm:p-8 shadow-xs mb-10">
        <h2 className="font-heading font-black text-xl text-gray-900 mb-4">
          Description Complète & Spécifications
        </h2>
        <p className="text-xs text-gray-600 leading-relaxed mb-6 whitespace-pre-line">
          {product.description}
        </p>

        {product.specs && Object.keys(product.specs).length > 0 && (
          <div>
            <h3 className="font-heading font-bold text-sm text-gray-900 mb-3 uppercase tracking-wider">
              Caractéristiques Techniques
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {Object.entries(product.specs).map(([key, val]) => (
                <div key={key} className="flex justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="font-bold text-gray-700">{key}</span>
                  <span className="text-gray-900 text-right">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Avis & Évaluations Clients */}
      <ProductReviews
        productId={product.id}
        productName={product.name}
        initialRating={product.rating || 5.0}
        initialReviewCount={product.reviewsCount || 0}
      />
    </div>
  );
}
