'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { loginAction } from '@/actions/auth';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/ui/Icons';

export function ConnexionForm({ redirectTarget }: { redirectTarget: string }) {
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await loginAction({ email, password });

    if (result.success) {
      await refreshUser();
      window.location.href = redirectTarget;
    } else {
      setLoading(false);
      setError(result.error || 'Erreur de connexion');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border border-[#E2E5E8] rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-6">
          <Icons.BrandCart size={44} className="text-[#1D2129] mx-auto mb-2" />
          <h1 className="font-heading font-black text-2xl text-gray-900">
            Espace Client
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Connectez-vous pour suivre vos commandes et gérer vos trocs.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs mb-4 flex items-center gap-2">
            <Icons.AlertCircle size={16} className="text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Bouton Google OAuth */}
        <a
          href={`/api/auth/google?redirect=${encodeURIComponent(redirectTarget)}`}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs py-3 rounded-xl shadow-xs transition-all mb-4 cursor-pointer"
        >
          <Icons.Google size={18} />
          <span>Continuer avec Google</span>
        </a>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-gray-400 font-medium">ou par email et mot de passe</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-700 font-bold mb-1">Adresse Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre adresse email (ex: nom@domaine.com)"
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-[#0062BD] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-1">Mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe secret"
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-[#0062BD] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-heading font-black text-xs uppercase py-3 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 text-center text-xs text-gray-500">
          Pas encore de compte ?{' '}
          <Link href={`/inscription?redirect=${encodeURIComponent(redirectTarget)}`} className="text-[#0062BD] font-bold hover:underline">
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}
