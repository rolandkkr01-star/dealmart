'use client';

import React, { useState } from 'react';
import { loginAction } from '@/actions/auth';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/ui/Icons';
import { siteConfig } from '@/lib/site-config';

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
      setError(result.error || 'Invalid credentials or insufficient administrative permissions.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-[#0F172A]">
      <div className="max-w-md w-full">
        {/* DealMart Logo & Title */}
        <div className="text-center mb-8">
          <img
            src="/images/logo/dealmart_logo_horizontal_transparent.svg"
            alt={siteConfig.name}
            className="h-12 w-auto mx-auto mb-5 brightness-0 invert"
          />
          <span className="text-[11px] font-black tracking-widest text-[#F1B20B] uppercase block mb-1">
            Admin Management Console
          </span>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-tight">
            Internal Operations Portal
          </h1>
          <p className="text-xs text-gray-400 mt-1.5">
            Please enter your administrator credentials to manage {siteConfig.name}.
          </p>
        </div>

        {/* Login Box */}
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
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@dealmart.com"
                  className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-[#F1B20B] transition-colors text-xs"
                />
                <Icons.Mail size={16} className="absolute left-3.5 top-3.5 text-gray-500" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-gray-300 font-bold uppercase tracking-wider text-[10px]">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F1B20B] hover:bg-[#D99F07] text-[#1D2129] font-heading font-black text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 mt-4"
            >
              {loading ? 'Authenticating...' : 'Access Admin Console'}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-gray-500 mt-6">
          {siteConfig.name} • Authorized management personnel only
        </p>
      </div>
    </div>
  );
}