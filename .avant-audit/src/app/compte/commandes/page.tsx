'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getUserOrdersAction } from '@/actions/orders';
import { formatFCFA, getOrderStatusInfo } from '@/lib/utils';
import { Icons } from '@/components/ui/Icons';

export default function MesCommandesPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      const res = await getUserOrdersAction();
      if (res.success && Array.isArray(res.orders)) {
        setOrders(res.orders);
      }
      setLoading(false);
    }
    loadOrders();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <Link href="/" className="hover:text-[#0062BD]">Accueil</Link>
        <span>/</span>
        <Link href="/compte" className="hover:text-[#0062BD]">Mon Compte</Link>
        <span>/</span>
        <span className="text-gray-900 font-bold">Mes Commandes</span>
      </nav>

      <h1 className="font-heading font-black text-2xl text-gray-900 mb-6 tracking-tight">
        Historique de mes Commandes ({orders.length})
      </h1>

      {loading ? (
        <div className="p-16 text-center text-xs text-gray-500">
          <div className="w-8 h-8 border-3 border-[#FED700] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p>Chargement de vos commandes...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-[#0062BD] flex items-center justify-center mx-auto mb-4">
            <Icons.ShoppingBag size={28} />
          </div>
          <h3 className="font-heading font-bold text-base text-gray-900 mb-2">
            Vous n'avez passé aucune commande pour le moment
          </h3>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            Vos futurs achats d'iPhones, smartphones Samsung et accessoires apparaîtront ici avec leur suivi de livraison en temps réel.
          </p>
          <Link
            href="/boutique"
            className="bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-heading font-black text-xs uppercase px-6 py-3 rounded-xl inline-block shadow-xs"
          >
            Explorer la boutique
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => {
            const statusInfo = getOrderStatusInfo(ord.status);
            return (
              <div key={ord.id} className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-heading font-black text-base text-gray-900 font-price">
                      {ord.orderNumber}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.className}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Commandée le {new Date(ord.createdAt).toLocaleDateString('fr-FR')} • Paiement : {ord.paymentProvider.toUpperCase()}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {ord.items.map((item: any, idx: number) => (
                      <span key={idx} className="text-xs bg-gray-100 px-2.5 py-1 rounded-md text-gray-700 font-medium">
                        {item.productName} (x{item.quantity})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-gray-500 block uppercase">Montant total</span>
                    <span className="font-heading font-black text-base text-[#0062BD] font-price">
                      {formatFCFA(ord.totalAmount)}
                    </span>
                  </div>

                  <Link
                    href={`/commande/${ord.orderNumber}`}
                    className="bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-bold text-xs uppercase px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <Icons.Truck size={14} />
                    <span>Suivre</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
