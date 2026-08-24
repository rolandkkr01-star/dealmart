'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getAdminTradeOffersAction,
  updateTradeStatusAction,
  adminCompleteTradeAction,
} from '@/actions/trades';
import { formatFCFA, getTradeStatusInfo, formatComplementText } from '@/lib/utils';
import { Icons } from '@/components/ui/Icons';
import { TradeOfferStatus, TradeComplementDirection } from '@/types';
import { DialogModal } from '@/components/ui/DialogModal';

export default function AdminTrocPage() {
  const [tradeOffers, setTradeOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Formulaire d'action admin
  const [actionType, setActionType] = useState<'ACCEPT' | 'COUNTER' | 'REJECT' | 'COMPLETE'>('ACCEPT');
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [counterDirection, setCounterDirection] = useState<TradeComplementDirection>('CLIENT_TO_STORE');
  const [counterAmountInput, setCounterAmountInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lightbox photo
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

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

  const fetchOffers = async () => {
    setLoading(true);
    const res = await getAdminTradeOffersAction();
    if (res.success && Array.isArray(res.offers)) {
      setTradeOffers(res.offers);
      if (!selectedOfferId && res.offers.length > 0) {
        selectOffer(res.offers[0]);
      } else if (selectedOfferId) {
        const found = res.offers.find((o) => o.id === selectedOfferId);
        if (found) selectOffer(found);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const selectOffer = (offer: any) => {
    setSelectedOfferId(offer.id);
    setAdminNoteInput(offer.adminNote || '');
    setCounterAmountInput(offer.counterOfferAmount?.toString() || '');
    setCounterDirection(offer.counterComplementDirection || offer.complementDirection || 'CLIENT_TO_STORE');
  };

  const selectedOffer = tradeOffers.find((t) => t.id === selectedOfferId);

  const filteredOffers = tradeOffers.filter((off) => {
    if (filterStatus === 'ALL') return true;
    return off.status === filterStatus;
  });

  const handleApplyAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffer) return;

    if (actionType === 'COUNTER' && (!counterAmountInput || parseInt(counterAmountInput, 10) <= 0)) {
      setDialogState({
        isOpen: true,
        title: 'Montant requis',
        message: 'Veuillez renseigner le montant en FCFA de votre contre-proposition.',
        type: 'warning',
        isConfirmOnly: true,
        confirmText: 'Compris',
      });
      return;
    }

    setIsSubmitting(true);

    if (actionType === 'COMPLETE') {
      const res = await adminCompleteTradeAction(selectedOffer.id, adminNoteInput);
      setIsSubmitting(false);
      if (res.success) {
        await fetchOffers();
        setDialogState({
          isOpen: true,
          title: 'Troc Finalisé',
          message: `Le troc #${selectedOffer.id.slice(-8)} a été marqué comme clôturé avec succès.`,
          type: 'success',
          isConfirmOnly: true,
          confirmText: 'Parfait',
        });
      } else {
        setDialogState({
          isOpen: true,
          title: 'Erreur',
          message: res.error || 'Impossible de clôturer le troc.',
          type: 'danger',
          isConfirmOnly: true,
          confirmText: 'Fermer',
        });
      }
      return;
    }

    let nextStatus: TradeOfferStatus = 'PENDING';
    if (actionType === 'ACCEPT') nextStatus = 'ACCEPTED';
    if (actionType === 'COUNTER') nextStatus = 'COUNTERED';
    if (actionType === 'REJECT') nextStatus = 'REJECTED';

    const res = await updateTradeStatusAction({
      tradeId: selectedOffer.id,
      status: nextStatus,
      adminNote: adminNoteInput || undefined,
      counterComplementDirection: actionType === 'COUNTER' ? counterDirection : undefined,
      counterOfferAmount: actionType === 'COUNTER' && counterAmountInput ? parseInt(counterAmountInput, 10) : undefined,
    });

    setIsSubmitting(false);

    if (res.success) {
      await fetchOffers();
      setDialogState({
        isOpen: true,
        title: 'Statut mis à jour',
        message: `La proposition #${selectedOffer.id.slice(-8)} est désormais "${getTradeStatusInfo(nextStatus).label}".`,
        type: 'success',
        isConfirmOnly: true,
        confirmText: 'Continuer',
      });
    } else {
      setDialogState({
        isOpen: true,
        title: 'Erreur',
        message: res.error || 'Erreur lors de la mise à jour.',
        type: 'danger',
        isConfirmOnly: true,
        confirmText: 'Fermer',
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <DialogModal
        {...dialogState}
        onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Modal Zoom Photo */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewPhoto(null)}
        >
          <div className="relative max-w-2xl w-full bg-transparent">
            <img src={previewPhoto} alt="Photo agrandie" className="w-full max-h-[85vh] object-contain rounded-2xl" />
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-2 hover:bg-black"
            >
              <Icons.X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <Link href="/admin" className="hover:text-[#0062BD]">Administration</Link>
        <span>/</span>
        <span className="text-gray-900 font-bold">Gestion des Demandes de Troc</span>
      </nav>

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#FED700] text-[#1D2129] px-2.5 py-0.5 rounded">
              Module Troc & Reprise
            </span>
            <span className="text-xs text-gray-500 font-bold">
              {tradeOffers.length} dossier{tradeOffers.length > 1 ? 's' : ''} au total
            </span>
          </div>
          <h1 className="font-heading font-black text-2xl text-gray-900">
            Propositions de Troc & Échanges
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Examinez les appareils soumis, validez les compléments financiers et gérez les contre-propositions.
          </p>
        </div>

        <button
          onClick={fetchOffers}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-center"
        >
          <Icons.Repeat size={14} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Filtres par statut */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'ALL', label: 'Toutes les demandes' },
          { id: 'PENDING', label: 'En attente' },
          { id: 'COUNTERED', label: 'Contre-propositions' },
          { id: 'ACCEPTED', label: 'Acceptées' },
          { id: 'COMPLETED', label: 'Finalisées' },
          { id: 'REJECTED', label: 'Non retenues' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterStatus(f.id)}
            className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              filterStatus === f.id
                ? 'bg-[#1D2129] text-[#FED700]'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {f.label} ({tradeOffers.filter((o) => f.id === 'ALL' || o.status === f.id).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-gray-500 bg-white border border-[#E2E5E8] rounded-3xl">
          <div className="w-8 h-8 border-3 border-[#FED700] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-bold">Chargement des dossiers de troc...</p>
        </div>
      ) : tradeOffers.length === 0 ? (
        <div className="bg-white border border-[#E2E5E8] rounded-3xl p-16 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-3">
            <Icons.Repeat size={28} />
          </div>
          <h3 className="font-heading font-bold text-base text-gray-900 mb-1">
            Aucune proposition de troc en base
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Les propositions soumises par les clients depuis les fiches produits éligibles s'afficheront ici.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Liste des offres (Gauche - 5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {filteredOffers.map((offer) => {
              const statusInfo = getTradeStatusInfo(offer.status);
              const complementInfo = formatComplementText(offer.complementDirection, offer.cashComplement);
              const isSelected = offer.id === selectedOfferId;

              return (
                <div
                  key={offer.id}
                  onClick={() => selectOffer(offer)}
                  className={`bg-white border-2 rounded-2xl p-4 shadow-xs transition-all cursor-pointer ${
                    isSelected ? 'border-[#0062BD] bg-blue-50/20' : 'border-[#E2E5E8] hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-black text-xs text-gray-900 font-mono">
                        #{offer.id.slice(-8)}
                      </span>
                      <span className="text-xs font-bold text-gray-700 truncate max-w-[140px]">
                        {offer.customerName}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.className}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-gray-700">
                    <p className="truncate">
                      <strong>Proposé :</strong> {offer.offeredDeviceModel} ({offer.offeredDeviceCondition})
                    </p>
                    <p className="truncate">
                      <strong>Ciblé :</strong> <span className="text-[#0062BD] font-bold">{offer.productName}</span>
                    </p>
                    <div className="pt-1">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${complementInfo.colorClass}`}>
                        {complementInfo.badge}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Détail & Actions d'Examen (Droite - 7 cols) */}
          <div className="lg:col-span-7">
            {selectedOffer ? (
              <div className="bg-white border border-[#E2E5E8] rounded-3xl p-6 shadow-xs space-y-6">
                {/* En-tête du dossier */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-heading font-black text-sm text-gray-900 font-mono bg-gray-100 px-2 py-0.5 rounded">
                        Dossier #{selectedOffer.id.slice(-8)}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getTradeStatusInfo(selectedOffer.status).className}`}>
                        {getTradeStatusInfo(selectedOffer.status).label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Reçu le {new Date(selectedOffer.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* Bouton Contact WhatsApp Direct */}
                  <a
                    href={`https://wa.me/${selectedOffer.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${selectedOffer.customerName}, concernant votre demande de troc #${selectedOffer.id.slice(-8)} sur TechPhone229...`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors self-start cursor-pointer shadow-xs"
                  >
                    <Icons.MessageCircle size={14} />
                    <span>Contacter sur WhatsApp</span>
                  </a>
                </div>

                {/* Coordonnées Client */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase block">Client</span>
                    <p className="font-bold text-gray-900">{selectedOffer.customerName}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase block">Téléphone / Ville</span>
                    <p className="font-bold text-gray-900">{selectedOffer.customerPhone} ({selectedOffer.customerCity})</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase block">Email</span>
                    <p className="font-bold text-gray-900 truncate">{selectedOffer.customerEmail || 'Non renseigné'}</p>
                  </div>
                </div>

                {/* Détails Appareil Proposé VS Visé */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Appareil proposé */}
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
                    <span className="text-[10px] font-black uppercase text-gray-500 block">Appareil Client Proposé</span>
                    <p className="font-heading font-bold text-sm text-gray-900">{selectedOffer.offeredDeviceModel}</p>
                    <span className="inline-block text-[10px] font-bold bg-gray-200 text-gray-800 px-2 py-0.5 rounded">
                      État : {selectedOffer.offeredDeviceCondition}
                    </span>

                    {selectedOffer.offeredDeviceDescription && (
                      <p className="text-gray-700 bg-white p-2.5 rounded-xl border border-gray-200 italic leading-relaxed text-[11px]">
                        "{selectedOffer.offeredDeviceDescription}"
                      </p>
                    )}

                    {/* Photos envoyées par le client */}
                    {selectedOffer.offeredDevicePhotos && selectedOffer.offeredDevicePhotos.length > 0 ? (
                      <div className="pt-2">
                        <span className="text-[10px] text-gray-500 font-bold block mb-1">Photos (cliquer pour agrandir) :</span>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {selectedOffer.offeredDevicePhotos.map((url: string, idx: number) => (
                            <img
                              key={idx}
                              src={url}
                              alt="Photo"
                              onClick={() => setPreviewPhoto(url)}
                              className="w-16 h-16 object-cover rounded-xl border border-gray-300 bg-white cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-gray-400 italic">Aucune photo jointe.</p>
                    )}

                    {/* Complément proposé par le client */}
                    <div className={`p-2.5 rounded-xl border font-bold text-[11px] mt-2 ${formatComplementText(selectedOffer.complementDirection, selectedOffer.cashComplement).colorClass}`}>
                      <p>{formatComplementText(selectedOffer.complementDirection, selectedOffer.cashComplement).badge}</p>
                      <p className="text-[10px] font-normal opacity-85 mt-0.5">
                        {formatComplementText(selectedOffer.complementDirection, selectedOffer.cashComplement).subtext}
                      </p>
                    </div>
                  </div>

                  {/* Appareil Ciblé */}
                  <div className="bg-blue-50/40 p-4 rounded-2xl border border-blue-200 space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-[#0062BD] block mb-1">Appareil Neuf Ciblé</span>
                      <div className="flex items-center gap-3">
                        {selectedOffer.productImage && (
                          <img
                            src={selectedOffer.productImage}
                            alt={selectedOffer.productName}
                            className="w-14 h-14 object-contain bg-white rounded-xl p-1 border border-blue-200"
                          />
                        )}
                        <div>
                          <p className="font-heading font-bold text-sm text-[#0062BD]">{selectedOffer.productName}</p>
                          <p className="text-xs font-black text-gray-900 font-price mt-0.5">
                            Prix boutique : {formatFCFA(selectedOffer.targetProductPrice)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {selectedOffer.productSlug && (
                      <Link
                        href={`/produit/${selectedOffer.productSlug}`}
                        className="text-[11px] font-bold text-[#0062BD] hover:underline flex items-center gap-1 self-start"
                        target="_blank"
                      >
                        <span>Voir la fiche produit</span>
                        <Icons.ExternalLink size={12} />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Formulaire de Traitement & Décision Technique */}
                <form onSubmit={handleApplyAction} className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <span className="font-heading font-black text-gray-900 text-sm flex items-center gap-2">
                      <Icons.Sliders size={16} className="text-[#0062BD]" />
                      <span>Décision & Réponse de l'Expert</span>
                    </span>
                  </div>

                  {/* Type d'action */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setActionType('ACCEPT')}
                      className={`p-2.5 rounded-xl font-bold text-center transition-all cursor-pointer ${
                        actionType === 'ACCEPT'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      Accepter
                    </button>

                    <button
                      type="button"
                      onClick={() => setActionType('COUNTER')}
                      className={`p-2.5 rounded-xl font-bold text-center transition-all cursor-pointer ${
                        actionType === 'COUNTER'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      Contre-proposer
                    </button>

                    <button
                      type="button"
                      onClick={() => setActionType('COMPLETE')}
                      className={`p-2.5 rounded-xl font-bold text-center transition-all cursor-pointer ${
                        actionType === 'COMPLETE'
                          ? 'bg-purple-700 text-white shadow-xs'
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      Clôturer (Troc Fini)
                    </button>

                    <button
                      type="button"
                      onClick={() => setActionType('REJECT')}
                      className={`p-2.5 rounded-xl font-bold text-center transition-all cursor-pointer ${
                        actionType === 'REJECT'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      Refuser
                    </button>
                  </div>

                  {/* Bloc spécifique Contre-proposition */}
                  {actionType === 'COUNTER' && (
                    <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 space-y-3 animate-in fade-in">
                      <span className="font-bold text-amber-950 block text-[11px]">Paramètres de la Contre-Proposition :</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-gray-700 mb-1 text-[11px]">Sens du complément réajusté *</label>
                          <select
                            value={counterDirection}
                            onChange={(e) => setCounterDirection(e.target.value as TradeComplementDirection)}
                            className="w-full p-2 rounded-lg border border-gray-300 bg-white font-bold text-gray-900"
                          >
                            <option value="CLIENT_TO_STORE">Le client doit verser à la boutique</option>
                            <option value="STORE_TO_CLIENT">La boutique verse au client (téléphone supérieur)</option>
                            <option value="NONE">Échange direct équivalent (0 FCFA)</option>
                          </select>
                        </div>

                        {counterDirection !== 'NONE' && (
                          <div>
                            <label className="block font-bold text-gray-700 mb-1 text-[11px]">Montant réajusté (FCFA) *</label>
                            <input
                              type="number"
                              required
                              placeholder="Ex: 350000"
                              value={counterAmountInput}
                              onChange={(e) => setCounterAmountInput(e.target.value)}
                              className="w-full p-2 rounded-lg border border-gray-300 bg-white font-bold text-gray-900"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Note explicative admin */}
                  <div>
                    <label className="block font-bold text-gray-700 mb-1 text-[11px]">
                      Message / Explication technique transmise au client :
                    </label>
                    <textarea
                      rows={3}
                      placeholder={
                        actionType === 'ACCEPT'
                          ? "Votre proposition a été acceptée par notre expert technique ! Veuillez passer en boutique ou nous contacter pour l'échange."
                          : actionType === 'COUNTER'
                          ? "Après examen de votre appareil, nous réajustons le complément financier car l'état de la batterie nécessite..."
                          : actionType === 'COMPLETE'
                          ? "Échange finalisé avec succès au showroom de Cotonou."
                          : "Nous ne pouvons malheureusement pas retenir cette offre pour le motif suivant..."
                      }
                      value={adminNoteInput}
                      onChange={(e) => setAdminNoteInput(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#0062BD] text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#1D2129] hover:bg-[#0062BD] text-[#FED700] hover:text-white font-heading font-black text-xs uppercase tracking-wider py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Icons.Check size={16} />
                        <span>Appliquer et Notifier le Client</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white border border-[#E2E5E8] rounded-3xl p-12 text-center text-gray-400">
                <Icons.Sliders size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold">Sélectionnez une proposition dans la colonne de gauche pour l'examiner.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
