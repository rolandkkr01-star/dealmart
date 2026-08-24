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
import { Pagination } from '@/components/ui/Pagination';

export default function MesTrocsPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Filtres & Recherche
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

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

  const filteredOffers = React.useMemo(() => {
    return offers.filter((offer) => {
      if (statusFilter !== 'ALL' && offer.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchProduct = offer.productName?.toLowerCase().includes(q);
        const matchDevice = offer.offeredDeviceModel?.toLowerCase().includes(q);
        const matchDesc = offer.offeredDeviceDescription?.toLowerCase().includes(q);
        if (!matchProduct && !matchDevice && !matchDesc) return false;
      }
      return true;
    });
  }, [offers, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredOffers.length / pageSize);
  const paginatedOffers = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOffers.slice(start, start + pageSize);
  }, [filteredOffers, currentPage, pageSize]);

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

      {/* Barre de Recherche & Filtres par statut */}
      {offers.length > 0 && (
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-4 mb-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Rechercher appareil ou modèle visé..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-[#F8F9FA] border border-[#E2E5E8] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0062BD]"
            />
            <Icons.Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {[
              { label: 'Tous', value: 'ALL' },
              { label: 'En attente', value: 'PENDING' },
              { label: 'Contre-offres', value: 'COUNTERED' },
              { label: 'Acceptés', value: 'ACCEPTED' },
              { label: 'Clôturés', value: 'COMPLETED' },
              { label: 'Refusés', value: 'REJECTED' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setStatusFilter(tab.value);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === tab.value
                    ? 'bg-[#1D2129] text-[#FED700] shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

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
      ) : filteredOffers.length === 0 ? (
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-12 text-center">
          <p className="text-xs text-gray-500 mb-4">Aucun dossier de troc ne correspond à ces critères.</p>
          <button
            onClick={() => {
              setStatusFilter('ALL');
              setSearchQuery('');
              setCurrentPage(1);
            }}
            className="bg-[#FED700] text-[#1D2129] font-heading font-black text-xs uppercase px-6 py-2.5 rounded-xl"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {paginatedOffers.map((offer) => {
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
                      <div>
                        <p className="font-heading font-bold text-sm text-gray-900">{offer.offeredDeviceModel}</p>
                        <span className="inline-block mt-0.5 text-[10px] font-bold bg-gray-200 text-gray-800 px-2 py-0.5 rounded">
                          État : {offer.offeredDeviceCondition === 'OCCASION' ? 'Occasion' : offer.offeredDeviceCondition === 'NEUF_NON_SCELLE' ? 'Comme Neuf' : 'Neuf Scellé'}
                        </span>
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
                    <div className="bg-amber-50 border-2 border-amber-300 p-5 rounded-2xl text-xs text-amber-950 space-y-4 animate-in fade-in">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Icons.Sparkles size={18} className="text-amber-600" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <h4 className="font-heading font-black text-sm text-amber-950">
                            Contre-Proposition de l'Expert {siteConfig.name}
                          </h4>
                          {offer.adminNote && (
                            <p className="bg-white/90 p-3 rounded-xl border border-amber-200 leading-relaxed text-xs text-amber-900">
                              {offer.adminNote}
                            </p>
                          )}
                          {counterComplementInfo && (
                            <div className="bg-white p-3 rounded-xl border border-amber-300 font-bold">
                              <span className="text-[10px] text-amber-800 uppercase block mb-0.5">Complément financier ajusté :</span>
                              <p className="text-sm text-amber-950 font-black">{counterComplementInfo.badge}</p>
                              <p className="text-[10px] font-normal text-amber-800 mt-0.5">{counterComplementInfo.subtext}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions Client pour la contre-proposition */}
                      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-amber-200">
                        <button
                          onClick={() => handleAcceptCounter(offer.id, offer.offeredDeviceModel)}
                          disabled={actionLoadingId === offer.id}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-black text-xs uppercase px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <Icons.CheckCircle size={15} />
                          <span>Accepter la contre-offre</span>
                        </button>

                        <button
                          onClick={() => handleCancelTrade(offer.id, offer.offeredDeviceModel)}
                          disabled={actionLoadingId === offer.id}
                          className="bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                        >
                          Décliner la contre-offre
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 2. Bloc Statut ACCEPTED : Modalités d'échange et RDV */}
                  {offer.status === 'ACCEPTED' && (
                    <div className="bg-emerald-50 border border-emerald-300 p-5 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2 text-emerald-900 font-heading font-black text-sm">
                        <Icons.CheckCircle size={18} className="text-emerald-700" />
                        <span>Offre de troc validée ! Prochaine étape : échange physique</span>
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
                          <p className="text-gray-600">Passez au showroom {siteConfig.name} à {siteConfig.city} pour faire tester votre téléphone et repartir immédiatement avec votre {offer.productName}.</p>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-emerald-200">
                          <p className="font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
                            <Icons.Truck size={14} className="text-emerald-700" />
                            <span>Option 2 : Coursier à Domicile</span>
                          </p>
                          <p className="text-gray-600">Notre coursier se déplace chez vous à {siteConfig.city} pour vérifier l'appareil et finaliser la transaction sur place.</p>
                        </div>
                      </div>

                      <div className="pt-1">
                        <a
                          href={`https://wa.me/${siteConfig.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${siteConfig.name}, mon dossier de troc #${offer.id.slice(-8)} (${offer.offeredDeviceModel} contre ${offer.productName}) a été accepté. Je souhaite convenir d'un créneau d'échange.`)}`}
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

          {/* Pagination */}
          <div className="mt-8 bg-white border border-[#E2E5E8] rounded-2xl p-2 shadow-xs">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => {
                setCurrentPage(p);
                window.scrollTo({ top: 120, behavior: 'smooth' });
              }}
              totalItems={filteredOffers.length}
              itemsPerPage={pageSize}
              onItemsPerPageChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
              pageSizeOptions={[5, 10, 20]}
              itemLabel="trocs"
            />
          </div>
        </>
      )}
    </div>
  );
}
