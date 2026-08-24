'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/ui/Icons';

export default function SuiviPage() {
  const router = useRouter();
  const [orderInput, setOrderInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderInput.trim()) {
      router.push(`/commande/${orderInput.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-16">
      <div className="bg-white border border-[#E2E5E8] rounded-2xl p-8 shadow-xs text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0062BD] flex items-center justify-center mx-auto mb-4">
          <Icons.Truck size={28} />
        </div>

        <h1 className="font-heading font-black text-2xl text-gray-900 mb-2">
          Suivi de Commande en Direct
        </h1>
        <p className="text-xs text-gray-600 mb-8 leading-relaxed">
          Entrez votre référence de commande reçue par SMS ou email lors de votre achat pour consulter son statut de préparation et de livraison en temps réel.
        </p>

        <form onSubmit={handleSearch} className="space-y-4">
          <input
            type="text"
            required
            placeholder="Votre référence de commande (ex: CMD-2026-XXXX)"
            value={orderInput}
            onChange={(e) => setOrderInput(e.target.value)}
            className="w-full border-2 border-gray-300 rounded-xl p-3.5 text-center text-sm font-bold tracking-wider uppercase focus:border-[#0062BD] focus:outline-none"
          />

          <button
            type="submit"
            className="w-full bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-heading font-black text-xs uppercase tracking-wider py-4 rounded-xl shadow-md transition-all cursor-pointer"
          >
            Rechercher ma commande
          </button>
        </form>
      </div>
    </div>
  );
}
