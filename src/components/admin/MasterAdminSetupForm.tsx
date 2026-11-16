'use client';

import React, { useState } from 'react';
import { setupMasterAdminAction } from '@/actions/auth';
import { useAuth } from '@/context/AuthContext';
import { siteConfig } from '@/lib/site-config';
import { Icons } from '@/components/ui/Icons';

export function MasterAdminSetupForm() {
  const { refreshUser } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const result = await setupMasterAdminAction({
      firstName,
      lastName,
      email,
      phone: phone || undefined,
      password,
    });

    if (result.success) {
      await refreshUser();
      window.location.href = '/admin';
    } else {
      setLoading(false);
      setError(result.error || 'Failed to setup Master Admin account.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-[#0F172A]">
      <div className="max-w-lg w-full">
        {/* System Initialization Header */}
        <div className="text-center mb-8">
          <img
            src="/images/logo/dealmart_logo_horizontal_transparent.svg"
            alt={siteConfig.name}
            className="h-12 w-auto mx-auto mb-5 brightness-0 invert"
          />
          <span className="text-[11px] font-black tracking-widest text-[#F1B20B] uppercase block mb-1">
            SYSTEM INITIALIZATION • FIRST-TIME SETUP
          </span>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-tight">
            Create Master Admin Account
          </h1>
          <p className="text-xs text-gray-400 mt-2 max-w-md mx-auto leading-relaxed">
            No administrator account currently exists on <strong className="text-white">{siteConfig.name}</strong>. 
            Configure your root credentials to initialize store administration.
          </p>
        </div>

        {/* Configuration Card */}
        <div className="bg-[#1E293B] border border-gray-700/80 rounded-3xl p-8 sm:p-10 shadow-2xl">
          {error && (
            <div className="bg-red-950/80 border border-red-500/50 text-red-200 p-4 rounded-xl text-xs mb-6 flex items-center gap-2.5">
              <Icons.AlertCircle size={18} className="text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-300 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F1B20B] transition-colors text-xs"
                />
              </div>
              <div>
                <label className="block text-gray-300 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F1B20B] transition-colors text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                Work Admin Email *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@dealmart.com"
                  className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-[#F1B20B] transition-colors text-xs"
                />
                <Icons.Mail size={16} className="absolute left-3.5 top-3.5 text-gray-500" />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                Phone Number (WhatsApp)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +677 7465588"
                  className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-[#F1B20B] transition-colors text-xs"
                />
                <Icons.PhoneCall size={16} className="absolute left-3.5 top-3.5 text-gray-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-gray-300 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                  Master Password (min. 8 characters) *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter secure password"
                    className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 pl-10 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-[#F1B20B] transition-colors text-xs"
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

              <div>
                <label className="block text-gray-300 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-[#F1B20B] transition-colors text-xs"
                  />
                  <Icons.Lock size={16} className="absolute left-3.5 top-3.5 text-gray-500" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F1B20B] hover:bg-[#D99F07] text-[#1D2129] font-heading font-black text-xs uppercase tracking-wider py-4 rounded-xl shadow-xl transition-all cursor-pointer disabled:opacity-50 mt-4"
            >
              {loading ? 'Initializing Master Admin...' : 'Initialize & Access Console'}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-gray-500 mt-6">
          Once the Master Admin is created, this onboarding portal will be permanently locked for security.
        </p>
      </div>
    </div>
  );
}