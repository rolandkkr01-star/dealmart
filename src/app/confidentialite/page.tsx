import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import { Icons } from '@/components/ui/Icons';

export const metadata: Metadata = {
  title: `Politique de Confidentialité - ${siteConfig.name}`,
  description: `Politique de confidentialité et protection des données personnelles de ${siteConfig.name} aux Îles Salomon.`,
};

export default function ConfidentialitePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Fil d'ariane */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <Link href="/" className="hover:text-[#0054A4] transition-colors">
          Accueil
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold">Politique de Confidentialité</span>
      </nav>

      {/* En-tête */}
      <div className="border-b border-gray-200 pb-6 mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold mb-3">
          <Icons.ShieldCheck size={14} className="text-emerald-600" />
          <span>Protection des Données & Vie Privée • Îles Salomon</span>
        </div>
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-gray-900 tracking-tight">
          Politique de Confidentialité
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Transparence et sécurité de vos données personnelles sur la plateforme {siteConfig.name}.
        </p>
      </div>

      {/* Contenu structuré */}
      <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
        {/* Section 1 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
            <Icons.Lock size={18} className="text-[#0054A4]" />
            1. Responsable du Traitement des Données
          </h2>
          <p className="mb-2">
            Les données personnelles collectées sur ce site sont traitées par la société <strong>{siteConfig.legalName}</strong> (exploitant de <strong>{siteConfig.name}</strong>), domiciliée à {siteConfig.city}, Îles Salomon.
          </p>
          <p className="text-xs text-gray-500">
            Contact DPO / Confidentialité : {siteConfig.email}.
          </p>
        </section>

        {/* Section 2 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
            <Icons.User size={18} className="text-[#0054A4]" />
            2. Données Collectées et Finalités
          </h2>
          <p className="mb-3">
            Nous collectons uniquement les informations requises pour traiter vos commandes et assurer la livraison :
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-600 mb-3">
            <li><strong>Identité et Coordonnées :</strong> Nom, prénom, adresse email et numéro de téléphone (+677 pour le suivi des livraisons).</li>
            <li><strong>Adresse de livraison :</strong> Ville, province, quartier ou boîte postale aux Îles Salomon.</li>
            <li><strong>Historique des commandes :</strong> Suivi de vos achats et factures électroniques.</li>
          </ul>
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-xs text-emerald-900">
            <strong>Sécurité des Paiements :</strong> {siteConfig.name} ne stocke aucune coordonnée bancaire ni aucun mot de passe de transaction. Les paiements en ligne sont traités via des passerelles sécurisées conformes aux normes internationales PCI-DSS.
          </div>
        </section>

        {/* Section 3 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
            <Icons.ShieldCheck size={18} className="text-[#0054A4]" />
            3. Mesures de Sécurité et Chiffrement
          </h2>
          <p className="mb-2">
            Nous appliquons des mesures de protection strictes :
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600">
            <li>Mots de passe hachés à l'aide de l'algorithme <strong>Argon2id</strong>.</li>
            <li>Toutes les communications serveur-client sont chiffrées via <strong>HTTPS / TLS</strong>.</li>
            <li>Sessions sécurisées par des cookies HTTP-Only protégés contre les failles XSS et CSRF.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
            <Icons.Sliders size={18} className="text-[#0054A4]" />
            4. Vos Droits
          </h2>
          <p className="mb-2">
            Vous conservez à tout moment un droit d'accès, de rectification et d'effacement de vos données :
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600 mb-3">
            <li><strong>Accès et modification :</strong> Directement via votre espace client {siteConfig.name}.</li>
            <li><strong>Suppression de compte :</strong> Sur simple demande par email à {siteConfig.email}.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
            <Icons.PhoneCall size={18} className="text-[#0054A4]" />
            5. Contact
          </h2>
          <p className="text-xs text-gray-600">
            Pour toute question concernant notre politique de confidentialité, contactez notre équipe au <strong>{siteConfig.phone}</strong> ou par email à <strong>{siteConfig.email}</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
