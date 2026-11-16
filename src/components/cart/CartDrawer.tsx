'use client';

import React from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';
import { useCart } from '@/context/CartContext';
import { formatFCFA } from '@/lib/utils';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    freeShippingThreshold,
    freeShippingProgress,
    shippingFee,
    total
  } = useCart();

  if (!isCartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header du tiroir */}
          <div className="p-4 bg-[#F1B20B] text-[#1D2129] flex items-center justify-between border-b border-[#D99F07]">
            <div className="flex items-center gap-2">
              <Icons.ShoppingCart size={20} />
              <h3 className="font-heading font-black text-sm uppercase tracking-wide">
                Mon Panier ({cart.reduce((a, b) => a + b.quantity, 0)})
              </h3>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="w-8 h-8 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Icons.X size={18} />
            </button>
          </div>

          {/* Barre de progression livraison gratuite */}
          <div className="bg-amber-50 p-3.5 border-b border-amber-100 text-xs">
            {subtotal >= freeShippingThreshold ? (
              <p className="font-bold text-emerald-800 flex items-center gap-1.5">
                <Icons.Check size={16} className="text-emerald-600" />
                Félicitations ! Vous bénéficiez de la livraison gratuite à Cotonou !
              </p>
            ) : (
              <div>
                <p className="text-gray-700 mb-1.5">
                  Ajoutez encore <strong className="text-[#0054A4]">{formatFCFA(freeShippingThreshold - subtotal)}</strong> pour la <strong>livraison gratuite</strong> !
                </p>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0054A4] rounded-full shipping-progress"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Liste des articles */}
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-gray-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                  <Icons.ShoppingCart size={32} />
                </div>
                <h4 className="font-heading font-bold text-gray-800 text-base mb-1">Votre panier est vide</h4>
                <p className="text-xs text-gray-500 mb-6">Découvrez nos smartphones neufs et accessoires certifiés.</p>
                <Link
                  href="/boutique"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="bg-[#F1B20B] hover:bg-[#D99F07] text-[#1D2129] font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-lg shadow-sm transition-all"
                >
                  Découvrir les offres
                </Link>
              </div>
            ) : (
              cart.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="py-3.5 flex gap-3.5 items-start">
                  <img
                    src={item.product.images[0]?.url}
                    alt={item.product.name}
                    className="w-16 h-16 object-contain rounded-lg border border-gray-200 bg-[#F8F9FA] p-1 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/produit/${item.product.slug}`}
                      onClick={() => setIsCartDrawerOpen(false)}
                      className="text-xs font-bold text-[#0054A4] hover:underline line-clamp-2 leading-tight mb-1"
                    >
                      {item.product.name}
                    </Link>

                    {item.selectedVariant && (
                      <p className="text-[11px] text-gray-500 mb-2">
                        {item.selectedVariant.storage ? `${item.selectedVariant.storage} • ` : ''}
                        {item.selectedVariant.color}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      {/* Sélecteur de quantité */}
                      <div className="flex items-center border border-gray-300 rounded-md overflow-hidden bg-white">
                        <button
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                          className="px-2 py-1 hover:bg-gray-100 text-gray-600 transition-colors"
                        >
                          <Icons.Minus size={12} />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-gray-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                          className="px-2 py-1 hover:bg-gray-100 text-gray-600 transition-colors"
                        >
                          <Icons.Plus size={12} />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-[#DC3545] font-price">
                          {formatFCFA(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.productId, item.variantId)}
                    className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                    title="Supprimer"
                  >
                    <Icons.Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer avec Sous-total et CTA */}
          {cart.length > 0 && (
            <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span className="font-semibold text-gray-900">{formatFCFA(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Livraison (Cotonou & env.)</span>
                  <span className="font-semibold text-gray-900">
                    {shippingFee === 0 ? <strong className="text-emerald-600">GRATUITE</strong> : formatFCFA(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total estimé</span>
                  <span className="text-base text-[#0054A4] font-price">{formatFCFA(total)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/panier"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="w-full bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 font-bold text-xs uppercase tracking-wider py-3 rounded-lg text-center transition-colors"
                >
                  Voir le Panier
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="w-full bg-[#F1B20B] hover:bg-[#D99F07] text-[#1D2129] font-black text-xs uppercase tracking-wider py-3 rounded-lg text-center shadow-md transition-all flex items-center justify-center gap-1"
                >
                  <span>Commander</span>
                  <Icons.ArrowRight size={14} />
                </Link>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500 pt-1">
                <Icons.Lock size={12} className="text-emerald-600" />
                <span>Paiement 100% sécurisé via MTN, Moov & Kkiapay</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
