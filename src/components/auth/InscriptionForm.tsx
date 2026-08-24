'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { registerAction, verifyRegistrationOtpAction, resendRegistrationOtpAction } from '@/actions/auth';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/ui/Icons';
import { siteConfig } from '@/lib/site-config';

export function InscriptionForm({ redirectTarget }: { redirectTarget: string }) {
  const { refreshUser } = useAuth();

  // Étape 1 : Données formulaire
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Étape 2 : Validation OTP
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Décompte pour le renvoi d'OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (
      password.length < 10 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      setError(
        'Le mot de passe doit contenir au moins 10 caractères, avec au moins 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial (ex: @, #, $, !).'
      );
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

    setLoading(false);

    if (result.success && result.requireOtp) {
      setStep('otp');
      setCountdown(60);
      setCanResend(false);
    } else {
      setError(result.error || 'Erreur lors de la création du compte');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (otpCode.trim().length !== 6) {
      setError('Veuillez saisir le code complet à 6 chiffres.');
      return;
    }

    setLoading(true);
    const result = await verifyRegistrationOtpAction({
      email,
      code: otpCode.trim(),
    });

    if (result.success) {
      await refreshUser();
      window.location.href = redirectTarget;
    } else {
      setLoading(false);
      setError(result.error || 'Code de confirmation invalide ou expiré.');
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || loading) return;
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    const result = await resendRegistrationOtpAction(email);
    setLoading(false);

    if (result.success) {
      setSuccessMessage(result.message || 'Un nouveau code vous a été envoyé.');
      setCountdown(60);
      setCanResend(false);
    } else {
      setError(result.error || 'Impossible de renvoyer le code.');
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="bg-white border border-[#E2E5E8] rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-6">
          <Icons.BrandCart size={44} className="text-[#1D2129] mx-auto mb-2" />
          <h1 className="font-heading font-black text-2xl text-gray-900">
            {step === 'form' ? 'Créer un Compte Client' : 'Vérification de votre Email'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {step === 'form'
              ? `Rejoignez ${siteConfig.name} pour bénéficier d'offres exclusives et du suivi en temps réel.`
              : `Nous avons envoyé un code de confirmation à 6 chiffres à l'adresse ${email}.`}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs mb-4 flex items-center gap-2">
            <Icons.AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs mb-4 flex items-center gap-2">
            <Icons.CheckCircle size={16} className="flex-shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {step === 'form' ? (
          <>
            {/* Bouton Google OAuth */}
            <a
              href={`/api/auth/google?redirect=${encodeURIComponent(redirectTarget)}`}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs py-3 rounded-xl shadow-xs transition-all mb-4 cursor-pointer"
            >
              <Icons.Google size={18} />
              <span>S'inscrire en 1 clic avec Google</span>
            </a>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-gray-400 font-medium">ou créer un compte par email</span>
              </div>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Prénom *</label>
                  <input
                    type="text"
                    required
                    placeholder="Votre prénom"
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
                    placeholder="Votre nom"
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
                  placeholder="Votre adresse email (ex: nom@domaine.com)"
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
                  placeholder="Votre numéro de téléphone (ex: +229 97 00 00 00)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#0062BD] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Mot de passe (10 car. min., majuscule, chiffre, symbole) *</label>
                <input
                  type="password"
                  required
                  placeholder="Votre mot de passe secret"
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
                {loading ? 'Création en cours...' : 'Continuer vers la vérification'}
              </button>
            </form>
          </>
        ) : (
          /* Étape 2 : Écran Saisie OTP */
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
              <label className="block font-bold text-gray-800 text-sm mb-2">
                Saisissez votre code à 6 chiffres
              </label>
              <input
                type="text"
                required
                maxLength={6}
                autoFocus
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full max-w-[200px] text-center font-mono font-black text-2xl tracking-[0.4em] bg-white border-2 border-[#FED700] rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-[#0062BD]"
              />
              <p className="text-[11px] text-gray-500 mt-2">
                Code envoyé à <span className="font-semibold text-gray-700">{email}</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-heading font-black text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Vérification en cours...' : 'Confirmer et Accéder à mon compte'}
            </button>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-gray-500 hover:text-gray-700 font-medium cursor-pointer"
              >
                ← Modifier mes informations
              </button>

              <button
                type="button"
                disabled={!canResend || loading}
                onClick={handleResendOtp}
                className={`font-bold ${
                  canResend
                    ? 'text-[#0062BD] hover:underline cursor-pointer'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                {canResend ? 'Renvoyer le code' : `Renvoyer (${countdown}s)`}
              </button>
            </div>
          </form>
        )}

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
