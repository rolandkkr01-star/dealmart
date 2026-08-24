'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { resetPasswordAction } from '@/actions/auth';
import { Icons } from '@/components/ui/Icons';
import { siteConfig } from '@/lib/site-config';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Vérification de la robustesse du mot de passe
  const hasMinLength = password.length >= 10;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isMatch = password.length > 0 && password === confirmPassword;

  const isFormValid =
    hasMinLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecial &&
    isMatch &&
    token.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setError('Jeton de réinitialisation manquant dans le lien.');
      return;
    }

    if (!isFormValid) {
      setError('Veuillez respecter tous les critères de sécurité pour votre mot de passe.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await resetPasswordAction({
        token,
        password,
        confirmPassword,
      });

      if (res.success) {
        setSuccess(res.message || 'Mot de passe réinitialisé avec succès !');
        setTimeout(() => {
          router.push('/connexion');
        }, 3000);
      } else {
        setError(res.error || 'Erreur lors de la réinitialisation.');
      }
    } catch (_) {
      setError('Une erreur est survenue. Veuillez vérifier votre connexion.');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
          <Icons.AlertCircle size={24} />
        </div>
        <h2 className="font-heading font-black text-lg text-gray-900">Lien invalide ou incomplet</h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Le lien de réinitialisation utilisé ne contient aucun jeton de sécurité valide.
        </p>
        <Link
          href="/mot-de-passe-oublie"
          className="inline-flex items-center gap-2 bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-bold text-xs uppercase px-5 py-2.5 rounded-xl transition-all"
        >
          <span>Faire une nouvelle demande</span>
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-5">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <Icons.CheckCircle size={32} />
        </div>
        <div>
          <h2 className="font-heading font-black text-xl text-gray-900">Mot de passe mis à jour !</h2>
          <p className="text-xs text-emerald-800 mt-2 leading-relaxed max-w-sm mx-auto">
            {success}
          </p>
          <p className="text-[11px] text-gray-400 mt-2">
            Redirection automatique vers la page de connexion dans quelques instants...
          </p>
        </div>
        <Link
          href="/connexion"
          className="inline-flex items-center justify-center gap-2 bg-[#1D2129] hover:bg-[#0062BD] text-white font-heading font-black text-xs uppercase px-6 py-3 rounded-xl transition-all shadow-xs w-full"
        >
          <span>Se connecter immédiatement</span>
          <Icons.ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-amber-100 text-[#1D2129]">
          <Icons.Lock size={24} className="text-[#0062BD]" />
        </div>
        <h1 className="font-heading font-black text-xl text-gray-900 tracking-tight">
          Nouveau mot de passe
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Choisissez un mot de passe robuste pour protéger votre compte {siteConfig.name}.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl mb-4 flex items-start gap-2.5">
          <Icons.AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Nouveau mot de passe */}
      <div>
        <label className="block text-gray-700 font-bold mb-1">Nouveau mot de passe</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 10 caractères avec majuscule, chiffre..."
            className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 pr-10 text-xs focus:ring-1 focus:ring-[#0062BD] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <Icons.EyeOff size={16} /> : <Icons.Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Confirmation mot de passe */}
      <div>
        <label className="block text-gray-700 font-bold mb-1">Confirmer le nouveau mot de passe</label>
        <input
          type={showPassword ? 'text' : 'password'}
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Retapez exactement le même mot de passe"
          className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none ${
            confirmPassword && !isMatch
              ? 'border-red-300 focus:ring-1 focus:ring-red-500'
              : 'border-gray-300 focus:ring-1 focus:ring-[#0062BD]'
          }`}
        />
        {confirmPassword && !isMatch && (
          <p className="text-[10px] text-red-600 font-bold mt-1">Les deux mots de passe ne correspondent pas.</p>
        )}
      </div>

      {/* Indicateurs de sécurité du mot de passe */}
      <div className="bg-gray-50 border border-gray-200/70 rounded-xl p-3 text-[11px] space-y-1.5">
        <span className="font-bold text-gray-700 block mb-1">Exigences de sécurité :</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px]">
          <span className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}>
            <Icons.Check size={12} className={hasMinLength ? 'text-emerald-600' : 'text-gray-300'} />
            10 caractères min.
          </span>
          <span className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}>
            <Icons.Check size={12} className={hasUppercase ? 'text-emerald-600' : 'text-gray-300'} />
            1 Majuscule (A-Z)
          </span>
          <span className={`flex items-center gap-1.5 ${hasLowercase ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}>
            <Icons.Check size={12} className={hasLowercase ? 'text-emerald-600' : 'text-gray-300'} />
            1 Minuscule (a-z)
          </span>
          <span className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}>
            <Icons.Check size={12} className={hasNumber ? 'text-emerald-600' : 'text-gray-300'} />
            1 Chiffre (0-9)
          </span>
          <span className={`flex items-center gap-1.5 col-span-2 ${hasSpecial ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}>
            <Icons.Check size={12} className={hasSpecial ? 'text-emerald-600' : 'text-gray-300'} />
            1 Caractère spécial (@, #, $, !, %, *, ?)
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !isFormValid}
        className="w-full bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-heading font-black text-xs uppercase py-3 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-3.5 h-3.5 border-2 border-[#1D2129] border-t-transparent rounded-full animate-spin" />
            <span>Mise à jour en cours...</span>
          </>
        ) : (
          <span>Enregistrer le nouveau mot de passe</span>
        )}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F8F9FA]">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-[#E2E5E8] p-6 sm:p-8">
        <Suspense
          fallback={
            <div className="p-8 text-center text-xs text-gray-500">
              <div className="w-6 h-6 border-2 border-[#FED700] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p>Chargement du formulaire sécurisé...</p>
            </div>
          }
        >
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}
