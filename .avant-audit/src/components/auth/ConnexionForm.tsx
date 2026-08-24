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
          <div className="w-12 h-12 rounded-xl bg-[#FED700] text-[#1D2129] flex items-center justify-center font-black text-xl mx-auto mb-3 shadow-xs">
            ⚡
          </div>
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-700 font-bold mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre.email@exemple.com"
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
              placeholder="••••••••"
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
