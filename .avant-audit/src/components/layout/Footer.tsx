import React from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';
import { siteConfig } from '@/lib/site-config';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1D2129] text-gray-300 pt-14 pb-8 border-t-4 border-[#FED700]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-gray-700">
          {/* Colonne 1: Marque & Coordonnées */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#FED700] flex items-center justify-center font-black text-xl text-[#1D2129]">
                ⚡
              </div>
              <span className="font-heading font-black text-2xl tracking-tight text-white">
                {siteConfig.name}
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mb-6">
              {siteConfig.slogan}
            </p>

            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-[#FED700] flex-shrink-0 mt-0.5">
                <Icons.Headset size={16} />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-gray-400">Besoin d'un conseil ?</p>
                <a href={`tel:${siteConfig.phone.replace(/\s+/g, '')}`} className="text-sm font-bold text-white hover:text-[#FED700] transition-colors">
                  {siteConfig.phone}
                </a>
              </div>
            </div>

            <div className="text-xs text-gray-400 space-y-1 mt-4">
              <p><strong className="text-gray-300">Adresse :</strong> {siteConfig.address}</p>
              <p><strong className="text-gray-300">Email :</strong> {siteConfig.email}</p>
              <p><strong className="text-gray-300">Horaires :</strong> {siteConfig.openingHours}</p>
            </div>
          </div>

          {/* Colonne 2: Rayons & Smartphones */}
          <div>
            <h4 className="font-heading text-sm font-bold text-white uppercase tracking-wider mb-5 pb-2 border-b border-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FED700]"></span>
              Rayons Phares
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/boutique?brand=IPHONE" className="text-gray-400 hover:text-[#FED700] transition-colors flex items-center gap-2">
                  <Icons.ChevronRight size={12} />
                  <span>Smartphones Apple iPhone</span>
                </Link>
              </li>
              <li>
                <Link href="/boutique?brand=SAMSUNG" className="text-gray-400 hover:text-[#FED700] transition-colors flex items-center gap-2">
                  <Icons.ChevronRight size={12} />
                  <span>Samsung Galaxy Série S & Fold</span>
                </Link>
              </li>
              <li>
                <Link href="/boutique?condition=OCCASION" className="text-gray-400 hover:text-[#FED700] transition-colors flex items-center gap-2">
                  <Icons.ChevronRight size={12} />
                  <span>Occasions & Reconditionnés A+</span>
                </Link>
              </li>
              <li>
                <Link href="/boutique?brand=ACCESSOIRE" className="text-gray-400 hover:text-[#FED700] transition-colors flex items-center gap-2">
                  <Icons.ChevronRight size={12} />
                  <span>Chargeurs Rapides 20W / 45W</span>
                </Link>
              </li>
              <li>
                <Link href="/boutique?trade=true" className="text-[#FED700] hover:underline font-semibold flex items-center gap-2">
                  <Icons.Repeat size={12} />
                  <span>Faire un Troc / Échange d'appareil</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3: Service Client & Sécurité */}
          <div>
            <h4 className="font-heading text-sm font-bold text-white uppercase tracking-wider mb-5 pb-2 border-b border-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FED700]"></span>
              Service Client
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/suivi" className="text-gray-400 hover:text-[#FED700] transition-colors flex items-center gap-2">
                  <Icons.Truck size={12} />
                  <span>Suivre ma commande en direct</span>
                </Link>
              </li>
              <li>
                <Link href="/favoris" className="text-gray-400 hover:text-[#FED700] transition-colors flex items-center gap-2">
                  <Icons.Heart size={12} />
                  <span>Ma Liste de Favoris</span>
                </Link>
              </li>
              <li>
                <Link href="/compte" className="text-gray-400 hover:text-[#FED700] transition-colors flex items-center gap-2">
                  <Icons.User size={12} />
                  <span>Mon Espace Client</span>
                </Link>
              </li>
              <li>
                <Link href="/compte/troc" className="text-gray-400 hover:text-[#FED700] transition-colors flex items-center gap-2">
                  <Icons.Repeat size={12} />
                  <span>Mes Propositions de Troc</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 4: Engagement & Confiance */}
          <div>
            <h4 className="font-heading text-sm font-bold text-white uppercase tracking-wider mb-5 pb-2 border-b border-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FED700]"></span>
              Paiements & Sécurité
            </h4>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Vos transactions sont 100% sécurisées. Payez facilement à la commande via Mobile Money ou Carte Bancaire.
            </p>

            {/* Badges Moyens de Paiement */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-white/10 hover:bg-white/20 p-2 rounded-md border border-gray-700 text-center transition-colors">
                <span className="text-[11px] font-bold text-[#FED700] block">MTN</span>
                <span className="text-[9px] text-gray-300 block">MoMo Bénin</span>
              </div>
              <div className="bg-white/10 hover:bg-white/20 p-2 rounded-md border border-gray-700 text-center transition-colors">
                <span className="text-[11px] font-bold text-[#0062BD] block">MOOV</span>
                <span className="text-[9px] text-gray-300 block">Money Bénin</span>
              </div>
              <div className="bg-white/10 hover:bg-white/20 p-2 rounded-md border border-gray-700 text-center transition-colors">
                <span className="text-[11px] font-bold text-emerald-400 block">KKIAPAY</span>
                <span className="text-[9px] text-gray-300 block">Agrégateur</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-950/40 p-2.5 rounded border border-emerald-800/60">
              <Icons.ShieldCheck size={16} />
              <span>Garantie authenticité & SAV local</span>
            </div>
          </div>
        </div>

        {/* Copyright & Mentions */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© 2026 {siteConfig.name}. Tous droits réservés. {siteConfig.city}, République du {siteConfig.country}.</p>
          <div className="flex items-center gap-4 text-gray-400">
            <span className="hover:text-gray-300 cursor-pointer">Conditions Générales de Vente</span>
            <span>•</span>
            <span className="hover:text-gray-300 cursor-pointer">Politique de Confidentialité</span>
            <span>•</span>
            <span className="hover:text-gray-300 cursor-pointer">Garantie & Retours</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
