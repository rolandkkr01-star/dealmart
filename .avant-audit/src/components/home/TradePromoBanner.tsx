import React from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';

export const TradePromoBanner: React.FC = () => {
  return (
    <section className="mb-12">
      <div className="bg-[#1D2129] border-2 border-[#FED700] rounded-2xl p-6 sm:p-10 text-white relative overflow-hidden shadow-xl">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#FED700] text-[#1D2129] font-black text-[11px] uppercase tracking-wider px-3.5 py-1 rounded-full mb-3 shadow-xs">
            <Icons.Repeat size={13} />
            <span>Service Exclusif TechPhone229</span>
          </div>

          <h3 className="font-heading font-black text-2xl sm:text-3xl text-white mb-3 leading-tight">
            Échangez votre ancien smartphone contre le dernier cri !
          </h3>

          <p className="text-xs sm:text-sm text-gray-300 mb-6 leading-relaxed">
            Ne laissez pas dormir votre ancien iPhone ou Samsung dans un tiroir. Faites-le estimer en ligne en 2 minutes et repartez avec un modèle récent neuf scellé avec garantie.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 text-xs">
            <div className="bg-white/10 p-3 rounded-xl border border-gray-700">
              <span className="font-bold text-[#FED700] block mb-0.5">1. Choisissez</span>
              <span className="text-gray-300 text-[11px]">Le smartphone neuf qui vous fait envie</span>
            </div>
            <div className="bg-white/10 p-3 rounded-xl border border-gray-700">
              <span className="font-bold text-[#FED700] block mb-0.5">2. Décrivez</span>
              <span className="text-gray-300 text-[11px]">L'état de votre ancien modèle avec photos</span>
            </div>
            <div className="bg-white/10 p-3 rounded-xl border border-gray-700">
              <span className="font-bold text-[#FED700] block mb-0.5">3. Échangez</span>
              <span className="text-gray-300 text-[11px]">En boutique ou livraison à domicile</span>
            </div>
          </div>

          <Link
            href="/boutique?trade=true"
            className="inline-flex items-center gap-2 bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-heading font-black text-xs uppercase px-7 py-3.5 rounded-xl shadow-lg transition-all"
          >
            <Icons.Repeat size={16} />
            <span>Découvrir les modèles éligibles au Troc</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
