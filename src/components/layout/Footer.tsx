import React from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';
import { siteConfig } from '@/lib/site-config';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#111827] text-gray-400 pt-12 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b border-gray-800 text-xs">
          {/* Colonne 1: Marque & Coordonnées */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Icons.BrandCart size={36} className="text-[#FED700] flex-shrink-0" />
              <span className="font-heading font-black text-2xl tracking-tight text-white">
                {siteConfig.name}
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed mb-5">
              {siteConfig.slogan}
            </p>

            <div className="flex items-start gap-3 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center text-gray-300 flex-shrink-0 mt-0.5">
                <Icons.Headset size={14} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Service Client & Conseils</p>
                <a href={`tel:${siteConfig.phone.replace(/\s+/g, '')}`} className="text-xs font-bold text-white hover:text-[#FED700] transition-colors">
                  {siteConfig.phone}
                </a>
              </div>
            </div>

            <div className="text-gray-400 space-y-1.5 pt-2">
              <p><span className="text-gray-500 font-medium">Adresse :</span> {siteConfig.address}</p>
              <p><span className="text-gray-500 font-medium">Email :</span> {siteConfig.email}</p>
              <p><span className="text-gray-500 font-medium">Horaires :</span> {siteConfig.openingHours}</p>
            </div>
          </div>

          {/* Colonne 2: Rayons & Smartphones */}
          <div>
            <h4 className="font-heading text-xs font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-gray-800">
              Rayons Phares
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/boutique?brand=IPHONE" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <Icons.ChevronRight size={12} className="text-gray-600" />
                  <span>Smartphones Apple iPhone</span>
                </Link>
              </li>
              <li>
                <Link href="/boutique?brand=SAMSUNG" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <Icons.ChevronRight size={12} className="text-gray-600" />
                  <span>Samsung Galaxy Série S & Fold</span>
                </Link>
              </li>
              <li>
                <Link href="/boutique?condition=OCCASION" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <Icons.ChevronRight size={12} className="text-gray-600" />
                  <span>Occasions & Reconditionnés A+</span>
                </Link>
              </li>
              <li>
                <Link href="/boutique?brand=ACCESSOIRE" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <Icons.ChevronRight size={12} className="text-gray-600" />
                  <span>Chargeurs & Accessoires</span>
                </Link>
              </li>
              <li>
                <Link href="/boutique?trade=true" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <Icons.ChevronRight size={12} className="text-gray-600" />
                  <span>Faire un Troc / Échange</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3: Service Client */}
          <div>
            <h4 className="font-heading text-xs font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-gray-800">
              Service Client
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/suivi" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <Icons.Truck size={12} className="text-gray-600" />
                  <span>Suivre ma commande</span>
                </Link>
              </li>
              <li>
                <Link href="/favoris" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <Icons.Heart size={12} className="text-gray-600" />
                  <span>Ma Liste de Favoris</span>
                </Link>
              </li>
              <li>
                <Link href="/compte" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <Icons.User size={12} className="text-gray-600" />
                  <span>Mon Espace Client</span>
                </Link>
              </li>
              <li>
                <Link href="/compte/troc" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <Icons.Repeat size={12} className="text-gray-600" />
                  <span>Mes Propositions de Troc</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 4: Paiements & Sécurité */}
          <div>
            <h4 className="font-heading text-xs font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-gray-800">
              Paiements & Sécurité
            </h4>
            <p className="text-gray-400 mb-4 leading-relaxed">
              Transactions 100% sécurisées via Mobile Money et Cartes Bancaires.
            </p>

            {/* Passerelles en version éteinte / feutrée monochrome */}
            <div className="flex flex-wrap items-center gap-4 my-4">
              <img
                src="/images/gateways/kkiapay.svg"
                alt="Kkiapay"
                title="Kkiapay Bénin"
                className="h-7 w-auto max-w-[110px] object-contain opacity-50 grayscale brightness-150 hover:opacity-100 hover:grayscale-0 hover:brightness-100 transition-all duration-300 cursor-pointer"
              />
              <img
                src="/images/gateways/fedapay.svg"
                alt="FedaPay"
                title="FedaPay Bénin"
                className="h-7 w-auto max-w-[110px] object-contain opacity-50 grayscale brightness-150 hover:opacity-100 hover:grayscale-0 hover:brightness-100 transition-all duration-300 cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2 text-[11px] text-gray-400 pt-2">
              <Icons.ShieldCheck size={14} className="text-gray-500" />
              <span>Garantie authenticité & SAV local</span>
            </div>
          </div>
        </div>

        {/* Copyright & Mentions */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-gray-500">
          <p className="text-center sm:text-left">© {new Date().getFullYear()} {siteConfig.name}. Tous droits réservés. {siteConfig.city}, République du {siteConfig.country}.</p>
          <div className="flex flex-wrap justify-center sm:justify-end items-center gap-x-4 gap-y-2 text-gray-500 text-center sm:text-right">
            <Link href="/cgv" className="hover:text-gray-300 transition-colors">Conditions Générales de Vente</Link>
            <span>•</span>
            <Link href="/confidentialite" className="hover:text-gray-300 transition-colors">Politique de Confidentialité</Link>
            <span>•</span>
            <Link href="/cgv#garantie" className="hover:text-gray-300 transition-colors">Garantie & Retours</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
