'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getUserTradeOffersAction } from '@/actions/trades';
import { formatFCFA, getTradeStatusInfo } from '@/lib/utils';
import { Icons } from '@/components/ui/Icons';
import { siteConfig } from '@/lib/site-config';

export default function MesTrocsPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrades() {
      setLoading(true);
      const res = await getUserTradeOffersAction();
      if (res.success && Array.isArray(res.offers)) {
        setOffers(res.offers);
      }
      setLoading(false);
    }
    loadTrades();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <Link href="/" className="hover:text-[#0062BD]">Accueil</Link>
        <span>/</span>
        <Link href="/compte" className="hover:text-[#0062BD]">Mon Compte</Link>
        <span>/</span>
        <span className="text-gray-900 font-bold">Mes Propositions de Troc</span>
      </nav>

      <div className="flex justify-between items-center mb-6">
        <h1 className="font-heading font-black text-2xl text-gray-900 tracking-tight">
          Mes Propositions de Troc / Échange ({offers.length})
        </h1>
        <Link
          href="/boutique?trade=true"
          className="bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-heading font-black text-xs uppercase px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2"
        >
          <Icons.Plus size={14} />
          <span>Nouveau Troc</span>
        </Link>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-gray-500">
          <div className="w-8 h-8 border-3 border-[#FED700] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p>Chargement de vos propositions de troc...</p>
        </div>
      ) : offers.length === 0 ? (
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-full bg-amber-50 text-[#1D2129] flex items-center justify-center mx-auto mb-4">
            <Icons.Repeat size={28} />
          </div>
          <h3 className="font-heading font-bold text-base text-gray-900 mb-2">
            Aucune proposition de troc en cours
          </h3>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            Vous avez un ancien smartphone et souhaitez l'échanger contre un modèle plus récent ? Rendez-vous sur nos fiches produits éligibles pour déposer votre proposition.
          </p>
          <Link
            href="/boutique?trade=true"
            className="bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-heading font-black text-xs uppercase px-6 py-3 rounded-xl inline-block shadow-xs"
          >
            Découvrir les articles en troc
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {offers.map((offer) => {
            const statusInfo = getTradeStatusInfo(offer.status);
            return (
              <div key={offer.id} className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-heading font-black text-sm text-gray-900 font-mono">#{offer.id.slice(-8)}</span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.className}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    Déposée le {new Date(offer.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <span className="font-bold text-gray-500 uppercase text-[10px] block mb-1">Votre Appareil Proposé</span>
                    <p className="font-bold text-sm text-gray-900 mb-1">{offer.offeredDeviceModel}</p>
                    <p className="text-gray-600 mb-2">{offer.offeredDeviceDescription}</p>
                    {offer.cashComplement && (
                      <p className="font-bold text-emerald-700">
                        Complément proposé : +{formatFCFA(offer.cashComplement)}
                      </p>
                    )}
                  </div>

                  <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200">
                    <span className="font-bold text-gray-500 uppercase text-[10px] block mb-1">Appareil Neuf Visé</span>
                    <p className="font-bold text-sm text-[#0062BD] mb-1">{offer.productName}</p>
                    <p className="text-gray-600">Valeur catalogue : {formatFCFA(offer.targetProductPrice)}</p>
                  </div>
                </div>

                {offer.adminNote && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-xs text-blue-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-blue-950">
                      <Icons.Sparkles size={14} className="text-[#0062BD]" />
                      <span>Réponse de l'expert {siteConfig.name} :</span>
                    </div>
                    <p className="leading-relaxed">{offer.adminNote}</p>
                    {offer.counterOfferAmount && (
                      <p className="font-bold text-blue-950 pt-1">
                        Complément réajusté : {formatFCFA(offer.counterOfferAmount)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
