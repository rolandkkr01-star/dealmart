'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';
import { Icons } from '@/components/ui/Icons';
import { siteConfig } from '@/lib/site-config';
import { initCheckoutPaymentAction, verifyOrderPaymentAction } from '@/actions/payments';
import { getUserAddressesAction } from '@/actions/address';
import { PaymentGateway } from '@/lib/payments/types';
import { UserAddress } from '@/types';

declare global {
  interface Window {
    openKkiapayWidget?: (options: any) => void;
    addSuccessListener?: (callback: (response: any) => void) => void;
    addFailedListener?: (callback: (error: any) => void) => void;
    FedaPay?: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const { cart, subtotal, shippingFee, discountAmount, total, appliedPromo, clearCart } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Adresses enregistrées et sélection
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddressMode, setSelectedAddressMode] = useState<string>('new'); // address.id or 'new'
  const [saveAddress, setSaveAddress] = useState(true);
  const [addressLabel, setAddressLabel] = useState('');

  // Identifiant de la commande en cours de règlement (persistant en session pour éviter tout doublon)
  const [pendingOrderNumber, setPendingOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedNum = sessionStorage.getItem('dealmart_checkout_order_num');
      if (savedNum) {
        setPendingOrderNumber(savedNum);
      }
    }
  }, []);

  // Champs de localisation (Îles Salomon)
  const [city, setCity] = useState('Honiara');
  const [district, setDistrict] = useState('');
  const [streetDetails, setStreetDetails] = useState('');
  const [notes, setNotes] = useState('');

  // Choix du mode de paiement (par défaut Cash on Delivery)
  const [paymentProvider, setPaymentProvider] = useState<PaymentGateway>('cod');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kkiapayLoaded, setKkiapayLoaded] = useState(false);

  // Chargement des informations utilisateur et de ses adresses réelles
  useEffect(() => {
    if (user) {
      setCustomerName(`${user.firstName} ${user.lastName}`.trim());
      setCustomerEmail(user.email || '');
      if (user.phone) {
        setCustomerPhone(user.phone);
      }

      async function loadAddresses() {
        setLoadingAddresses(true);
        const res = await getUserAddressesAction();
        if (res.success && res.addresses && res.addresses.length > 0) {
          setSavedAddresses(res.addresses);
          const defaultAddr = res.addresses.find((a: any) => a.isDefault) || res.addresses[0];
          if (defaultAddr) {
            setSelectedAddressMode(defaultAddr.id);
            setCity(defaultAddr.city);
            setDistrict(defaultAddr.district || '');
            setStreetDetails(defaultAddr.street);
            if (defaultAddr.phone) setCustomerPhone(defaultAddr.phone);
          }
        } else {
          setSelectedAddressMode('new');
          setCity('Honiara');
          setDistrict('');
          setStreetDetails('');
        }
        setLoadingAddresses(false);
      }
      loadAddresses();
    }
  }, [user]);

  const handleSelectSavedAddress = (addr: UserAddress) => {
    setSelectedAddressMode(addr.id);
    setCity(addr.city);
    setDistrict(addr.district || '');
    setStreetDetails(addr.street);
    if (addr.phone) setCustomerPhone(addr.phone);
  };

  const handleSelectNewAddress = () => {
    setSelectedAddressMode('new');
    setCity('Honiara');
    setDistrict('');
    setStreetDetails('');
    setAddressLabel('');
    setSaveAddress(true);
  };

  // If cart is empty
  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#1D2129]">
          <Icons.BrandCart size={36} />
        </div>
        <h2 className="font-heading font-black text-2xl text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-xs text-gray-500 mb-6 max-w-sm mx-auto">
          Please add at least one product before proceeding to checkout.
        </p>
        <Link
          href="/boutique"
          className="bg-[#F1B20B] hover:bg-[#D99F07] text-[#1D2129] font-heading font-black text-xs uppercase px-8 py-3.5 rounded-xl inline-flex items-center gap-2 shadow-xs transition-all"
        >
          <Icons.ShoppingCart size={16} />
          <span>Explore Store</span>
        </Link>
      </div>
    );
  }

  // Auth loading state
  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-3 border-[#F1B20B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-gray-500 font-medium">Loading secure checkout session...</p>
      </div>
    );
  }

  // If user is NOT signed in: prompt sign in
  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 sm:p-12 shadow-sm text-center">
          <div className="w-16 h-16 bg-blue-50 text-[#0054A4] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icons.Lock size={32} />
          </div>

          <h1 className="font-heading font-black text-2xl sm:text-3xl text-gray-900 mb-2">
            Sign In to Complete Your Order
          </h1>
          <p className="text-xs text-gray-600 max-w-lg mx-auto mb-8">
            To ensure accurate delivery across Honiara and the provinces, generate your invoice, and enable live tracking, please sign in to your {siteConfig.name} account.
          </p>

          <div className="space-y-3.5 max-w-md mx-auto">
            {/* 1. Google OAuth */}
            <a
              href={`/api/auth/google?redirect=${encodeURIComponent('/checkout')}`}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs py-3.5 rounded-2xl shadow-xs transition-all cursor-pointer"
            >
              <Icons.Google size={20} />
              <span>Continue with Google</span>
            </a>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-gray-400 font-medium">or with your email address</span>
              </div>
            </div>

            {/* 2. Email Login */}
            <Link
              href={`/connexion?redirect=${encodeURIComponent('/checkout')}`}
              className="w-full block bg-[#0054A4] hover:bg-[#00519E] text-white font-bold text-xs py-3.5 rounded-2xl shadow-xs transition-all text-center"
            >
              Sign In with Email
            </Link>

            {/* 3. Register */}
            <Link
              href={`/inscription?redirect=${encodeURIComponent('/checkout')}`}
              className="w-full block bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs py-3.5 rounded-2xl transition-all text-center"
            >
              Create a DealMart Account
            </Link>
          </div>

          {/* Reassurance */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 pt-8 border-t border-gray-100 text-left">
            <div className="flex items-start gap-2.5 text-xs text-gray-600">
              <Icons.ShieldCheck size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>100% Genuine Quality Guaranteed</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-gray-600">
              <Icons.Truck size={18} className="text-[#0054A4] flex-shrink-0 mt-0.5" />
              <span>Fast Delivery in Honiara & Provinces</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-gray-600">
              <Icons.CreditCard size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <span>Cash on Delivery & BSP Bank Transfer</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Traitement et déclenchement du paiement
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName || !customerPhone || !streetDetails) {
      setError('Please fill in all required delivery and contact details.');
      return;
    }

    setIsProcessing(true);

    try {
      const orderItems = cart.map((item) => ({
        productId: item.productId,
        variantId: item.selectedVariant?.id,
        productName: item.product.name,
        productImage: item.product.images[0]?.url || '',
        variantInfo: item.selectedVariant ? `${item.selectedVariant.storage || ''} ${item.selectedVariant.color || ''}`.trim() : undefined,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));

      // 1. Initialisation de la commande et préparation du flux de paiement
      const initResult = await initCheckoutPaymentAction({
        existingOrderNumber: pendingOrderNumber || undefined,
        customerName,
        customerEmail: customerEmail || user.email,
        customerPhone,
        city,
        district,
        streetDetails,
        notes: notes || undefined,
        totalAmount: total,
        shippingFee,
        discountAmount,
        promoCode: appliedPromo?.code,
        paymentProvider,
        saveAddress: selectedAddressMode === 'new' ? saveAddress : false,
        addressLabel: selectedAddressMode === 'new' ? addressLabel : undefined,
        items: orderItems,
      });

      if (!initResult.success || !initResult.orderNumber) {
        setIsProcessing(false);
        setError(initResult.error || 'Impossible d\'initialiser le paiement.');
        return;
      }

      const orderNumber = initResult.orderNumber;
      setPendingOrderNumber(orderNumber);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('dealmart_checkout_order_num', orderNumber);
      }

      // Redirection directe pour Cash on Delivery / Direct Bank Transfer / Card
      if ((initResult as any).redirectUrl) {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('dealmart_checkout_order_num');
        }
        clearCart();
        setIsProcessing(false);
        router.push((initResult as any).redirectUrl);
        return;
      }

      // 2. Branchement KKIAPAY (si encore configuré)
      if (initResult.paymentProvider === 'kkiapay' && initResult.kkiapay) {
        const kkiapayData = initResult.kkiapay;

        if (typeof window !== 'undefined' && window.openKkiapayWidget && kkiapayData.publicKey) {
          // Configuration des écouteurs Kkiapay
          if (window.addSuccessListener) {
            window.addSuccessListener(async (response: any) => {
              setIsProcessing(true);
              const txId = response.transactionId || response.transaction_id || `KKIA-${Date.now()}`;
              const verifyRes = await verifyOrderPaymentAction({
                orderNumber,
                transactionId: txId,
                provider: 'kkiapay',
              });

              if (verifyRes.success) {
                if (typeof window !== 'undefined') {
                  sessionStorage.removeItem('dealmart_checkout_order_num');
                }
                clearCart();
                router.push(`/commande/${orderNumber}?payment=success`);
              } else {
                setError(verifyRes.error || 'Paiement non validé.');
                setIsProcessing(false);
              }
            });
          }

          if (window.addFailedListener) {
            window.addFailedListener((err: any) => {
              setIsProcessing(false);
              setError('Le paiement Kkiapay a été annulé ou a échoué.');
            });
          }

          // Ouverture du Widget Kkiapay
          window.openKkiapayWidget({
            amount: initResult.amount,
            key: kkiapayData.publicKey,
            sandbox: kkiapayData.isSandbox,
            phone: customerPhone.replace(/[^0-9+]/g, ''),
            email: customerEmail || user.email,
            name: customerName,
            data: { orderNumber },
          });
          setIsProcessing(false);
          return;
        } else {
          // Si la clé n'est pas encore saisie ou widget non chargé, validation simulée transparente
          const verifyRes = await verifyOrderPaymentAction({
            orderNumber,
            transactionId: `KKIAPAY-DEV-${Date.now().toString().slice(-6)}`,
            provider: 'kkiapay',
          });
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('dealmart_checkout_order_num');
          }
          clearCart();
          setIsProcessing(false);
          router.push(`/commande/${orderNumber}?status=simulated`);
          return;
        }
      }

      // 3. Branchement FEDAPAY
      if (initResult.paymentProvider === 'fedapay' && initResult.fedapay) {
        const paymentUrl = initResult.fedapay.paymentUrl;
        if (paymentUrl) {
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('dealmart_checkout_order_num');
          }
          clearCart();
          window.location.href = paymentUrl;
          return;
        } else {
          // Simulation fluide si en environnement de test
          const verifyRes = await verifyOrderPaymentAction({
            orderNumber,
            transactionId: `FEDAPAY-DEV-${Date.now().toString().slice(-6)}`,
            provider: 'fedapay',
          });
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('dealmart_checkout_order_num');
          }
          clearCart();
          setIsProcessing(false);
          router.push(`/commande/${orderNumber}?status=simulated`);
          return;
        }
      }

      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('dealmart_checkout_order_num');
      }
      clearCart();
      setIsProcessing(false);
      router.push(`/commande/${orderNumber}`);
    } catch (err: any) {
      console.error(err);
      setIsProcessing(false);
      setError(err.message || 'Une erreur est survenue lors de la finalisation de votre commande.');
    }
  };

  return (
    <>
      {/* Script officiel Kkiapay */}
      <Script
        src="https://cdn.kkiapay.me/k.js"
        strategy="lazyOnload"
        onLoad={() => setKkiapayLoaded(true)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-[#0054A4]">Home</Link>
          <span>/</span>
          <Link href="/panier" className="hover:text-[#0054A4]">Cart</Link>
          <span>/</span>
          <span className="text-gray-900 font-bold">Secure Checkout</span>
        </nav>

        {/* Title & Signed-In Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-gray-900 tracking-tight">
              Complete Your Order
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Provide your delivery location and choose your payment method.
            </p>
          </div>

          {/* User Badge */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2.5 flex items-center justify-between sm:justify-start gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="text-xs">
                <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider">Signed in as</span>
                <strong className="text-emerald-950 font-heading font-bold">{user.firstName} {user.lastName}</strong>
              </div>
            </div>
            <button
              type="button"
              onClick={() => logout('/checkout')}
              className="text-[11px] text-gray-500 hover:text-red-600 underline font-medium cursor-pointer ml-2"
              title="Sign out"
            >
              Switch
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs mb-6 flex items-center gap-2.5">
            <Icons.AlertCircle size={18} className="text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Formulaire Informations Client & Livraison (Gauche) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1 : Customer contact */}
            <div className="bg-white border border-[#E2E5E8] rounded-3xl p-6 shadow-xs">
              <h3 className="font-heading font-black text-sm uppercase text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#F1B20B] text-[#1D2129] flex items-center justify-center font-bold text-xs">1</span>
                <span>Contact Information</span>
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Your full name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#0054A4] focus:outline-none font-bold text-gray-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Phone Number (Solomon Islands) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +677 7465588"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#0054A4] focus:outline-none font-bold text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Email for Receipt & Updates *</label>
                    <input
                      type="email"
                      required
                      placeholder="name@dealmart.sb"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#0054A4] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 : Delivery Location */}
            <div className="bg-white border border-[#E2E5E8] rounded-3xl p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                <h3 className="font-heading font-black text-sm uppercase text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#F1B20B] text-[#1D2129] flex items-center justify-center font-bold text-xs">2</span>
                  <span>Delivery Location (Solomon Islands)</span>
                </h3>
                {savedAddresses.length > 0 && (
                  <Link
                    href="/compte/adresses"
                    target="_blank"
                    className="text-[11px] font-bold text-[#0054A4] hover:underline flex items-center gap-1"
                  >
                    <Icons.Settings size={13} />
                    <span>Manage addresses</span>
                  </Link>
                )}
              </div>

              {/* Saved addresses selector */}
              {savedAddresses.length > 0 && (
                <div className="mb-5 space-y-2">
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Select a saved address:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressMode === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectSavedAddress(addr)}
                          className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'border-[#0054A4] bg-blue-50/60 shadow-xs'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                              <Icons.MapPin size={14} className={isSelected ? 'text-[#0054A4]' : 'text-gray-400'} />
                              <span>{addr.label}</span>
                            </span>
                            {addr.isDefault && (
                              <span className="text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                            {addr.district ? `${addr.district}, ` : ''}{addr.city} • {addr.street}
                          </p>
                          {addr.phone && (
                            <p className="text-[10px] text-gray-500 font-medium mt-2 flex items-center gap-1">
                              <Icons.Phone size={11} />
                              <span>{addr.phone}</span>
                            </p>
                          )}
                        </div>
                      );
                    })}

                    {/* New address button */}
                    <div
                      onClick={handleSelectNewAddress}
                      className={`p-3.5 rounded-2xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center text-center ${
                        selectedAddressMode === 'new'
                          ? 'border-[#F1B20B] bg-amber-50/60 shadow-xs'
                          : 'border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-800 shadow-2xs mb-1">
                        <Icons.Plus size={15} />
                      </div>
                      <span className="font-bold text-xs text-gray-900">Use a different address</span>
                      <span className="text-[10px] text-gray-500">Enter a new delivery destination</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Address input form */}
              {(selectedAddressMode === 'new' || savedAddresses.length === 0) && (
                <div className="space-y-4 text-xs bg-gray-50/70 p-4 rounded-2xl border border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Town / Province *</label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#0054A4] focus:outline-none bg-white font-bold text-gray-900"
                      >
                        <option value="Honiara">Honiara (Guadalcanal - Express delivery)</option>
                        <option value="Gizo">Gizo (Western Province)</option>
                        <option value="Auki">Auki (Malaita Province)</option>
                        <option value="Noro">Noro (Western Province)</option>
                        <option value="Munda">Munda (Western Province)</option>
                        <option value="Kirakira">Kirakira (Makira-Ulawa)</option>
                        <option value="Lata">Lata (Temotu)</option>
                        <option value="Taro">Taro (Choiseul)</option>
                        <option value="Buala">Buala (Isabel)</option>
                        <option value="Tulagi">Tulagi (Central Province)</option>
                        <option value="Other Province">Other Solomon Islands Location</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Area / Suburb *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kukum, Point Cruz, Panatina, Henderson, White River..."
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#0054A4] focus:outline-none bg-white font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Street Address, Building & Delivery Notes *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kukum Highway, Transol Building, Office / Floor details"
                      value={streetDetails}
                      onChange={(e) => setStreetDetails(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#0054A4] focus:outline-none bg-white font-medium"
                    />
                  </div>

                  {/* Save address checkbox */}
                  <div className="pt-3 border-t border-gray-200">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={saveAddress}
                        onChange={(e) => setSaveAddress(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded text-[#0054A4] focus:ring-[#0054A4] border-gray-300 cursor-pointer"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-gray-900 block">Save this address to my address book</span>
                        <span className="text-[11px] text-gray-500">Makes your future checkouts even faster</span>
                      </div>
                    </label>

                    {saveAddress && (
                      <div className="mt-2.5 pl-7">
                        <input
                          type="text"
                          placeholder="Address label (e.g. Home, Office, Family)"
                          value={addressLabel}
                          onChange={(e) => setAddressLabel(e.target.value)}
                          className="w-full sm:w-80 border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-[#0054A4] focus:outline-none bg-white font-medium"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Delivery courier instructions */}
              <div className="mt-4 text-xs">
                <label className="block font-bold text-gray-700 mb-1">Delivery Notes / Landmark (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Call 15 minutes before arrival, opposite Kwamaini building"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#0054A4] focus:outline-none bg-white"
                />
              </div>
            </div>

            {/* Étape 3 : Sélection du Mode de Paiement */}
            <div className="bg-white border border-[#E2E5E8] rounded-3xl p-6 shadow-xs">
              <h3 className="font-heading font-black text-sm uppercase text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#F1B20B] text-[#1D2129] flex items-center justify-center font-bold text-xs">3</span>
                <span>Payment Method</span>
              </h3>

              <div className="space-y-3">
                {/* Option 1 : Cash on Delivery */}
                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentProvider === 'cod'
                      ? 'border-[#F1B20B] bg-amber-50/50 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentProvider === 'cod'}
                      onChange={() => setPaymentProvider('cod')}
                      className="accent-[#F1B20B] w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-xs text-gray-900 block">
                        Cash on Delivery / Pickup (Honiara & Delivery Hubs)
                      </span>
                      <span className="text-[11px] text-gray-500 block">
                        Pay in cash upon inspection and receipt of your order.
                      </span>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center flex-shrink-0">
                    <Icons.Wallet size={18} />
                  </div>
                </label>

                {/* Option 2 : Direct Bank Transfer (BSP / ANZ) */}
                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentProvider === 'bank_transfer'
                      ? 'border-[#0054A4] bg-blue-50/50 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentProvider === 'bank_transfer'}
                      onChange={() => setPaymentProvider('bank_transfer')}
                      className="accent-[#0054A4] w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-xs text-gray-900 block">
                        Direct Bank Transfer (Bank South Pacific - BSP / ANZ)
                      </span>
                      <span className="text-[11px] text-gray-500 block">
                        Transfer directly to our local corporate account. Bank details provided upon checkout.
                      </span>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#0054A4] flex items-center justify-center flex-shrink-0">
                    <Icons.CreditCard size={18} />
                  </div>
                </label>

                {/* Option 3 : Credit / Debit Card */}
                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentProvider === 'card'
                      ? 'border-[#0054A4] bg-blue-50/50 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentProvider === 'card'}
                      onChange={() => setPaymentProvider('card')}
                      className="accent-[#0054A4] w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-xs text-gray-900 block">
                        Credit / Debit Card (Visa / Mastercard)
                      </span>
                      <span className="text-[11px] text-gray-500 block">
                        Fast and secure payment with debit or credit card.
                      </span>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center flex-shrink-0">
                    <Icons.ShieldCheck size={18} />
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Récapitulatif Panier & Validation de la Commande (Droite) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[#E2E5E8] rounded-3xl p-6 shadow-xs sticky top-24">
              <h3 className="font-heading font-black text-sm uppercase text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs text-gray-500 font-bold">({cart.length})</span>
              </h3>

              {/* Items List */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1 mb-6">
                {cart.map((item, idx) => (
                  <div key={`${item.productId}-${item.variantId || idx}`} className="flex items-center gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="w-14 h-14 bg-gray-50 border border-gray-200 rounded-xl p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      <img
                        src={item.product.images[0]?.url || '/images/placeholder.webp'}
                        alt={item.product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">{item.product.name}</h4>
                      {item.selectedVariant && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {item.selectedVariant.colorCode && (
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-gray-300"
                              style={{ backgroundColor: item.selectedVariant.colorCode }}
                            />
                          )}
                          <span className="text-[11px] text-gray-500 truncate">
                            {item.selectedVariant.storage ? `${item.selectedVariant.storage} • ` : ''}
                            {item.selectedVariant.color || ''}
                          </span>
                        </div>
                      )}
                      <span className="text-[11px] text-gray-500 block">Qty: {item.quantity} × {formatPrice(item.unitPrice)}</span>
                    </div>
                    <div className="font-heading font-bold text-xs text-gray-900 flex-shrink-0">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Calculations */}
              <div className="space-y-2.5 text-xs text-gray-600 border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">{formatPrice(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#DC3545]">
                    <span>Promo Discount ({appliedPromo?.code})</span>
                    <span className="font-bold">-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-gray-900">
                    {shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : formatPrice(shippingFee)}
                  </span>
                </div>

                <div className="flex justify-between items-baseline pt-3 border-t border-gray-100 font-heading">
                  <span className="font-black text-sm text-gray-900">Total Amount</span>
                  <span className="font-black text-2xl text-[#DC3545]">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-[#F1B20B] hover:bg-[#D99F07] text-[#1D2129] font-heading font-black text-xs uppercase py-4 rounded-2xl shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#1D2129] border-t-transparent rounded-full animate-spin" />
                    <span>Processing order securely...</span>
                  </>
                ) : (
                  <>
                    <Icons.ShieldCheck size={18} />
                    <span>
                      {paymentProvider === 'cod'
                        ? 'Place Order (Cash on Delivery)'
                        : paymentProvider === 'bank_transfer'
                        ? 'Place Order (Direct Bank Transfer)'
                        : 'Pay with Card'}
                    </span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-gray-400 text-center mt-3">
                By confirming your order, you agree to {siteConfig.name}&apos;s Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
