'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getUserOrdersAction, cancelPendingOrderAction } from '@/actions/orders';
import { formatFCFA, getOrderStatusInfo } from '@/lib/utils';
import { Icons } from '@/components/ui/Icons';

export default function MesCommandesPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    const res = await getUserOrdersAction();
    if (res.success && Array.isArray(res.orders)) {
      setOrders(res.orders);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleCancelOrder = async (orderNumber: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir annuler la commande ${orderNumber} ?`)) {
      return;
    }
    setCancellingId(orderNumber);
    const res = await cancelPendingOrderAction(orderNumber);
    if (res.success) {
      await loadOrders();
    } else {
      alert(res.error || 'Impossible d\'annuler la commande.');
    }
    setCancellingId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <Link href="/" className="hover:text-[#0062BD]">Accueil</Link>
        <span>/</span>
        <Link href="/compte" className="hover:text-[#0062BD]">Mon Compte</Link>
        <span>/</span>
        <span className="text-gray-900 font-bold">Mes Commandes</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-gray-900 tracking-tight">
            Mes Commandes ({orders.length})
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Consultez vos commandes, finalisez vos règlements en attente et suivez vos livraisons en temps réel.
          </p>
        </div>

        <Link
          href="/boutique"
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs px-4 py-2.5 rounded-xl transition-all self-start sm:self-auto inline-flex items-center gap-2"
        >
          <Icons.ShoppingCart size={14} />
          <span>Continuer mes achats</span>
        </Link>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-gray-500">
          <div className="w-8 h-8 border-3 border-[#FED700] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p>Chargement de vos commandes...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-[#E2E5E8] rounded-3xl p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#0062BD] flex items-center justify-center mx-auto mb-4">
            <Icons.ShoppingBag size={32} />
          </div>
          <h3 className="font-heading font-black text-lg text-gray-900 mb-2">
            Vous n'avez passé aucune commande pour le moment
          </h3>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            Vos achats d'iPhones, smartphones Samsung et accessoires certifiés apparaîtront ici dès votre première commande.
          </p>
          <Link
            href="/boutique"
            className="bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-heading font-black text-xs uppercase px-8 py-3.5 rounded-xl inline-block shadow-xs transition-all"
          >
            Explorer la boutique
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => {
            const isPending = ord.status === 'PENDING';
            const statusInfo = getOrderStatusInfo(ord.status);

            return (
              <div
                key={ord.id}
                className={`bg-white border rounded-3xl p-6 shadow-xs transition-all ${
                  isPending ? 'border-amber-300 bg-amber-50/20' : 'border-[#E2E5E8]'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  {/* Détails Commande */}
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-heading font-black text-lg text-gray-900">
                        #{ord.orderNumber}
                      </span>
                      <span className={`text-[11px] font-bold px-3 py-0.5 rounded-full border ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        {new Date(ord.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {isPending && (
                      <div className="bg-amber-100/70 border border-amber-200 text-amber-900 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2">
                        <Icons.AlertCircle size={15} className="text-amber-700 flex-shrink-0" />
                        <span>
                          <strong>Paiement non finalisé</strong> : Vous pouvez régler cette commande maintenant pour déclencher la livraison.
                        </span>
                      </div>
                    )}

                    {/* Liste des articles */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {ord.items.map((item: any, idx: number) => (
                        <span
                          key={idx}
                          className="text-xs bg-gray-100/80 border border-gray-200 px-3 py-1.5 rounded-xl text-gray-800 font-medium"
                        >
                          {item.productName} {item.variantInfo ? `(${item.variantInfo})` : ''} <strong className="text-gray-900">×{item.quantity}</strong>
                        </span>
                      ))}
                    </div>

                    <div className="text-[11px] text-gray-500 flex items-center gap-4">
                      <span>Destination : <strong>{ord.city} ({ord.district})</strong></span>
                      <span>•</span>
                      <span>Passerelle : <strong>{ord.paymentProvider?.toUpperCase()}</strong></span>
                    </div>
                  </div>

                  {/* Actions & Montant */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between w-full lg:w-auto gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-100">
                    <div className="text-left lg:text-right">
                      <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">Montant total</span>
                      <span className="font-heading font-black text-xl text-[#0062BD]">
                        {formatFCFA(ord.totalAmount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      {/* Si la commande est en attente : Bouton Régler maintenant */}
                      {isPending ? (
                        <>
                          <Link
                            href={`/commande/${ord.orderNumber}`}
                            className="flex-1 sm:flex-initial bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-heading font-black text-xs uppercase px-5 py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Icons.CreditCard size={15} />
                            <span>Régler maintenant</span>
                          </Link>
                          <button
                            type="button"
                            disabled={cancellingId === ord.orderNumber}
                            onClick={() => handleCancelOrder(ord.orderNumber)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-3.5 py-3 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                            title="Annuler cette commande"
                          >
                            {cancellingId === ord.orderNumber ? (
                              <div className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Icons.X size={15} />
                            )}
                          </button>
                        </>
                      ) : (
                        <Link
                          href={`/commande/${ord.orderNumber}`}
                          className="flex-1 sm:flex-initial bg-white border border-gray-300 hover:border-[#0062BD] hover:text-[#0062BD] text-gray-800 font-bold text-xs uppercase px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                        >
                          <Icons.Truck size={14} />
                          <span>Suivre le colis</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
