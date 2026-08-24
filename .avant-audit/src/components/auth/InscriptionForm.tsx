'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { registerAction } from '@/actions/auth';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/ui/Icons';

export function InscriptionForm({ redirectTarget }: { redirectTarget: string }) {
  const { refreshUser } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setLoading(true);
    const result = await registerAction({
      firstName,
      lastName,
      email,
      phone,
      password,
    });

    if (result.success) {
      await refreshUser();
      window.location.href = redirectTarget;
    } else {
      setLoading(false);
      setError(result.error || 'Erreur lors de la création du compte');
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="bg-white border border-[#E2E5E8] rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#FED700] text-[#1D2129] flex items-center justify-center font-black text-xl mx-auto mb-3 shadow-xs">
            ⚡
          </div>
          <h1 className="font-heading font-black text-2xl text-gray-900">
            Créer un Compte Client
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Rejoignez TechPhone229 pour bénéficier d'offres exclusives et du suivi en temps réel.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs mb-4 flex items-center gap-2">
            <Icons.AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Prénom *</label>
              <input
                type="text"
                required
                placeholder="Ex: Paul"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#0062BD] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Nom *</label>
              <input
                type="text"
                required
                placeholder="Ex: Hounsou"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#0062BD] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Adresse Email *</label>
            <input
              type="email"
              required
              placeholder="votre.email@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#0062BD] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Téléphone Mobile (MoMo / WhatsApp) *</label>
            <input
              type="tel"
              required
              placeholder="Ex: 97 00 00 00"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#0062BD] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Mot de passe (8 caractères min.) *</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#0062BD] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-heading font-black text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? 'Création en cours...' : 'Créer mon compte'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 text-center text-xs text-gray-600">
          <p>
            Vous avez déjà un compte ?{' '}
            <Link href="/connexion" className="text-[#0062BD] font-bold hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
