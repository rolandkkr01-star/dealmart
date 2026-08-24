'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  getUserAddressesAction,
  saveUserAddressAction,
  deleteUserAddressAction,
  setDefaultAddressAction,
} from '@/actions/address';
import { UserAddress } from '@/types';
import { Icons } from '@/components/ui/Icons';
import { DialogModal } from '@/components/ui/DialogModal';

export default function ClientAddressesPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Modal de confirmation de suppression
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    addressId: string | null;
    label: string;
  }>({
    isOpen: false,
    addressId: null,
    label: '',
  });

  // Formulaire d'ajout
  const [label, setLabel] = useState('');
  const [city, setCity] = useState('Cotonou');
  const [district, setDistrict] = useState('');
  const [street, setStreet] = useState('');
  const [phone, setPhone] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  async function loadAddresses() {
    setLoading(true);
    const res = await getUserAddressesAction();
    if (res.success && res.addresses) {
      setAddresses(res.addresses);
    }
    setLoading(false);
  }

  const handleOpenAddModal = () => {
    setLabel('');
    setCity('Cotonou');
    setDistrict('');
    setStreet('');
    setPhone(user?.phone || '');
    setIsDefault(addresses.length === 0);
    setActionError(null);
    setIsModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setSubmitting(true);

    const res = await saveUserAddressAction({
      label: label.trim(),
      city: city.trim(),
      district: district.trim() || undefined,
      street: street.trim(),
      phone: phone.trim(),
      isDefault,
    });

    setSubmitting(false);

    if (res.success) {
      setActionSuccess('Adresse ajoutée avec succès à votre carnet.');
      setIsModalOpen(false);
      loadAddresses();
      setTimeout(() => setActionSuccess(null), 4000);
    } else {
      setActionError(res.error || 'Erreur lors de l\'enregistrement de l\'adresse.');
    }
  };

  const handleDeleteAddress = (id: string, addrLabel: string) => {
    setDeleteConfirmState({
      isOpen: true,
      addressId: id,
      label: addrLabel,
    });
  };

  const confirmDeleteAddress = async () => {
    if (!deleteConfirmState.addressId) return;
    const id = deleteConfirmState.addressId;
    setDeleteConfirmState({ isOpen: false, addressId: null, label: '' });

    const res = await deleteUserAddressAction(id);
    if (res.success) {
      setActionSuccess('Adresse supprimée avec succès.');
      loadAddresses();
      setTimeout(() => setActionSuccess(null), 3000);
    } else {
      setActionError(res.error || 'Impossible de supprimer cette adresse.');
    }
  };

  const handleSetDefault = async (id: string) => {
    const res = await setDefaultAddressAction(id);
    if (res.success) {
      setActionSuccess('Adresse définie comme adresse par défaut.');
      loadAddresses();
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Dialog de confirmation de suppression */}
      <DialogModal
        isOpen={deleteConfirmState.isOpen}
        onClose={() => setDeleteConfirmState({ isOpen: false, addressId: null, label: '' })}
        onConfirm={confirmDeleteAddress}
        title="Supprimer cette adresse ?"
        message={`Êtes-vous certain de vouloir supprimer "${deleteConfirmState.label}" de votre carnet d'adresses ?`}
        type="danger"
        confirmText="Supprimer"
        cancelText="Conserver"
      />
      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <Link href="/" className="hover:text-[#0062BD]">Accueil</Link>
        <span>/</span>
        <Link href="/compte" className="hover:text-[#0062BD]">Mon Compte</Link>
        <span>/</span>
        <span className="text-gray-900 font-bold">Mes Adresses de Livraison</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5 mb-8">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-gray-900 tracking-tight flex items-center gap-3">
            <Icons.MapPin size={28} className="text-[#0062BD]" />
            <span>Mes Adresses de Livraison</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Gérez vos lieux de réception habituels au Bénin pour des commandes rapides en un clic.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-heading font-black text-xs uppercase px-5 py-3 rounded-xl shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
        >
          <Icons.Plus size={16} />
          <span>Ajouter une adresse</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs mb-6 flex items-center gap-2.5">
          <Icons.Check size={18} className="text-emerald-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs mb-6 flex items-center gap-2.5">
          <Icons.AlertCircle size={18} className="text-red-500 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center text-xs text-gray-500">
          <div className="w-8 h-8 border-3 border-[#FED700] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p>Chargement de vos adresses...</p>
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-white border border-[#E2E5E8] rounded-3xl p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#0062BD] flex items-center justify-center mx-auto mb-4">
            <Icons.MapPin size={32} />
          </div>
          <h3 className="font-heading font-bold text-base text-gray-900 mb-2">
            Aucune adresse enregistrée
          </h3>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            Vous n'avez pas encore d'adresse mémorisée. Enregistrez votre domicile ou bureau pour pré-remplir automatiquement vos prochaines commandes.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-heading font-black text-xs uppercase px-6 py-3 rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <Icons.Plus size={16} />
            <span>Ajouter ma première adresse</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`bg-white border-2 rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between ${
                addr.isDefault ? 'border-[#0062BD] bg-blue-50/20' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-heading font-bold text-sm text-gray-900 flex items-center gap-2">
                    <Icons.MapPin size={16} className={addr.isDefault ? 'text-[#0062BD]' : 'text-gray-400'} />
                    <span>{addr.label}</span>
                  </span>
                  {addr.isDefault ? (
                    <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                      Adresse par défaut
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-[11px] font-bold text-[#0062BD] hover:underline cursor-pointer"
                    >
                      Définir par défaut
                    </button>
                  )}
                </div>

                <div className="text-xs text-gray-700 space-y-1 my-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p>
                    <span className="text-gray-500 font-medium">Ville :</span> <strong>{addr.city}</strong>
                    {addr.district ? ` • Quartier ${addr.district}` : ''}
                  </p>
                  <p>
                    <span className="text-gray-500 font-medium">Repère / Rue :</span> {addr.street}
                  </p>
                  {addr.phone && (
                    <p className="flex items-center gap-1.5 pt-1 text-gray-600">
                      <Icons.Phone size={12} className="text-emerald-600" />
                      <span>{addr.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 text-xs">
                <button
                  onClick={() => handleDeleteAddress(addr.id, addr.label)}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Icons.Trash2 size={14} />
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Ajout d'Adresse */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-5">
              <h3 className="font-heading font-black text-lg text-gray-900 flex items-center gap-2">
                <Icons.MapPin size={20} className="text-[#0062BD]" />
                <span>Nouvelle Adresse de Livraison</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer"
              >
                <Icons.X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Nom de l'adresse (ex: Domicile, Bureau Cadjehoun, Maison Calavi) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Domicile"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#0062BD] focus:outline-none font-bold text-gray-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Ville *</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#0062BD] focus:outline-none bg-white font-bold text-gray-900"
                  >
                    <option value="Cotonou">Cotonou</option>
                    <option value="Abomey-Calavi">Abomey-Calavi</option>
                    <option value="Porto-Novo">Porto-Novo</option>
                    <option value="Ouidah">Ouidah</option>
                    <option value="Parakou">Parakou</option>
                    <option value="Autre ville">Autre ville</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Quartier / Zone *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Cadjehoun, Akpakpa, Zogbo..."
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#0062BD] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Repère précis de Livraison (Rue, Immeuble, Carrefour) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: En face de la Pharmacie, Immeuble vitré au 1er étage"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#0062BD] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Téléphone de contact pour la livraison *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: +229 97 00 00 00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#0062BD] focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0062BD] focus:ring-[#0062BD] border-gray-300 cursor-pointer"
                  />
                  <span className="font-bold text-gray-900">Définir comme adresse de livraison par défaut</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-heading font-black px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Enregistrement...' : 'Enregistrer l\'adresse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
