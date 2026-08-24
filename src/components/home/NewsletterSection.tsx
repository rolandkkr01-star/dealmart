'use client';

import React, { useState } from 'react';
import { Icons } from '@/components/ui/Icons';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  return (
    <section className="mb-14">
      <div className="bg-[#FED700] rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border border-[#E8C400]">
        <div className="flex items-center gap-4 text-[#1D2129] max-w-lg">
          <div className="w-12 h-12 rounded-xl bg-[#1D2129] text-[#FED700] flex items-center justify-center flex-shrink-0">
            <Icons.Send size={24} />
          </div>
          <div>
            <h3 className="font-heading font-black text-xl text-[#1D2129] mb-1">
              Inscrivez-vous aux Ventes Privées
            </h3>
            <p className="text-xs text-gray-800 font-medium">
              Recevez les arrivages de nouveaux stocks d'iPhones et un bon de réduction de <strong>10 000 FCFA</strong> sur votre première commande.
            </p>
          </div>
        </div>

        <div className="w-full md:w-auto min-w-[320px]">
          {subscribed ? (
            <div className="bg-[#1D2129] text-[#FED700] p-4 rounded-xl text-center text-xs font-bold shadow-md">
              🎉 Félicitations ! Votre code promo : <span className="underline text-white">COTONOU229</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex rounded-xl overflow-hidden bg-white p-1 shadow-sm border border-gray-300 focus-within:ring-2 focus-within:ring-[#0062BD]">
              <input
                type="email"
                required
                placeholder="Votre adresse email (ex: nom@domaine.com)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[#1D2129] hover:bg-[#2C3039] text-[#FED700] font-heading font-bold text-xs uppercase px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                S'inscrire
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
