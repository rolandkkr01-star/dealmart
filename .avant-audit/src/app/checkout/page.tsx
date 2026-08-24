'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useOrders } from '@/context/OrderContext';
import { formatFCFA } from '@/lib/utils';
import { Icons } from '@/components/ui/Icons';

import { createOrderAction } from '@/actions/orders';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, shippingFee, discountAmount, total, appliedPromo, clearCart } = useCart();
  const { createOrder } = useOrders();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [city, setCity] = useState('Cotonou');
  const [district, setDistrict] = useState('Haie Vive');
  const [streetDetails, setStreetDetails] = useState('');
  const [notes, setNotes] = useState('');

  const [paymentProvider, setPaymentProvider] = useState<'mtn_momo' | 'moov_money' | 'kkiapay'>('mtn_momo');
  const [momoNumber, setMomoNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="font-heading font-bold text-xl text-gray-900 mb-2">Votre panier est vide</h2>
        <p className="text-xs text-gray-500 mb-6">Veuillez ajouter des articles à votre panier avant de commander.</p>
        <Link
          href="/boutique"
          className="bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-bold text-xs uppercase px-6 py-3 rounded-xl inline-block"
        >
          Retourner à la boutique
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !streetDetails) {
      alert('Veuillez remplir toutes les informations de livraison.');
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
        unitPrice: item.unitPrice
      }));

      // 1. Sauvegarde en base de données Prisma
      const dbResult = await createOrderAction({
        customerName,
        customerEmail: customerEmail || undefined,
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
        paymentRef: `${paymentProvider.toUpperCase()}-BJ-${Math.floor(100000 + Math.random() * 900000)}`,
        items: orderItems,
      });

      // 2. Synchronisation état client
      const newOrder = createOrder({
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress: {
          city,
          district,
          streetDetails,
          notes
        },
        items: orderItems,
        totalAmount: total,
        shippingFee,
        discountAmount,
        promoCode: appliedPromo?.code,
        paymentProvider,
        paymentRef: `${paymentProvider.toUpperCase()}-BJ-${Math.floor(100000 + Math.random() * 900000)}`
      });

      const finalOrderNumber = dbResult.success && dbResult.orderNumber ? dbResult.orderNumber : newOrder.orderNumber;

      clearCart();
      setIsProcessing(false);
      router.push(`/commande/${finalOrderNumber}`);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      alert('Erreur lors de la finalisation de la commande.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <Link href="/" className="hover:text-[#0062BD]">Accueil</Link>
        <span>/</span>
        <Link href="/panier" className="hover:text-[#0062BD]">Panier</Link>
        <span>/</span>
        <span className="text-gray-900 font-bold">Tunnel de Commande Sécurisé</span>
      </nav>

      <h1 className="font-heading font-black text-2xl sm:text-3xl text-gray-900 mb-8 tracking-tight">
        Finaliser ma Commande
      </h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulaire Informations Client & Livraison (Gauche) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Étape 1 : Coordonnées */}
          <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-xs">
            <h3 className="font-heading font-black text-sm uppercase text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#FED700] text-[#1D2129] flex items-center justify-center font-bold text-xs">1</span>
              <span>Vos Informations de Contact</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nom complet *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Patrice Talon"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-[#0062BD] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Numéro de Téléphone (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+229 97 00 00 00"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-[#0062BD] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email pour le reçu</label>
                  <input
                    type="email"
                    placeholder="votre.email@gmail.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-[#0062BD] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Étape 2 : Adresse de Livraison au Bénin */}
          <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-xs">
            <h3 className="font-heading font-black text-sm uppercase text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#FED700] text-[#1D2129] flex items-center justify-center font-bold text-xs">2</span>
              <span>Adresse de Livraison au Bénin</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Ville *</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-[#0062BD] focus:outline-none bg-white"
                  >
                    <option value="Cotonou">Cotonou (Livraison 2h)</option>
                    <option value="Abomey-Calavi">Abomey-Calavi</option>
                    <option value="Porto-Novo">Porto-Novo</option>
                    <option value="Ouidah">Ouidah</option>
                    <option value="Parakou">Parakou / Nord-Bénin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Quartier / Zone *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Haie Vive, Cadjehoun, Akpakpa, Fidjrossè..."
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-[#0062BD] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Détails de l'adresse (Maison, Repère, Rue) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Face Pharmacie de la Haie Vive, Immeuble bleu au 1er étage"
                  value={streetDetails}
                  onChange={(e) => setStreetDetails(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-[#0062BD] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Instructions pour le coursier (optionnel)</label>
                <input
                  type="text"
                  placeholder="Ex: M'appeler 15 minutes avant d'arriver"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-[#0062BD] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Étape 3 : Mode de Paiement Mobile Money */}
          <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-xs">
            <h3 className="font-heading font-black text-sm uppercase text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#FED700] text-[#1D2129] flex items-center justify-center font-bold text-xs">3</span>
              <span>Paiement Sécurisé Mobile Money</span>
            </h3>

            <div className="space-y-3">
              {/* Option MTN MoMo */}
              <label
                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentProvider === 'mtn_momo' ? 'border-[#FED700] bg-amber-50/50' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentProvider === 'mtn_momo'}
                    onChange={() => setPaymentProvider('mtn_momo')}
                    className="accent-[#1D2129] w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-xs text-gray-900 block">MTN Mobile Money Bénin</span>
                    <span className="text-[11px] text-gray-500 block">Paiement instantané via push notification MoMo (*461#)</span>
                  </div>
                </div>
                <span className="bg-[#FED700] text-[#1D2129] font-black text-xs px-2.5 py-1 rounded">
                  MTN MoMo
                </span>
              </label>

              {/* Option Moov Money */}
              <label
                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentProvider === 'moov_money' ? 'border-[#0062BD] bg-blue-50/50' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentProvider === 'moov_money'}
                    onChange={() => setPaymentProvider('moov_money')}
                    className="accent-[#0062BD] w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-xs text-gray-900 block">Moov Money Bénin</span>
                    <span className="text-[11px] text-gray-500 block">Validation par code secret Moov (*855#)</span>
                  </div>
                </div>
                <span className="bg-[#0062BD] text-white font-black text-xs px-2.5 py-1 rounded">
                  Moov Money
                </span>
              </label>

              {/* Option Kkiapay */}
              <label
                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentProvider === 'kkiapay' ? 'border-emerald-600 bg-emerald-50/50' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentProvider === 'kkiapay'}
                    onChange={() => setPaymentProvider('kkiapay')}
                    className="accent-emerald-600 w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-xs text-gray-900 block">Kkiapay / Carte Bancaire Visa & Mastercard</span>
                    <span className="text-[11px] text-gray-500 block">Agrégateur de paiement multi-opérateurs certifié</span>
                  </div>
                </div>
                <span className="bg-emerald-600 text-white font-black text-xs px-2.5 py-1 rounded">
                  Kkiapay
                </span>
              </label>
            </div>

            {/* Champ numéro pour Mobile Money */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Numéro de compte pour le prélèvement :
              </label>
              <input
                type="tel"
                placeholder={paymentProvider === 'mtn_momo' ? '+229 97 XX XX XX (MTN)' : '+229 95 XX XX XX (Moov)'}
                value={momoNumber}
                onChange={(e) => setMomoNumber(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-[#0062BD] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Récapitulatif et Validation (Droite) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-xs space-y-5 sticky top-24">
            <h3 className="font-heading font-black text-base text-gray-900 pb-3 border-b border-gray-100">
              Votre Commande
            </h3>

            {/* Liste rapide des articles */}
            <div className="space-y-3 max-h-64 overflow-y-auto divide-y divide-gray-100 pr-1">
              {cart.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="pt-3 first:pt-0 flex items-center gap-3">
                  <img
                    src={item.product.images[0]?.url}
                    alt={item.product.name}
                    className="w-12 h-12 object-contain bg-gray-50 rounded-lg border border-gray-200 p-1 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{item.product.name}</p>
                    <p className="text-[11px] text-gray-500">Qté: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-black text-gray-900 font-price">
                    {formatFCFA(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calcul des totaux */}
            <div className="space-y-2 text-xs text-gray-600 pt-3 border-t border-gray-100">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span className="font-bold text-gray-900">{formatFCFA(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Remise promo ({appliedPromo?.code})</span>
                  <span>-{formatFCFA(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Frais de livraison ({city})</span>
                <span className="font-bold text-gray-900">
                  {shippingFee === 0 ? <strong className="text-emerald-600">GRATUITE</strong> : formatFCFA(shippingFee)}
                </span>
              </div>
              <div className="flex justify-between items-baseline text-base font-black text-gray-900 pt-3 border-t border-gray-200">
                <span>Total Net</span>
                <span className="text-xl text-[#0062BD] font-price">{formatFCFA(total)}</span>
              </div>
            </div>

            {/* Bouton de confirmation */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-heading font-black text-xs uppercase tracking-wider py-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Connexion sécurisée en cours...</span>
              ) : (
                <>
                  <Icons.Lock size={16} />
                  <span>Confirmer & Payer ({formatFCFA(total)})</span>
                </>
              )}
            </button>

            <div className="text-[10px] text-gray-500 text-center space-y-1">
              <p>🔒 Protocole SSL 256 bits et signature webhook serveur.</p>
              <p>Numéro de référence généré dès validation.</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
