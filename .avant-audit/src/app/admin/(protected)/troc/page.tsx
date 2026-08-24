'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAdminTradeOffersAction, updateTradeStatusAction } from '@/actions/trades';
import { formatFCFA, getTradeStatusInfo } from '@/lib/utils';
import { Icons } from '@/components/ui/Icons';
import { TradeOfferStatus } from '@/types';

export default function AdminTrocPage() {
  const [tradeOffers, setTradeOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [counterAmountInput, setCounterAmountInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOffers = async () => {
    setLoading(true);
    const res = await getAdminTradeOffersAction();
    if (res.success && Array.isArray(res.offers)) {
      setTradeOffers(res.offers);
      if (!selectedOfferId && res.offers.length > 0) {
        setSelectedOfferId(res.offers[0].id);
        setAdminNoteInput(res.offers[0].adminNote || '');
        setCounterAmountInput(res.offers[0].counterOfferAmount?.toString() || '');
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const selectedOffer = tradeOffers.find((t) => t.id === selectedOfferId);

  const handleAction = async (id: string, status: TradeOfferStatus) => {
    setIsSubmitting(true);
    const res = await updateTradeStatusAction({
      tradeId: id,
      status,
      adminNote: adminNoteInput || undefined,
      counterOfferAmount: counterAmountInput ? parseInt(counterAmountInput, 10) : undefined,
    });
    if (res.success) {
      await fetchOffers();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <Link href="/admin" className="hover:text-[#0062BD]">Administration</Link>
        <span>/</span>
        <span className="text-gray-900 font-bold">Gestion des Demandes de Troc</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading font-black text-2xl text-gray-900 tracking-tight">
            Propositions de Troc & Échange ({tradeOffers.length})
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Examen technique des appareils soumis par les clients, estimation et contre-propositions.
          </p>
        </div>

        <button
          onClick={fetchOffers}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer self-start"
        >
          <Icons.Repeat size={14} />
          <span>Actualiser</span>
        </button>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-gray-500 bg-white border border-[#E2E5E8] rounded-2xl">
          <div className="w-8 h-8 border-3 border-[#FED700] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p>Chargement des demandes de troc depuis la base de données...</p>
        </div>
      ) : tradeOffers.length === 0 ? (
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-16 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-3">
            <Icons.Repeat size={28} />
          </div>
          <h3 className="font-heading font-bold text-base text-gray-900 mb-1">
            Aucune proposition de troc en attente
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Dès que des visiteurs déposeront une demande d'échange d'appareil sur une fiche produit éligible, elles apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Liste des offres (Gauche) */}
          <div className="lg:col-span-6 space-y-4">
            {tradeOffers.map((offer) => {
              const statusInfo = getTradeStatusInfo(offer.status);
              const isSelected = offer.id === selectedOfferId;
              return (
                <div
                  key={offer.id}
                  onClick={() => {
                    setSelectedOfferId(offer.id);
                    setAdminNoteInput(offer.adminNote || '');
                    setCounterAmountInput(offer.counterOfferAmount?.toString() || '');
                  }}
                  className={`bg-white border-2 rounded-2xl p-5 shadow-xs transition-all cursor-pointer ${
                    isSelected ? 'border-[#0062BD] bg-blue-50/20' : 'border-[#E2E5E8] hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-black text-xs text-gray-900 font-mono">#{offer.id.slice(-8)}</span>
                      <span className="text-xs font-bold text-gray-700">• {offer.customerName}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusInfo.className}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-gray-700">
                    <p><strong>Appareil proposé :</strong> {offer.offeredDeviceModel} ({offer.offeredDeviceCondition})</p>
                    <p><strong>Article visé :</strong> <span className="text-[#0062BD] font-bold">{offer.productName}</span></p>
                    {offer.cashComplement && (
                      <p className="text-emerald-700 font-bold">Complément client : +{formatFCFA(offer.cashComplement)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Panneau d'inspection et d'action (Droite) */}
          <div className="lg:col-span-6">
            {selectedOffer ? (
              <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-xs space-y-5 sticky top-24">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="font-heading font-black text-base text-gray-900">
                    Examen Technique #{selectedOffer.id.slice(-8)}
                  </h3>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded border ${getTradeStatusInfo(selectedOffer.status).className}`}>
                    {getTradeStatusInfo(selectedOffer.status).label}
                  </span>
                </div>

                {/* Coordonnées client */}
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs space-y-1">
                  <p><strong>Client :</strong> {selectedOffer.customerName}</p>
                  <p><strong>Téléphone / WhatsApp :</strong> <a href={`tel:${selectedOffer.customerPhone}`} className="text-[#0062BD] font-bold">{selectedOffer.customerPhone}</a></p>
                  <p><strong>Localisation :</strong> {selectedOffer.customerCity}</p>
                </div>

                {/* Détails appareil proposé */}
                <div className="space-y-2 text-xs">
                  <span className="font-bold text-gray-700 uppercase tracking-wider text-[11px] block">
                    Description de l'appareil à échanger
                  </span>
                  <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-200">
                    <p className="font-bold text-gray-900 mb-1">{selectedOffer.offeredDeviceModel} ({selectedOffer.offeredDeviceCondition})</p>
                    <p className="text-gray-700">{selectedOffer.offeredDeviceDescription}</p>
                  </div>
                </div>

                {/* Formulaire d'action admin */}
                <div className="space-y-4 pt-3 border-t border-gray-100 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Note technique / Réponse au client
                    </label>
                    <textarea
                      rows={3}
                      value={adminNoteInput}
                      onChange={(e) => setAdminNoteInput(e.target.value)}
                      placeholder="Ex: Appareil estimé à 280 000 FCFA après revue. Complément suggéré..."
                      className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#0062BD] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Montant du complément réajusté (FCFA) - Optionnel
                    </label>
                    <input
                      type="number"
                      value={counterAmountInput}
                      onChange={(e) => setCounterAmountInput(e.target.value)}
                      placeholder="Ex: 400000"
                      className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#0062BD] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <button
                      disabled={isSubmitting}
                      onClick={() => handleAction(selectedOffer.id, 'ACCEPTED')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-center transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Accepter
                    </button>
                    <button
                      disabled={isSubmitting}
                      onClick={() => handleAction(selectedOffer.id, 'COUNTERED')}
                      className="bg-[#0062BD] hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-center transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Contre-proposer
                    </button>
                    <button
                      disabled={isSubmitting}
                      onClick={() => handleAction(selectedOffer.id, 'REJECTED')}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-center transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Refuser
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
