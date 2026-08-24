'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Product, ProductCondition, TradeComplementDirection } from '@/types';
import { useTrade } from '@/context/TradeContext';
import { useAuth } from '@/context/AuthContext';
import { formatFCFA } from '@/lib/utils';
import { Icons } from '@/components/ui/Icons';
import { submitTradeAction } from '@/actions/trades';
import { uploadProductImageAction } from '@/actions/upload';
import { DialogModal } from '@/components/ui/DialogModal';

interface TradeModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TradeModal: React.FC<TradeModalProps> = ({ product, isOpen, onClose }) => {
  const { submitTradeOffer } = useTrade();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerCity, setCustomerCity] = useState('Cotonou');
  const [offeredDeviceModel, setOfferedDeviceModel] = useState('');
  const [offeredDeviceCondition, setOfferedDeviceCondition] = useState<ProductCondition>('OCCASION');
  const [offeredDeviceDescription, setOfferedDeviceDescription] = useState('');
  
  // Direction du complément financier
  const [complementDirection, setComplementDirection] = useState<TradeComplementDirection>('NONE');
  const [cashComplement, setCashComplement] = useState<string>('');
  
  // Photos réelles de l'appareil
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  // Dialog pour retours d'erreur
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info' | 'success';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
  });

  // Pré-remplissage avec l'utilisateur connecté
  useEffect(() => {
    if (user) {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      if (fullName && !customerName) setCustomerName(fullName);
      if (user.email && !customerEmail) setCustomerEmail(user.email);
      if (user.phone && !customerPhone) setCustomerPhone(user.phone);
    }
  }, [user, isOpen]);

  if (!isOpen || !product) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhoto(true);
    setUploadError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await uploadProductImageAction(formData);
        if (res.success && res.url) {
          setPhotos((prev) => [...prev, res.url!]);
        } else {
          setUploadError(res.error || 'Erreur lors de l\'envoi de la photo.');
        }
      }
    } catch (err) {
      setUploadError('Erreur réseau lors de l\'upload des photos.');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePhoto = (idxToRemove: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !offeredDeviceModel) {
      setDialogState({
        isOpen: true,
        title: 'Champs obligatoires manquants',
        message: 'Veuillez renseigner votre nom, téléphone et le modèle de votre smartphone actuel.',
        type: 'warning',
      });
      return;
    }

    if (complementDirection !== 'NONE' && (!cashComplement || parseInt(cashComplement, 10) <= 0)) {
      setDialogState({
        isOpen: true,
        title: 'Montant du complément requis',
        message: 'Vous avez sélectionné un complément financier. Veuillez saisir le montant estimé en FCFA (ou sélectionner "Échange pur sans complément").',
        type: 'warning',
      });
      return;
    }

    setIsSubmitting(true);
    const parsedComplement = complementDirection !== 'NONE' && cashComplement ? parseInt(cashComplement, 10) : undefined;

    // 1. Sauvegarde en BDD Prisma
    const res = await submitTradeAction({
      customerName,
      customerPhone,
      customerEmail: customerEmail || undefined,
      customerCity,
      productId: product.id,
      offeredDeviceModel,
      offeredDeviceDescription,
      offeredDeviceCondition,
      offeredDevicePhotos: photos,
      complementDirection,
      cashComplement: parsedComplement,
    });

    if (!res.success) {
      setIsSubmitting(false);
      setDialogState({
        isOpen: true,
        title: 'Erreur',
        message: res.error || 'Impossible d\'enregistrer votre proposition.',
        type: 'danger',
      });
      return;
    }

    // 2. Synchronisation de l'état contextuel
    const offerId = submitTradeOffer({
      customerName,
      customerPhone,
      customerEmail,
      customerCity,
      productId: product.id,
      productName: product.name,
      productImage: product.images[0]?.url || '',
      targetProductPrice: product.promoPrice ?? product.basePrice,
      offeredDeviceModel,
      offeredDeviceCondition,
      offeredDeviceDescription,
      offeredDevicePhotos: photos,
      complementDirection,
      cashComplement: parsedComplement,
    });

    setIsSubmitting(false);
    setSubmittedId(res.tradeId || offerId);
  };

  const handleResetAndClose = () => {
    setSubmittedId(null);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setOfferedDeviceModel('');
    setOfferedDeviceDescription('');
    setComplementDirection('NONE');
    setCashComplement('');
    setPhotos([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <DialogModal
        isOpen={dialogState.isOpen}
        title={dialogState.title}
        message={dialogState.message}
        type={dialogState.type}
        isConfirmOnly={true}
        confirmText="Compris"
        onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
      />

      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-gray-200 relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer transition-colors"
        >
          <Icons.X size={18} />
        </button>

        {submittedId ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-xs animate-in zoom-in">
              <Icons.Check size={32} strokeWidth={3} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                Dossier N° #{submittedId.slice(-8)}
              </span>
              <h3 className="font-heading font-black text-xl text-gray-900 mt-2">
                Proposition de Troc Envoyée avec Succès !
              </h3>
            </div>
            
            <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
              Votre proposition pour le modèle <strong className="text-[#0062BD]">{product.name}</strong> a bien été enregistrée et transmise à notre équipe technique.
            </p>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-950 text-left space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-amber-900">
                <Icons.Sparkles size={16} className="text-amber-600" />
                <span>Étapes suivantes de votre troc :</span>
              </p>
              <ul className="space-y-1.5 text-[11px] text-amber-900">
                <li>1. <strong>Expertise technique :</strong> Nos techniciens examinent vos photos et votre description sous 1h à 2h.</li>
                <li>2. <strong>Validation & Contre-offre :</strong> Vous recevez une confirmation par SMS/WhatsApp ou directement dans votre espace client.</li>
                <li>3. <strong>Échange physique :</strong> Rendez-vous en boutique à Cotonou ou remise en main propre sécurisée par notre coursier.</li>
              </ul>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleResetAndClose}
                className="w-full sm:w-auto bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-heading font-black text-xs uppercase px-6 py-3 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Continuer mes achats
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-2xl bg-[#1D2129] text-[#FED700] flex items-center justify-center shadow-xs flex-shrink-0">
                <Icons.Repeat size={20} />
              </div>
              <div>
                <h3 className="font-heading font-black text-base text-gray-900">
                  Proposer un Troc / Échange
                </h3>
                <p className="text-[11px] text-gray-500">
                  Échangez votre smartphone actuel contre ce modèle avec ou sans complément d'argent
                </p>
              </div>
            </div>

            {/* Téléphone visé */}
            <div className="bg-blue-50/50 p-3.5 rounded-2xl flex items-center gap-3 mb-5 border border-blue-200/70">
              <img
                src={product.images[0]?.url}
                alt={product.name}
                className="w-13 h-13 object-contain bg-white rounded-xl p-1 border border-gray-200 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[9px] uppercase font-black text-[#0062BD] tracking-wider bg-blue-100/70 px-2 py-0.5 rounded">
                  Modèle ciblé
                </span>
                <h4 className="text-xs font-bold text-gray-900 truncate mt-0.5">{product.name}</h4>
                <p className="text-xs font-black text-[#0062BD] font-price">
                  Valeur boutique : {formatFCFA(product.promoPrice ?? product.basePrice)}
                </p>
              </div>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Coordonnées */}
              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 space-y-3">
                <span className="font-bold text-gray-800 text-[11px] block">1. Vos Coordonnées</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1 text-[11px]">Nom & Prénom *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Jean Houndékon"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl p-2.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#0062BD]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1 text-[11px]">Téléphone (WhatsApp) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="Ex: +229 97 00 00 00"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl p-2.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#0062BD]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1 text-[11px]">Email (optionnel)</label>
                    <input
                      type="email"
                      placeholder="votre.email@exemple.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl p-2.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#0062BD]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1 text-[11px]">Ville / Localité *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Cotonou, Calavi, Porto-Novo"
                      value={customerCity}
                      onChange={(e) => setCustomerCity(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl p-2.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#0062BD]"
                    />
                  </div>
                </div>
              </div>

              {/* Appareil proposé */}
              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 space-y-3">
                <span className="font-bold text-gray-800 text-[11px] block">2. Votre Téléphone Actuel</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1 text-[11px]">Modèle précis & Capacité *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: iPhone 13 Pro Max 256Go"
                      value={offeredDeviceModel}
                      onChange={(e) => setOfferedDeviceModel(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl p-2.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#0062BD]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1 text-[11px]">État de l'appareil *</label>
                    <select
                      value={offeredDeviceCondition}
                      onChange={(e) => setOfferedDeviceCondition(e.target.value as ProductCondition)}
                      className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#0062BD] bg-white font-medium"
                    >
                      <option value="OCCASION">Occasion (traces normales d'usage)</option>
                      <option value="NEUF_NON_SCELLE">Comme Neuf (impeccable, sans rayures)</option>
                      <option value="NEUF_SCELLE">Neuf sous scellé (jamais ouvert)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1 text-[11px]">
                    Description technique (santé batterie, écran d'origine, accessoires fournis...)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Batterie 89%, Face ID fonctionnel, boîte d'origine et câble fournis..."
                    value={offeredDeviceDescription}
                    onChange={(e) => setOfferedDeviceDescription(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#0062BD]"
                  />
                </div>

                {/* Upload des photos */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-gray-700 text-[11px]">Photos de l'appareil (recommandé)</label>
                    <span className="text-[10px] text-gray-400">Face avant, arrière, batterie</span>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    {photos.map((p, idx) => (
                      <div key={idx} className="relative group w-14 h-14 rounded-xl border border-gray-200 overflow-hidden bg-white">
                        <img src={p} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-1 shadow-xs hover:bg-red-700"
                        >
                          <Icons.X size={10} />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#0062BD] bg-white flex flex-col items-center justify-center text-gray-400 hover:text-[#0062BD] transition-all cursor-pointer"
                    >
                      {uploadingPhoto ? (
                        <div className="w-4 h-4 border-2 border-[#0062BD] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Icons.Camera size={16} />
                          <span className="text-[8px] font-bold mt-0.5">+ Photo</span>
                        </>
                      )}
                    </button>
                  </div>
                  {uploadError && <p className="text-[10px] text-red-600 mt-1">{uploadError}</p>}
                </div>
              </div>

              {/* 3. Sens du complément financier */}
              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800 text-[11px]">3. Équilibre Financier / Complément</span>
                  <span className="text-[10px] text-gray-500 font-medium">Selon la valeur relative des 2 appareils</span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {/* Option A : Échange simple */}
                  <label
                    onClick={() => {
                      setComplementDirection('NONE');
                      setCashComplement('');
                    }}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      complementDirection === 'NONE'
                        ? 'border-[#0062BD] bg-blue-50/40'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="complementDirection"
                      checked={complementDirection === 'NONE'}
                      onChange={() => {
                        setComplementDirection('NONE');
                        setCashComplement('');
                      }}
                      className="mt-0.5 text-[#0062BD]"
                    />
                    <div>
                      <p className="font-bold text-gray-900 text-xs">Échange direct sans complément d'argent (0 FCFA)</p>
                      <p className="text-[10px] text-gray-500">Les deux appareils ont une valeur équivalente estimée.</p>
                    </div>
                  </label>

                  {/* Option B : Le client ajoute un complément */}
                  <label
                    onClick={() => setComplementDirection('CLIENT_TO_STORE')}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      complementDirection === 'CLIENT_TO_STORE'
                        ? 'border-emerald-600 bg-emerald-50/40'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="complementDirection"
                      checked={complementDirection === 'CLIENT_TO_STORE'}
                      onChange={() => setComplementDirection('CLIENT_TO_STORE')}
                      className="mt-0.5 text-emerald-600"
                    />
                    <div>
                      <p className="font-bold text-gray-900 text-xs">J'ajoute un complément d'argent en FCFA</p>
                      <p className="text-[10px] text-gray-500">Mon smartphone a une valeur inférieure au modèle visé (je verse un supplément à la boutique).</p>
                    </div>
                  </label>

                  {/* Option C : Le client DEMANDE un complément à la boutique */}
                  <label
                    onClick={() => setComplementDirection('STORE_TO_CLIENT')}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      complementDirection === 'STORE_TO_CLIENT'
                        ? 'border-amber-600 bg-amber-50/40'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="complementDirection"
                      checked={complementDirection === 'STORE_TO_CLIENT'}
                      onChange={() => setComplementDirection('STORE_TO_CLIENT')}
                      className="mt-0.5 text-amber-600"
                    />
                    <div>
                      <p className="font-bold text-gray-900 text-xs">Je demande un complément d'argent à la boutique</p>
                      <p className="text-[10px] text-gray-500">Mon smartphone a une valeur supérieure au modèle visé (la boutique me verse un complément + le téléphone).</p>
                    </div>
                  </label>
                </div>

                {/* Saisie du montant si complément choisi */}
                {complementDirection !== 'NONE' && (
                  <div className="pt-1 animate-in fade-in">
                    <label className="block font-bold text-gray-700 mb-1 text-[11px]">
                      {complementDirection === 'CLIENT_TO_STORE'
                        ? 'Montant que vous proposez de verser (FCFA) *'
                        : 'Montant que vous demandez à recevoir de la boutique (FCFA) *'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        min="1000"
                        step="1000"
                        placeholder="Ex: 50 000"
                        value={cashComplement}
                        onChange={(e) => setCashComplement(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl p-2.5 pr-14 text-xs bg-white font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0062BD]"
                      />
                      <span className="absolute right-3 top-2.5 font-bold text-gray-400 text-xs">FCFA</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bouton d'envoi */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#1D2129] hover:bg-[#0062BD] text-[#FED700] hover:text-white font-heading font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Envoi de votre proposition...</span>
                    </>
                  ) : (
                    <>
                      <Icons.Send size={15} />
                      <span>Envoyer ma proposition de troc</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-gray-400 text-center mt-2">
                  L'envoi de cette proposition ne vous engage à aucun paiement.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
