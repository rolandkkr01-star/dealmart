'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { requestPasswordResetAction } from '@/actions/auth';
import { Icons } from '@/components/ui/Icons';
import { siteConfig } from '@/lib/site-config';

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await requestPasswordResetAction({ email });
      if (res.success) {
        setSuccessMessage(res.message || 'Lien de réinitialisation envoyé avec succès.');
      } else {
        setError(res.error || 'Une erreur est survenue.');
      }
    } catch (_) {
      setError('Impossible de traiter votre demande. Veuillez vérifier votre connexion.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F8F9FA]">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-[#E2E5E8] p-6 sm:p-8">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-amber-100 text-[#1D2129]">
            <Icons.Lock size={24} className="text-[#0062BD]" />
          </div>
          <h1 className="font-heading font-black text-xl text-gray-900 tracking-tight">
            Mot de passe oublié ?
          </h1>
          <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
            Saisissez votre adresse email pour recevoir un lien sécurisé de réinitialisation.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl mb-5 flex items-start gap-2.5">
            <Icons.AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMessage ? (
          <div className="space-y-5">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <Icons.CheckCircle size={18} className="text-emerald-600" />
                <span>Email de réinitialisation envoyé</span>
              </div>
              <p className="leading-relaxed text-[11px] text-emerald-800">
                {successMessage}
              </p>
              <div className="pt-2 border-t border-emerald-200/60 text-[10px] text-emerald-700">
                ⏱️ <strong>Validité : 15 minutes</strong>. Pensez à vérifier vos courriers indésirables (spams).
              </div>
            </div>

            <div className="text-center pt-2">
              <Link
                href="/connexion"
                className="inline-flex items-center justify-center gap-2 bg-[#1D2129] hover:bg-[#0062BD] text-white font-heading font-black text-xs uppercase px-6 py-3 rounded-xl transition-all shadow-xs w-full"
              >
                <Icons.ArrowLeft size={14} />
                <span>Retour à la connexion</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label htmlFor="email" className="block text-gray-700 font-bold mb-1">
                Adresse Email associée à votre compte
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ex: nom@domaine.com"
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-[#0062BD] focus:outline-none"
              />
            </div>

            <div className="bg-gray-50 border border-gray-200/70 rounded-xl p-3 text-[11px] text-gray-500 space-y-1">
              <div className="font-bold text-gray-700 flex items-center gap-1.5">
                <Icons.ShieldCheck size={14} className="text-emerald-600" />
                <span>Protection & Confidentialité</span>
              </div>
              <p className="text-[10px] leading-relaxed">
                Le lien envoyé est à usage unique et expire automatiquement après 15 minutes pour votre sécurité.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-heading font-black text-xs uppercase py-3 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#1D2129] border-t-transparent rounded-full animate-spin" />
                  <span>Envoi du lien en cours...</span>
                </>
              ) : (
                <>
                  <Icons.Send size={14} />
                  <span>Envoyer le lien de réinitialisation</span>
                </>
              )}
            </button>

            <div className="pt-4 border-t border-gray-100 text-center">
              <Link
                href="/connexion"
                className="text-xs font-bold text-[#0062BD] hover:underline inline-flex items-center gap-1.5"
              >
                <Icons.ArrowLeft size={13} />
                <span>Retour à la page de connexion</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
