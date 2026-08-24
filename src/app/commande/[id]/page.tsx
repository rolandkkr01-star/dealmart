'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { getOrderByNumberAction } from '@/actions/orders';
import { verifyOrderPaymentAction, initPendingOrderPaymentAction } from '@/actions/payments';
import { formatFCFA, getOrderStatusInfo } from '@/lib/utils';
import { Icons } from '@/components/ui/Icons';
import { siteConfig } from '@/lib/site-config';

declare global {
  interface Window {
    openKkiapayWidget?: (options: any) => void;
    addSuccessListener?: (callback: (response: any) => void) => void;
    addFailedListener?: (callback: (error: any) => void) => void;
  }
}

export default function OrderTrackingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderNumber = resolvedParams.id;

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const loadOrder = async () => {
    setLoading(true);
    const res = await getOrderByNumberAction(orderNumber);
    if (res.success && res.order) {
      setOrder(res.order);
      setNotFound(false);
    } else {
      setNotFound(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrder();
  }, [orderNumber]);

  // Déclencher le paiement Kkiapay pour une commande en attente
  const handlePayKkiapay = async () => {
    if (!order) return;
    setIsPaying(true);
    setPayError(null);

    const initRes = await initPendingOrderPaymentAction(order.orderNumber, 'kkiapay');
    if (!initRes.success) {
      setPayError(initRes.error || 'Impossible d\'initialiser Kkiapay.');
      setIsPaying(false);
      return;
    }

    if (typeof window !== 'undefined' && window.openKkiapayWidget && initRes.kkiapay?.publicKey) {
      if (window.addSuccessListener) {
        window.addSuccessListener(async (response: any) => {
          const txId = response.transactionId || response.transaction_id || `KKIA-${Date.now()}`;
          const res = await verifyOrderPaymentAction({
            orderNumber: order.orderNumber,
            transactionId: txId,
            provider: 'kkiapay',
          });
          if (res.success) {
            await loadOrder();
          } else {
            setPayError(res.error || 'Erreur lors de la validation du paiement.');
          }
          setIsPaying(false);
        });
      }

      if (window.addFailedListener) {
        window.addFailedListener(() => {
          setIsPaying(false);
          setPayError('Paiement Kkiapay annulé ou refusé.');
        });
      }

      window.openKkiapayWidget({
        amount: initRes.amount,
        key: initRes.kkiapay.publicKey,
        sandbox: initRes.kkiapay.isSandbox,
        phone: order.customerPhone.replace(/[^0-9+]/g, ''),
        email: order.customerEmail || '',
        name: order.customerName,
        data: { orderNumber: order.orderNumber },
      });
    } else {
      // Simulation / Test local
      await verifyOrderPaymentAction({
        orderNumber: order.orderNumber,
        transactionId: `KKIA-SIM-${Date.now().toString().slice(-6)}`,
        provider: 'kkiapay',
      });
      await loadOrder();
      setIsPaying(false);
    }
  };

  // Déclencher le paiement FedaPay pour une commande en attente
  const handlePayFedaPay = async () => {
    if (!order) return;
    setIsPaying(true);
    setPayError(null);

    const initRes = await initPendingOrderPaymentAction(order.orderNumber, 'fedapay');
    if (!initRes.success || !initRes.paymentUrl) {
      setPayError(initRes.error || 'Impossible d\'initialiser FedaPay.');
      setIsPaying(false);
      return;
    }

    window.location.href = initRes.paymentUrl;
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center text-xs text-gray-500">
        <div className="w-8 h-8 border-3 border-[#FED700] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p>Recherche de la commande <strong>{orderNumber}</strong> en base de données...</p>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 text-[#DC3545] flex items-center justify-center mx-auto mb-4">
          <Icons.AlertCircle size={28} />
        </div>
        <h2 className="font-heading font-bold text-xl text-gray-900 mb-2">Commande introuvable</h2>
        <p className="text-xs text-gray-500 mb-6">
          La référence <strong>{orderNumber}</strong> ne correspond à aucune commande enregistrée dans notre système.
        </p>
        <Link
          href="/suivi"
          className="bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-heading font-black text-xs uppercase px-6 py-3 rounded-xl inline-block shadow-sm"
        >
          Nouvelle recherche
        </Link>
      </div>
    );
  }

  const isPending = order.status === 'PENDING';
  const statusInfo = getOrderStatusInfo(order.status);

  return (
    <>
      <Script src="https://cdn.kkiapay.me/k.js" strategy="lazyOnload" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* En-tête de la commande */}
        <div className="bg-white border border-[#E2E5E8] rounded-3xl p-6 sm:p-8 shadow-xs mb-8 text-center">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs ${
              isPending ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {isPending ? <Icons.AlertCircle size={32} /> : <Icons.ShieldCheck size={32} />}
          </div>

          <span className="text-[11px] font-bold text-[#0062BD] uppercase tracking-widest block mb-1">
            {siteConfig.name} • Suivi & Facture Sécurisée
          </span>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-gray-900 mb-2 tracking-tight">
            Commande de {order.customerName}
          </h1>

          <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-xl text-xs font-mono font-bold text-gray-800 my-2">
            <span>Référence :</span>
            <span className="text-[#0062BD] font-black">{order.orderNumber}</span>
          </div>
        </div>

        {/* BLOC DE PAIEMENT EN ATTENTE SI PENDING */}
        {isPending && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 sm:p-8 mb-8 shadow-xs">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center flex-shrink-0">
                <Icons.CreditCard size={20} />
              </div>
              <div>
                <h3 className="font-heading font-black text-lg text-gray-900">
                  Règlement en attente ({formatFCFA(order.totalAmount)})
                </h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Votre commande est enregistrée dans notre système. Pour valider l'expédition et recevoir votre colis, veuillez procéder au règlement via l'une de nos passerelles sécurisées :
                </p>
              </div>
            </div>

            {payError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs mb-4">
                {payError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <button
                type="button"
                onClick={handlePayKkiapay}
                disabled={isPaying}
                className="bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-heading font-black text-xs uppercase p-4 rounded-2xl shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
              >
                <img src="/images/gateways/kkiapay.svg" alt="Kkiapay" className="h-5 w-auto object-contain" />
                <span>Payer avec Kkiapay</span>
              </button>

              <button
                type="button"
                onClick={handlePayFedaPay}
                disabled={isPaying}
                className="bg-[#0062BD] hover:bg-[#00519E] text-white font-heading font-black text-xs uppercase p-4 rounded-2xl shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
              >
                <img src="/images/gateways/fedapay.svg" alt="FedaPay" className="h-5 w-auto object-contain brightness-0 invert" />
                <span>Payer avec FedaPay</span>
              </button>
            </div>
          </div>
        )}

        {/* Suivi en Direct (Timeline) */}
        <div className="bg-white border border-[#E2E5E8] rounded-3xl p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
            <h3 className="font-heading font-black text-base text-gray-900 flex items-center gap-2">
              <Icons.Truck size={18} className="text-[#0062BD]" />
              <span>Statut de Livraison en Direct</span>
            </h3>
            <span className={`text-xs font-black uppercase px-3.5 py-1 rounded-full border ${statusInfo.className}`}>
              {statusInfo.label}
            </span>
          </div>

          {/* Timeline des étapes */}
          <div className="space-y-4 relative pl-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
            {order.statusHistory.map((ev: any, idx: number) => (
              <div key={ev.id} className="relative">
                <div
                  className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                    idx === 0 ? 'bg-[#0062BD] ring-4 ring-blue-100' : 'bg-gray-400'
                  }`}
                />
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-xs text-gray-900">{ev.status}</span>
                    <span className="text-[10px] text-gray-500">
                      {new Date(ev.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{ev.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Détails Commande & Adresse */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Adresse de livraison */}
          <div className="bg-white border border-[#E2E5E8] rounded-3xl p-6 shadow-xs text-xs space-y-2">
            <h4 className="font-heading font-bold text-sm text-gray-900 uppercase tracking-wider mb-3">
              Lieu de Livraison au Bénin
            </h4>
            <p><strong>Destinataire :</strong> {order.customerName}</p>
            <p><strong>Téléphone :</strong> {order.customerPhone}</p>
            {order.customerEmail && <p><strong>Email :</strong> {order.customerEmail}</p>}
            <p><strong>Ville / Quartier :</strong> {order.city} {order.district ? `(${order.district})` : ''}</p>
            <p><strong>Repère précis :</strong> {order.streetDetails}</p>
            {order.notes && <p><strong>Instructions coursier :</strong> {order.notes}</p>}
          </div>

          {/* Récapitulatif Paiement */}
          <div className="bg-white border border-[#E2E5E8] rounded-3xl p-6 shadow-xs text-xs space-y-2">
            <h4 className="font-heading font-bold text-sm text-gray-900 uppercase tracking-wider mb-3">
              Paiement & Facturation
            </h4>
            <div className="flex justify-between">
              <span className="text-gray-500">Passerelle choisie :</span>
              <span className="font-bold uppercase">{order.paymentProvider}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Référence transaction :</span>
              <span className="font-mono text-gray-700">{order.paymentRef || 'En attente'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Statut du paiement :</span>
              <span className={`font-bold ${isPending ? 'text-amber-600' : 'text-emerald-600'}`}>
                {isPending ? '⏳ En attente de règlement' : '✓ Réglé avec succès'}
              </span>
            </div>
            <div className="flex justify-between pt-3 border-t border-gray-100">
              <span className="font-bold text-gray-900">Total commande :</span>
              <span className="font-price font-black text-sm text-[#0062BD]">
                {formatFCFA(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Articles de la commande */}
        <div className="bg-white border border-[#E2E5E8] rounded-3xl p-6 shadow-xs">
          <h4 className="font-heading font-bold text-sm text-gray-900 uppercase tracking-wider mb-4">
            Articles commandés ({order.items.length})
          </h4>
          <div className="divide-y divide-gray-100">
            {order.items.map((item: any) => (
              <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 p-1 flex items-center justify-center flex-shrink-0">
                    <img
                      src={item.productImage || '/images/placeholder.webp'}
                      alt={item.productName}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-gray-900 block">{item.productName}</span>
                    {item.variantInfo && <span className="text-[11px] text-gray-500">{item.variantInfo}</span>}
                    <span className="text-[11px] text-gray-400 block">Qté : {item.quantity}</span>
                  </div>
                </div>
                <span className="font-price font-bold text-xs text-gray-900">
                  {formatFCFA(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
