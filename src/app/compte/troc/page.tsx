'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getUserTradeOffersAction,
  clientAcceptCounterOfferAction,
  clientCancelTradeOfferAction,
} from '@/actions/trades';
import { formatFCFA, getTradeStatusInfo, formatComplementText } from '@/lib/utils';
import { Icons } from '@/components/ui/Icons';
import { siteConfig } from '@/lib/site-config';
import { DialogModal } from '@/components/ui/DialogModal';

export default function MesTrocsPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Dialog Modal
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info' | 'success';
    confirmText?: string;
    cancelText?: string;
    isConfirmOnly?: boolean;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
  });

  const loadTrades = async () => {
    setLoading(true);
    const res = await getUserTradeOffersAction();
    if (res.success && Array.isArray(res.offers)) {
      setOffers(res.offers);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTrades();
  }, []);

  // Action : Accepter la contre-proposition
  const handleAcceptCounter = (tradeId: string, model: string) => {
    setDialogState({
      isOpen: true,
      title: 'Accepter la contre-proposition ?',
      message: `Vous êtes sur le point d'accepter la contre-proposition de l'expert pour l'échange de votre ${model}. Votre dossier passera en statut "Accepté" pour convenir du rendez-vous d'échange.`,
      type: 'success',
      confirmText: 'Accepter l\'offre',
      cancelText: 'Réfléchir',
      onConfirm: async () => {
        setDialogState((prev) => ({ ...prev, isOpen: false }));
        setActionLoadingId(tradeId);
        const res = await clientAcceptCounterOfferAction(tradeId);
        setActionLoadingId(null);
        if (res.success) {
          await loadTrades();
        } else {
          setDialogState({
            isOpen: true,
            title: 'Erreur',
            message: res.error || 'Impossible de valider cette offre.',
            type: 'danger',
            isConfirmOnly: true,
            confirmText: 'Fermer',
          });
        }
      },
    });
  };

  // Action : Annuler / Décliner la proposition
  const handleCancelTrade = (tradeId: string, model: string) => {
    setDialogState({
      isOpen: true,
      title: 'Annuler cette proposition de troc ?',
      message: `Êtes-vous sûr de vouloir retirer votre proposition d'échange pour "${model}" ? Cette action clôturera le dossier.`,
      type: 'danger',
      confirmText: 'Oui, annuler',
      cancelText: 'Conserver',
      onConfirm: async () => {
        setDialogState((prev) => ({ ...prev, isOpen: false }));
        setActionLoadingId(tradeId);
        const res = await clientCancelTradeOfferAction(tradeId);
        setActionLoadingId(null);
        if (res.success) {
          await loadTrades();
        } else {
          setDialogState({
            isOpen: true,
            title: 'Erreur',
            message: res.error || 'Impossible d\'annuler la proposition.',
            type: 'danger',
            isConfirmOnly: true,
            confirmText: 'Fermer',
          });
        }
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DialogModal
        {...dialogState}
        onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
      />

      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <Link href="/" className="hover:text-[#0062BD]">Accueil</Link>
        <span>/</span>
        <Link href="/compte" className="hover:text-[#0062BD]">Mon Compte</Link>
        <span>/</span>
        <span className="text-gray-900 font-bold">Mes Propositions de Troc</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading font-black text-2xl text-gray-900 tracking-tight">
            Mes Propositions de Troc / Échange ({offers.length})
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Suivez l'évaluation technique de vos anciens smartphones et concluez vos échanges facilement.
          </p>
        </div>
        <Link
          href="/boutique?trade=true"
          className="bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-heading font-black text-xs uppercase px-5 py-3 rounded-2xl shadow-xs transition-all flex items-center gap-2 self-start"
        >
          <Icons.Plus size={16} />
          <span>Nouveau Troc</span>
        </Link>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-gray-500 bg-white border border-[#E2E5E8] rounded-3xl">
          <div className="w-8 h-8 border-3 border-[#FED700] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-bold">Chargement de vos dossiers de troc...</p>
        </div>
      ) : offers.length === 0 ? (
        <div className="bg-white border border-[#E2E5E8] rounded-3xl p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-[#1D2129] flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <Icons.Repeat size={32} />
          </div>
          <h3 className="font-heading font-bold text-base text-gray-900 mb-2">
            Aucun troc en cours
          </h3>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            Vous possédez un smartphone et souhaitez passer à un modèle supérieur ou équivalent ? Déposez une proposition en quelques clics sur nos articles éligibles.
          </p>
          <Link
            href="/boutique?trade=true"
            className="bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-heading font-black text-xs uppercase px-6 py-3 rounded-xl inline-block shadow-xs"
          >
            Voir les smartphones éligibles au troc
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {offers.map((offer) => {
            const statusInfo = getTradeStatusInfo(offer.status);
            const complementInfo = formatComplementText(offer.complementDirection, offer.cashComplement);
            const counterComplementInfo = offer.counterOfferAmount
              ? formatComplementText(offer.counterComplementDirection || 'CLIENT_TO_STORE', offer.counterOfferAmount)
              : null;

            return (
              <div key={offer.id} className="bg-white border border-[#E2E5E8] rounded-3xl p-6 shadow-xs space-y-5">
                {/* En-tête de la proposition */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-heading font-black text-sm text-gray-900 font-mono bg-gray-100 px-2.5 py-1 rounded-lg">
                      #{offer.id.slice(-8)}
                    </span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusInfo.className}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    Déposée le {new Date(offer.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Comparatif : Appareil proposé VS Appareil ciblé */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                  {/* Appareil proposé par le client */}
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
                    <span className="font-black text-gray-500 uppercase text-[10px] tracking-wider block">
                      Votre Appareil Proposé
                    </span>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-heading font-bold text-sm text-gray-900">{offer.offeredDeviceModel}</p>
                        <span className="inline-block mt-0.5 text-[10px] font-bold bg-gray-200 text-gray-800 px-2 py-0.5 rounded">
                          État : {offer.offeredDeviceCondition === 'OCCASION' ? 'Occasion' : offer.offeredDeviceCondition === 'NEUF_NON_SCELLE' ? 'Comme Neuf' : 'Neuf Scellé'}
                        </span>
                      </div>
                    </div>

                    {offer.offeredDeviceDescription && (
                      <p className="text-gray-600 bg-white p-2.5 rounded-xl border border-gray-200 leading-relaxed italic text-[11px]">
                        "{offer.offeredDeviceDescription}"
                      </p>
                    )}

                    {/* Photos */}
                    {offer.offeredDevicePhotos && offer.offeredDevicePhotos.length > 0 && (
                      <div className="pt-1">
                        <span className="text-[10px] text-gray-500 font-bold block mb-1.5">Photos transmises :</span>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {offer.offeredDevicePhotos.map((url: string, pIdx: number) => (
                            <img
                              key={pIdx}
                              src={url}
                              alt="Photo appareil"
                              className="w-14 h-14 object-cover rounded-xl border border-gray-300 flex-shrink-0 bg-white"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Badge Complément financier proposé */}
                    <div className={`p-2.5 rounded-xl border font-bold text-[11px] ${complementInfo.colorClass}`}>
                      <div className="flex items-center gap-1.5">
                        <Icons.DollarSign size={14} />
                        <span>{complementInfo.badge}</span>
                      </div>
                      <p className="text-[10px] font-normal opacity-90 mt-0.5">{complementInfo.subtext}</p>
                    </div>
                  </div>

                  {/* Appareil visé */}
                  <div className="bg-blue-50/40 p-4 rounded-2xl border border-blue-200 space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="font-black text-[#0062BD] uppercase text-[10px] tracking-wider block mb-1">
                        Appareil Neuf Visé
                      </span>
                      <div className="flex items-center gap-3">
                        {offer.productImage && (
                          <img
                            src={offer.productImage}
                            alt={offer.productName}
                            className="w-14 h-14 object-contain bg-white rounded-xl p-1 border border-blue-200 flex-shrink-0"
                          />
                        )}
                        <div>
                          <p className="font-heading font-bold text-sm text-[#0062BD]">{offer.productName}</p>
                          <p className="text-xs font-black text-gray-900 font-price mt-0.5">
                            Prix catalogue : {formatFCFA(offer.targetProductPrice)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {offer.productSlug && (
                      <Link
                        href={`/produit/${offer.productSlug}`}
                        className="text-[11px] font-bold text-[#0062BD] hover:underline flex items-center gap-1 self-start"
                        target="_blank"
                      >
                        <span>Voir la fiche produit</span>
                        <Icons.ExternalLink size={12} />
                      </Link>
                    )}
                  </div>
                </div>

                {/* 1. Bloc Contre-proposition de l'Admin (Statut COUNTERED) */}
                {offer.status === 'COUNTERED' && (
                  <div className="bg-amber-50 border-2 border-amber-300 p-5 rounded-2xl text-xs text-amber-950 space-y-3 animate-in fade-in">
                    <div className="flex items-center gap-2 font-heading font-black text-amber-900 text-sm">
                      <Icons.Sparkles size={18} className="text-amber-600" />
                      <span>Contre-Proposition de l'Expert {siteConfig.name} :</span>
                    </div>

                    {offer.adminNote && (
                      <p className="bg-white/80 p-3 rounded-xl border border-amber-200 leading-relaxed text-xs">
                        {offer.adminNote}
                      </p>
                    )}

                    {counterComplementInfo && (
                      <div className="bg-white p-3 rounded-xl border border-amber-300 font-bold">
                        <span className="text-[10px] text-amber-800 uppercase block mb-0.5">Complément financier ajusté par l'expert :</span>
                        <p className="text-sm text-amber-950">{counterComplementInfo.badge}</p>
                        <p className="text-[10px] font-normal text-amber-800 mt-0.5">{counterComplementInfo.subtext}</p>
                      </div>
                    )}

                    {/* Actions Client pour la contre-proposition */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                      <button
                        onClick={() => handleAcceptCounter(offer.id, offer.offeredDeviceModel)}
                        disabled={actionLoadingId === offer.id}
                        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-black text-xs uppercase px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Icons.Check size={16} />
                        <span>Accepter la contre-proposition</span>
                      </button>

                      <button
                        onClick={() => handleCancelTrade(offer.id, offer.offeredDeviceModel)}
                        disabled={actionLoadingId === offer.id}
                        className="w-full sm:w-auto bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Icons.X size={14} />
                        <span>Décliner / Annuler</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Bloc Statut ACCEPTED : Instructions de remise et échange */}
                {offer.status === 'ACCEPTED' && (
                  <div className="bg-emerald-50 border-2 border-emerald-300 p-5 rounded-2xl text-xs text-emerald-950 space-y-3 animate-in fade-in">
                    <div className="flex items-center gap-2 font-heading font-black text-emerald-900 text-sm">
                      <Icons.CheckCircle size={18} className="text-emerald-700" />
                      <span>Proposition Validée ! Prochaine étape : Échange Physique</span>
                    </div>

                    <p className="text-xs leading-relaxed text-emerald-900">
                      Félicitations ! Votre dossier d'échange <strong>#{offer.id.slice(-8)}</strong> a été validé. Vous pouvez dès maintenant procéder à l'échange selon votre préférence :
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                      <div className="bg-white p-3 rounded-xl border border-emerald-200">
                        <p className="font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
                          <Icons.MapPin size={14} className="text-emerald-700" />
                          <span>Option 1 : En Boutique Physique</span>
                        </p>
                        <p className="text-gray-600">Passez au showroom TechPhone229 à Cotonou pour faire tester votre téléphone et repartir immédiatement avec votre {offer.productName}.</p>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-emerald-200">
                        <p className="font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
                          <Icons.Truck size={14} className="text-emerald-700" />
                          <span>Option 2 : Coursier à Domicile</span>
                        </p>
                        <p className="text-gray-600">Notre coursier se déplace chez vous à Cotonou/Calavi pour vérifier l'appareil et finaliser la transaction sur place.</p>
                      </div>
                    </div>

                    <div className="pt-1">
                      <a
                        href={`https://wa.me/22997000000?text=${encodeURIComponent(`Bonjour TechPhone229, mon dossier de troc #${offer.id.slice(-8)} (${offer.offeredDeviceModel} contre ${offer.productName}) a été accepté. Je souhaite convenir d'un créneau d'échange.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#1D2129] hover:bg-[#0062BD] text-[#FED700] hover:text-white font-heading font-black text-xs uppercase px-5 py-2.5 rounded-xl shadow-xs transition-all"
                      >
                        <Icons.MessageCircle size={15} />
                        <span>Fixer mon rendez-vous sur WhatsApp</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* 3. Bloc Statut COMPLETED */}
                {offer.status === 'COMPLETED' && (
                  <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl text-xs text-purple-950 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                      <Icons.Award size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-purple-950">Troc Finalisé & Clôturé</p>
                      <p className="text-[11px] text-purple-800">L'échange d'appareils et le règlement éventuel ont été effectués avec succès. Merci pour votre fidélité !</p>
                    </div>
                  </div>
                )}

                {/* Bouton d'annulation si en attente */}
                {offer.status === 'PENDING' && (
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <p className="text-[11px] text-gray-500 italic">
                      Dossier en file d'attente d'expertise technique (délai moyen : 1h à 2h).
                    </p>
                    <button
                      onClick={() => handleCancelTrade(offer.id, offer.offeredDeviceModel)}
                      disabled={actionLoadingId === offer.id}
                      className="text-xs text-red-600 hover:text-red-700 font-bold hover:underline cursor-pointer"
                    >
                      Annuler ma proposition
                    </button>
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
