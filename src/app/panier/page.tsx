'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { Icons } from '@/components/ui/Icons';

export default function CartPage() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    freeShippingThreshold,
    freeShippingProgress,
    shippingFee,
    appliedPromo,
    promoError,
    applyPromoCode,
    removePromoCode,
    discountAmount,
    total
  } = useCart();

  const [promoInput, setPromoInput] = useState('');

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoInput.trim()) {
      applyPromoCode(promoInput);
      setPromoInput('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <Link href="/" className="hover:text-[#0054A4]">Home</Link>
        <span>/</span>
        <span className="text-gray-900 font-bold">Shopping Cart</span>
      </nav>

      <h1 className="font-heading font-black text-2xl sm:text-3xl text-gray-900 mb-8 tracking-tight">
        My Cart ({cart.reduce((a, b) => a + b.quantity, 0)} items)
      </h1>

      {cart.length === 0 ? (
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-12 text-center max-w-xl mx-auto shadow-xs">
          <div className="w-20 h-20 rounded-full bg-amber-50 text-[#F1B20B] flex items-center justify-center mx-auto mb-4">
            <Icons.ShoppingCart size={40} className="text-[#1D2129]" />
          </div>
          <h2 className="font-heading font-bold text-xl text-gray-900 mb-2">Your cart is currently empty</h2>
          <p className="text-xs text-gray-500 mb-8">
            Explore our curated selection of genuine electronics, cosmetics, fashion and home essentials.
          </p>
          <Link
            href="/boutique"
            className="bg-[#F1B20B] hover:bg-[#D99F07] text-[#1D2129] font-heading font-black text-xs uppercase tracking-wider px-8 py-4 rounded-xl shadow-md transition-all inline-block"
          >
            Explore Store
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart items list (Left) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Free shipping bar */}
            <div className="bg-white border border-[#E2E5E8] rounded-xl p-4 shadow-xs">
              {subtotal >= freeShippingThreshold ? (
                <p className="text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <Icons.Check size={18} className="text-emerald-600" />
                  You have unlocked <strong>Free Delivery</strong> in Honiara!
                </p>
              ) : (
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-700">
                      Add <strong className="text-[#0054A4]">{formatPrice(freeShippingThreshold - subtotal)}</strong> more for <strong>Free Delivery</strong>
                    </span>
                    <span className="font-bold text-gray-900">{freeShippingProgress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0054A4] rounded-full shipping-progress"
                      style={{ width: `${freeShippingProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Cart Table */}
            <div className="bg-white border border-[#E2E5E8] rounded-xl overflow-hidden shadow-xs divide-y divide-gray-100">
              {cart.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <img
                    src={item.product.images[0]?.url}
                    alt={item.product.name}
                    className="w-20 h-20 object-contain rounded-xl bg-gray-50 border border-gray-200 p-2 flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/produit/${item.product.slug}`}
                      className="font-bold text-sm text-gray-900 hover:text-[#0054A4] line-clamp-2 mb-1"
                    >
                      {item.product.name}
                    </Link>

                    {item.selectedVariant && (
                      <p className="text-xs text-gray-500 mb-2">
                        {item.selectedVariant.storage ? `${item.selectedVariant.storage} • ` : ''}
                        {item.selectedVariant.color}
                      </p>
                    )}

                    <div className="text-xs font-black text-[#0054A4] font-price">
                      Unit Price: {formatPrice(item.unitPrice)}
                    </div>
                  </div>

                  {/* Quantity selector */}
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                      className="p-2 hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                    >
                      <Icons.Minus size={14} />
                    </button>
                    <span className="px-3 text-xs font-bold text-gray-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                      className="p-2 hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                    >
                      <Icons.Plus size={14} />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right min-w-[100px]">
                    <span className="font-heading font-black text-sm text-[#DC3545] font-price block">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </span>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeFromCart(item.productId, item.variantId)}
                    className="text-gray-400 hover:text-red-600 p-2 transition-colors cursor-pointer"
                    title="Remove"
                  >
                    <Icons.Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2">
              <Link
                href="/boutique"
                className="text-xs font-bold text-[#0054A4] hover:underline flex items-center gap-1"
              >
                <Icons.ChevronRight size={14} className="rotate-180" />
                <span>Continue Shopping</span>
              </Link>
              <button
                onClick={clearCart}
                className="text-xs text-gray-500 hover:text-red-600 font-semibold cursor-pointer"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary (Right) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-xs space-y-5">
              <h3 className="font-heading font-black text-base text-gray-900 pb-3 border-b border-gray-100">
                Order Summary
              </h3>

              {/* Promo code */}
              <div>
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo Code (e.g. HONIARA2026)"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#0054A4] uppercase"
                  />
                  <button
                    type="submit"
                    className="bg-[#1D2129] hover:bg-[#2C3039] text-[#F1B20B] font-bold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </form>

                {promoError && (
                  <p className="text-[11px] font-semibold text-[#DC3545] mt-1.5">{promoError}</p>
                )}

                {appliedPromo && (
                  <div className="mt-2 bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-lg flex items-center justify-between text-xs">
                    <span className="font-bold">🎉 Code {appliedPromo.code} applied</span>
                    <button
                      onClick={removePromoCode}
                      className="text-emerald-700 hover:text-red-600 font-black cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Cost breakdown */}
              <div className="space-y-2.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">{formatPrice(subtotal)}</span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Promo Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Delivery (Honiara)</span>
                  <span className="font-bold text-gray-900">
                    {shippingFee === 0 ? <span className="text-emerald-600">FREE</span> : formatPrice(shippingFee)}
                  </span>
                </div>

                <div className="flex justify-between items-baseline text-base font-black text-gray-900 pt-3 border-t border-gray-200">
                  <span>Estimated Total</span>
                  <span className="text-xl text-[#0054A4] font-price">{formatPrice(total)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full bg-[#F1B20B] hover:bg-[#D99F07] text-[#1D2129] font-heading font-black text-xs uppercase tracking-wider py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <Icons.ArrowRight size={16} />
              </Link>

              <div className="text-[11px] text-gray-500 text-center space-y-1 pt-1">
                <div className="flex items-center justify-center gap-1.5 text-emerald-700 font-semibold">
                  <Icons.ShieldCheck size={14} />
                  <span>100% Safe Checkout • Zero Hidden Fees</span>
                </div>
                <p>Cash on Delivery (Honiara) • Direct BSP Bank Transfer</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
