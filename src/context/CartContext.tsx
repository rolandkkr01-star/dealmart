'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductVariant, PromoCode } from '@/types';
import { PROMO_CODES } from '@/data/products';

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  total: number;
  freeShippingThreshold: number;
  freeShippingProgress: number;
  appliedPromo: PromoCode | null;
  promoError: string | null;
  isCartDrawerOpen: boolean;
  wishlist: string[];
  addToCart: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => boolean;
  removePromoCode: () => void;
  setIsCartDrawerOpen: (open: boolean) => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  notification: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  // Charger le panier et les favoris depuis localStorage (avec purge des anciennes données factices)
  useEffect(() => {
    try {
      const storeVersion = localStorage.getItem('techphone229_store_v');
      if (storeVersion !== '2.0.0') {
        localStorage.removeItem('techphone229_cart');
        localStorage.removeItem('techphone229_wishlist');
        localStorage.removeItem('techphone229_promo');
        localStorage.removeItem('techphone229_trade_offers');
        localStorage.removeItem('techphone229_orders');
        localStorage.setItem('techphone229_store_v', '2.0.0');
        setCart([]);
        setWishlist([]);
        setAppliedPromo(null);
      } else {
        const savedCart = localStorage.getItem('techphone229_cart');
        if (savedCart && savedCart !== 'undefined' && savedCart !== 'null') {
          try { setCart(JSON.parse(savedCart)); } catch (_) {}
        }

        const savedWishlist = localStorage.getItem('techphone229_wishlist');
        if (savedWishlist && savedWishlist !== 'undefined' && savedWishlist !== 'null') {
          try { setWishlist(JSON.parse(savedWishlist)); } catch (_) {}
        }

        const savedPromo = localStorage.getItem('techphone229_promo');
        if (savedPromo && savedPromo !== 'undefined' && savedPromo !== 'null') {
          try { setAppliedPromo(JSON.parse(savedPromo)); } catch (_) {}
        }
      }
    } catch (e) {
      console.error('Erreur chargement localStorage:', e);
    }
    setMounted(true);
  }, []);

  // Sauvegarder dans localStorage
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('techphone229_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Erreur sauvegarde cart:', e);
    }
  }, [cart, mounted]);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('techphone229_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Erreur sauvegarde wishlist:', e);
    }
  }, [wishlist, mounted]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const addToCart = (product: Product, variant?: ProductVariant, quantity: number = 1) => {
    const selectedVariant = variant || product.variants[0];
    const unitPrice = selectedVariant?.priceOverride ?? (product.promoPrice ?? product.basePrice);
    const variantId = selectedVariant?.id;

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id && item.variantId === variantId
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            variantId,
            product,
            selectedVariant,
            quantity,
            unitPrice
          }
        ];
      }
    });

    setIsCartDrawerOpen(true);
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    setCart((prev) => prev.filter((item) => !(item.productId === productId && item.variantId === variantId)));
    showToast('Article retiré du panier.');
  };

  const updateQuantity = (productId: string, variantId: string | undefined, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.variantId === variantId) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('techphone229_cart');
      localStorage.removeItem('techphone229_promo');
    }
  };

  const applyPromoCode = (code: string): boolean => {
    setPromoError(null);
    const cleanCode = code.trim().toUpperCase();
    const found = PROMO_CODES.find((p) => p.code.toUpperCase() === cleanCode && p.isActive);

    if (!found) {
      setPromoError('Code promo invalide ou expiré.');
      return false;
    }

    if (found.minOrderAmount && subtotal < found.minOrderAmount) {
      setPromoError(`Montant minimum de ${found.minOrderAmount.toLocaleString()} FCFA requis.`);
      return false;
    }

    setAppliedPromo(found);
    if (typeof window !== 'undefined') {
      localStorage.setItem('techphone229_promo', JSON.stringify(found));
    }
    showToast(`🎉 Code promo ${found.code} appliqué !`);
    return true;
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoError(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('techphone229_promo');
    }
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Article retiré de vos favoris.');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('❤️ Article ajouté à vos favoris !');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  const freeShippingThreshold = 100000; // 100 000 FCFA
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 2500; // 2500 FCFA livraison standard Cotonou

  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.discountType === 'PERCENTAGE') {
      discountAmount = Math.round((subtotal * appliedPromo.discountValue) / 100);
    } else {
      discountAmount = appliedPromo.discountValue;
    }
  }

  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        subtotal,
        shippingFee,
        discountAmount,
        total,
        freeShippingThreshold,
        freeShippingProgress,
        appliedPromo,
        promoError,
        isCartDrawerOpen,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyPromoCode,
        removePromoCode,
        setIsCartDrawerOpen,
        toggleWishlist,
        isInWishlist,
        notification
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
