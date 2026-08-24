'use client';

import React, { useState } from 'react';
import { loginAction } from '@/actions/auth';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/ui/Icons';

export function AdminLoginForm({ redirectTarget }: { redirectTarget: string }) {
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await loginAction({
      email: email.trim(),
      password,
      requireAdminRole: true,
    });

    if (result.success) {
      await refreshUser();
      window.location.href = redirectTarget;
    } else {
      setLoading(false);
      setError(result.error || 'Identifiants invalides ou droits d\'accès insuffisants.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-[#0F172A]">
      <div className="max-w-md w-full">
        {/* En-tête / Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#FED700] text-[#1D2129] flex items-center justify-center mx-auto mb-4 shadow-xl font-heading font-black text-xl">
            TP
          </div>
          <span className="text-[11px] font-black tracking-widest text-[#FED700] uppercase block mb-1">
            Console d'Administration
          </span>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-tight">
            Espace de Gestion Interne
          </h1>
          <p className="text-xs text-gray-400 mt-1.5">
            Veuillez renseigner vos accès pour gérer la boutique TechPhone229.
          </p>
        </div>

        {/* Boîte de Connexion */}
        <div className="bg-[#1E293B] border border-gray-700/80 rounded-3xl p-8 shadow-2xl">
          {error && (
            <div className="bg-red-950/80 border border-red-500/50 text-red-200 p-3.5 rounded-xl text-xs mb-6 flex items-center gap-2.5">
              <Icons.AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-300 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                Identifiant / Adresse Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.bj"
                  className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-[#FED700] transition-colors text-xs"
                />
                <Icons.Mail size={16} className="absolute left-3.5 top-3.5 text-gray-500" />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 pl-10 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-[#FED700] transition-colors text-xs"
                />
                <Icons.Lock size={16} className="absolute left-3.5 top-3.5 text-gray-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-200 cursor-pointer"
                >
                  {showPassword ? <Icons.EyeOff size={16} /> : <Icons.Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-heading font-black text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 mt-4"
            >
              {loading ? 'Connexion en cours...' : 'Accéder à la console'}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-gray-500 mt-6">
          TechPhone229 • Accès strictement réservé aux gestionnaires autorisés
        </p>
      </div>
    </div>
  );
}
