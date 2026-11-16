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
        'Password must be at least 10 characters long, containing at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special symbol (e.g. @, #, $, !).'
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
      if (result.warning) {
        setError(result.warning);
      }
    } else {
      setError(result.error || 'Failed to create account.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (otpCode.trim().length !== 6) {
      setError('Please enter the full 6-digit code.');
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
      setError(result.error || 'Invalid or expired confirmation code.');
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
      setSuccessMessage(result.message || 'A new code has been sent to your email.');
      setCountdown(60);
      setCanResend(false);
    } else {
      setError(result.error || 'Failed to resend code.');
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="bg-white border border-[#E2E5E8] rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-6">
          <Icons.BrandCart size={44} className="text-[#1D2129] mx-auto mb-2" />
          <h1 className="font-heading font-black text-2xl text-gray-900">
            {step === 'form' ? 'Create Customer Account' : 'Verify Your Email'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {step === 'form'
              ? `Join ${siteConfig.name} to enjoy exclusive member deals and live tracking.`
              : `We sent a 6-digit confirmation code to ${email}.`}
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
            {/* Google OAuth Button */}
            <a
              href={`/api/auth/google?redirect=${encodeURIComponent(redirectTarget)}`}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs py-3 rounded-xl shadow-xs transition-all mb-4 cursor-pointer"
            >
              <Icons.Google size={18} />
              <span>Sign up with Google</span>
            </a>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-gray-400 font-medium">or create an account with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#0054A4] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Your last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#0054A4] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="name@dealmart.sb"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#0054A4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Phone Number (WhatsApp / Mobile) *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +677 7465588"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#0054A4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Password (min. 10 chars, uppercase, number, symbol) *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#0054A4] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#F1B20B] hover:bg-[#D99F07] text-[#1D2129] font-heading font-black text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? 'Creating account...' : 'Continue to Verification'}
              </button>
            </form>
          </>
        ) : (
          /* Step 2 : OTP Entry */
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
              <label className="block font-bold text-gray-800 text-sm mb-2">
                Enter your 6-digit verification code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                autoFocus
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full max-w-[200px] text-center font-mono font-black text-2xl tracking-[0.4em] bg-white border-2 border-[#F1B20B] rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-[#0054A4]"
              />
              <p className="text-[11px] text-gray-500 mt-2">
                Code sent to <span className="font-semibold text-gray-700">{email}</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full bg-[#F1B20B] hover:bg-[#D99F07] text-[#1D2129] font-heading font-black text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Access My Account'}
            </button>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-gray-500 hover:text-gray-700 font-medium cursor-pointer"
              >
                ← Edit information
              </button>

              <button
                type="button"
                disabled={!canResend || loading}
                onClick={handleResendOtp}
                className={`font-bold ${canResend
                    ? 'text-[#0054A4] hover:underline cursor-pointer'
                    : 'text-gray-400 cursor-not-allowed'
                  }`}
              >
                {canResend ? 'Resend code' : `Resend (${countdown}s)`}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-gray-100 text-center text-xs text-gray-600">
          <p>
            Already have an account?{' '}
            <Link href="/connexion" className="text-[#0054A4] font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
