'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlugAction } from '@/actions/products';
import { formatFCFA, getDiscountPercentage, getConditionBadgeInfo } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { TradeModal } from '@/components/product/TradeModal';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductReviews } from '@/components/product/ProductReviews';
import { Icons } from '@/components/ui/Icons';
import { Product } from '@/types';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [selectedTradeProduct, setSelectedTradeProduct] = useState<Product | null>(null);

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

  // Calcul dynamique des photos associées à la variante/couleur sélectionnée (Hook appelé systématiquement au sommet)
  const activeImages = React.useMemo(() => {
    if (!product) return [];

    // 1. Images directement dans imagesJson de la variante
    if (selectedVariant?.imagesJson) {
      try {
        const parsed = JSON.parse(selectedVariant.imagesJson);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (_) {}
    }

    // 2. Images dans selectedVariant.images
    if (selectedVariant?.images && selectedVariant.images.length > 0) {
      return selectedVariant.images;
    }

    // 3. Images de la galerie globale taguées avec la même couleur
    if (selectedVariant?.color && product.images) {
      const colorMatches = product.images.filter(
        (img: any) => img.color && img.color.toLowerCase() === selectedVariant.color.toLowerCase()
      );
      if (colorMatches.length > 0) return colorMatches;
    }

    // 4. Galerie complète du produit
    return product.images && product.images.length > 0 ? product.images : [];
  }, [product, selectedVariant]);

  const handleVariantSelect = (v: any) => {
    setSelectedVariant(v);
    setSelectedImageIndex(0);
  };

  const handleOpenTrade = (prod: Product) => {
    setSelectedTradeProduct(prod);
    setIsTradeModalOpen(true);
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, selectedVariant || undefined, quantity);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-3 border-[#FED700] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
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
        <Link href="/" className="hover:text-[#0062BD]">Accueil</Link>
        <span>/</span>
        <Link href="/boutique" className="hover:text-[#0062BD]">Boutique</Link>
        <span>/</span>
        <Link href={`/boutique?brand=${product.brand}`} className="hover:text-[#0062BD]">{product.brand}</Link>
        <span>/</span>
        <span className="text-gray-900 font-bold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Fiche Produit Principale */}
      <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 sm:p-8 shadow-xs mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Galerie Photos Dynamique (Gauche) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-square rounded-2xl bg-gray-50 border border-gray-200 p-6 flex items-center justify-center overflow-hidden">
              <img
                src={activeImages[selectedImageIndex]?.url || product.images[0]?.url}
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
              >
                <Icons.Heart size={18} className={isWished ? "text-[#DC3545] fill-[#DC3545]" : ""} />
              </button>
            </div>

            {/* Vignettes miniatures de la couleur sélectionnée */}
            {activeImages.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {activeImages.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl border-2 p-1 bg-white flex-shrink-0 overflow-hidden transition-all cursor-pointer ${
                      selectedImageIndex === idx
                        ? 'border-[#0062BD] ring-2 ring-[#0062BD]/20'
                        : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={img.altText || ''} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            {/* Badge de réassurance authenticité */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 text-xs text-emerald-900">
              <Icons.ShieldCheck size={24} className="text-emerald-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-heading font-bold text-emerald-950">
                  Garantie Authenticité & Numéro de Série
                </strong>
                <span>
                  Chaque appareil est contrôlé rigoureusement. Vérification sur le site officiel constructeur possible au moment de la livraison à Cotonou.
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
              {product.tradeEligible && (
                <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-300">
                  <Icons.Repeat size={12} />
                  <span>Troc Possible</span>
                </span>
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
              <span className="text-xs text-gray-400">({product.reviewsCount || 0} avis certifiés)</span>
            </div>

            {/* Prix & Économie */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 mb-6">
              <div className="flex items-baseline gap-3">
                <span className="font-heading font-black text-3xl sm:text-4xl text-[#DC3545]">
                  {formatFCFA(currentPrice)}
                </span>
                {product.promoPrice && (
                  <span className="text-sm font-semibold text-gray-400 line-through">
                    {formatFCFA(product.basePrice)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                TVA incluse • Livraison rapide à Cotonou et environs
              </p>
            </div>

            {/* Sélection de la Couleur (Variante) */}
            {product.variants.length > 1 && (
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Couleur : <span className="text-[#0062BD]">{selectedVariant?.color || 'Par défaut'}</span>
                  </label>
                  {selectedVariant?.stock > 0 ? (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      ✓ En stock ({selectedVariant.stock} disponible{selectedVariant.stock > 1 ? 's' : ''})
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                      Épuisé dans cette couleur
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
                          ? 'border-[#0062BD] bg-blue-50/50 text-[#0062BD] ring-2 ring-[#0062BD]/20 shadow-xs'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {v.colorCode && (
                        <span
                          className="w-4 h-4 rounded-full border border-gray-300 shadow-2xs flex-shrink-0"
                          style={{ backgroundColor: v.colorCode }}
                        />
                      )}
                      <span>{v.color || 'Standard'}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bloc Actions : Achat Direct & Troc */}
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
                  className="flex-1 bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-heading font-black text-xs uppercase tracking-wider py-4 px-6 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Icons.ShoppingBag size={18} />
                  <span>Ajouter au Panier ({formatFCFA(currentPrice * quantity)})</span>
                </button>
              </div>

              {/* Bloc Troc (si éligible) */}
              {product.tradeEligible && (
                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-heading font-bold text-xs text-amber-950 flex items-center gap-1.5">
                      <Icons.Repeat size={16} className="text-amber-800" />
                      <span>Vous avez un smartphone à échanger ?</span>
                    </h4>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Échange direct ou avec complément financier (y compris si votre appareil actuel a plus de valeur).
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenTrade(product)}
                    className="bg-[#1D2129] hover:bg-[#2C3039] text-[#FED700] font-heading font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg shadow-xs transition-all cursor-pointer whitespace-nowrap"
                  >
                    Proposer un Troc
                  </button>
                </div>
              )}
            </div>

            {/* Caractéristiques rapides */}
            <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Icons.Truck size={18} className="text-[#0062BD]" />
                <span>Livraison 24h à Cotonou</span>
              </div>
              <div className="flex items-center gap-2">
                <Icons.CreditCard size={18} className="text-[#0062BD]" />
                <span>Paiement MTN MoMo / Moov Money</span>
              </div>
              <div className="flex items-center gap-2">
                <Icons.ShieldCheck size={18} className="text-[#0062BD]" />
                <span>Garantie {product.warrantyMonths} mois constructeur</span>
              </div>
              <div className="flex items-center gap-2">
                <Icons.PhoneCall size={18} className="text-[#0062BD]" />
                <span>Support local Cotonou 7j/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Spécifications Techniques */}
      <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 sm:p-8 shadow-xs mb-10">
        <h2 className="font-heading font-black text-xl text-gray-900 mb-4">
          Description Complète & Fiche Technique
        </h2>
        <p className="text-xs text-gray-600 leading-relaxed mb-6 whitespace-pre-line">
          {product.description}
        </p>

        {product.specs && Object.keys(product.specs).length > 0 && (
          <div>
            <h3 className="font-heading font-bold text-sm text-gray-900 mb-3 uppercase tracking-wider">
              Spécifications Matérielles
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
        initialRating={product.rating || 4.9}
        initialReviewCount={product.reviewsCount || 12}
      />

      {/* Modal Troc */}
      <TradeModal
        product={selectedTradeProduct}
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
      />
    </div>
  );
}
