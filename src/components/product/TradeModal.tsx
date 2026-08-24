'use client';

import React, { useState } from 'react';
import { Product, ProductCondition } from '@/types';
import { useTrade } from '@/context/TradeContext';
import { formatFCFA } from '@/lib/utils';
import { Icons } from '@/components/ui/Icons';

import { submitTradeAction } from '@/actions/trades';

interface TradeModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TradeModal: React.FC<TradeModalProps> = ({ product, isOpen, onClose }) => {
  const { submitTradeOffer } = useTrade();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerCity, setCustomerCity] = useState('Cotonou');
  const [offeredDeviceModel, setOfferedDeviceModel] = useState('');
  const [offeredDeviceCondition, setOfferedDeviceCondition] = useState<ProductCondition>('OCCASION');
  const [offeredDeviceDescription, setOfferedDeviceDescription] = useState('');
  const [cashComplement, setCashComplement] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80'
  ]);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !offeredDeviceModel) return;

    setIsSubmitting(true);
    const parsedComplement = cashComplement ? parseInt(cashComplement, 10) : undefined;

    // 1. Sauvegarde en base de données Prisma
    await submitTradeAction({
      customerName,
      customerPhone,
      customerEmail: customerEmail || undefined,
      customerCity,
      productId: product.id,
      offeredDeviceModel,
      offeredDeviceDescription,
      offeredDeviceCondition,
      offeredDevicePhotos: photos,
      cashComplement: parsedComplement,
    });

    // 2. Synchronisation état client
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
      cashComplement: parsedComplement,
    });

    setIsSubmitting(false);
    setSubmittedId(offerId);
  };

  const handleResetAndClose = () => {
    setSubmittedId(null);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setOfferedDeviceModel('');
    setOfferedDeviceDescription('');
    setCashComplement('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer"
        >
          <Icons.X size={18} />
        </button>

        {submittedId ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <Icons.Check size={28} strokeWidth={3} />
            </div>
            <h3 className="font-heading font-bold text-xl text-gray-900">
              Proposition de Troc Envoyée !
            </h3>
            <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
              Votre proposition <strong>#{submittedId}</strong> pour le modèle <strong className="text-[#0062BD]">{product.name}</strong> a été transmise à notre équipe technique à Cotonou.
            </p>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 text-left space-y-1">
              <p>📌 <strong>Processus de validation :</strong></p>
              <p>1. Notre expert examine vos photos et votre description sous 2h.</p>
              <p>2. Vous recevez un SMS/WhatsApp avec l'estimation et la confirmation du complément.</p>
              <p>3. Rendez-vous en boutique ou coursier à domicile pour finaliser l'échange.</p>
            </div>
            <button
              onClick={handleResetAndClose}
              className="bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-bold text-xs uppercase px-6 py-3 rounded-lg shadow-sm transition-all"
            >
              Fermer et continuer mes achats
            </button>
          </div>
        ) : (
          <div>
            {/* Header du Troc */}
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-[#1D2129] text-[#FED700] flex items-center justify-center">
                <Icons.Repeat size={20} />
              </div>
              <div>
                <h3 className="font-heading font-black text-base text-gray-900">
                  Proposer un Troc / Échange
                </h3>
                <p className="text-[11px] text-gray-500">
                  Échangez votre ancien téléphone contre cet appareil avec ou sans complément
                </p>
              </div>
            </div>

            {/* Téléphone visé */}
            <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-3 mb-5 border border-gray-200">
              <img
                src={product.images[0]?.url}
                alt={product.name}
                className="w-12 h-12 object-contain bg-white rounded-lg p-1 border border-gray-200"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase font-bold text-gray-500">Appareil ciblé</span>
                <h4 className="text-xs font-bold text-gray-900 truncate">{product.name}</h4>
                <p className="text-xs font-black text-[#0062BD] font-price">
                  Valeur neuve : {formatFCFA(product.promoPrice ?? product.basePrice)}
                </p>
              </div>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Votre Nom & Prénom *</label>
                  <input
                    type="text"
                    required
                    placeholder="Votre nom et prénom"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#0062BD]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Téléphone (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Votre numéro de téléphone (ex: +229 97 00 00 00)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#0062BD]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Votre Modèle Actuel *</label>
                  <input
                    type="text"
                    required
                    placeholder="Votre smartphone actuel (ex: iPhone 12 Pro 128Go ou S21+)"
                    value={offeredDeviceModel}
                    onChange={(e) => setOfferedDeviceModel(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#0062BD]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">État de votre appareil</label>
                  <select
                    value={offeredDeviceCondition}
                    onChange={(e) => setOfferedDeviceCondition(e.target.value as ProductCondition)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#0062BD] bg-white"
                  >
                    <option value="OCCASION">Occasion (quelques marques d'usage)</option>
                    <option value="NEUF_NON_SCELLE">Comme Neuf (zéro rayure, boîte d'origine)</option>
                    <option value="NEUF_SCELLE">Neuf sous scellé (jamais ouvert)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Complément financier en FCFA que vous proposez (optionnel)
                </label>
                <input
                  type="number"
                  placeholder="Votre complément éventuel en FCFA (ex: 250 000)"
                  value={cashComplement}
                  onChange={(e) => setCashComplement(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#0062BD]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Description de votre appareil (santé batterie, accessoires fournis...)
                </label>
                <textarea
                  rows={2}
                  placeholder="Décrivez l'état de votre appareil (santé batterie, écran, accessoires inclus)..."
                  value={offeredDeviceDescription}
                  onChange={(e) => setOfferedDeviceDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#0062BD]"
                />
              </div>

              {/* Photos preview */}
              <div>
                <label className="block font-bold text-gray-700 mb-1 flex items-center justify-between">
                  <span>Photos de l'appareil (1 photo minimum pour estimation)</span>
                  <span className="text-[10px] text-gray-400">Stockage sécurisé</span>
                </label>
                <div className="flex items-center gap-2">
                  {photos.map((p, idx) => (
                    <img key={idx} src={p} alt="Aperçu" className="w-12 h-12 rounded-lg object-cover border border-gray-300" />
                  ))}
                  <div className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                    + Photo
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#1D2129] hover:bg-[#0062BD] text-[#FED700] font-black text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Icons.Send size={15} />
                  <span>Envoyer ma proposition d'échange</span>
                </button>
                <p className="text-[10px] text-gray-500 text-center mt-2">
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
