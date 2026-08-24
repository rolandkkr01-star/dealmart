import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import { Icons } from '@/components/ui/Icons';

export const metadata: Metadata = {
  title: `Politique de Confidentialité - ${siteConfig.name}`,
  description: `Politique de confidentialité et protection des données personnelles de ${siteConfig.name}, conforme aux directives de l'APDP et du Code du Numérique en République du Bénin.`,
};

export default function ConfidentialitePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Fil d'ariane */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <Link href="/" className="hover:text-[#0062BD] transition-colors">Accueil</Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold">Politique de Confidentialité</span>
      </nav>

      {/* En-tête */}
      <div className="border-b border-gray-200 pb-6 mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold mb-3">
          <Icons.ShieldCheck size={14} className="text-emerald-600" />
          <span>Protection des Données • Conformité APDP Bénin (Loi n° 2017-20 Livre V)</span>
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
            <Icons.Lock size={18} className="text-[#0062BD]" />
            1. Responsable du Traitement des Données
          </h2>
          <p className="mb-2">
            Les données à caractère personnel collectées sur ce site sont traitées par la société <strong>{siteConfig.legalName}</strong> (exploitant la marque <strong>{siteConfig.name}</strong>), domiciliée à {siteConfig.city}, République du Bénin, sous la supervision de l'Autorité de Protection des Données Personnelles (APDP).
          </p>
          <p className="text-xs text-gray-500">
            Délégué à la Protection des Données (DPO) : {siteConfig.email}.
          </p>
        </section>

        {/* Section 2 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
            <Icons.User size={18} className="text-[#0062BD]" />
            2. Données Collectées et Finalités
          </h2>
          <p className="mb-3">
            Nous ne collectons que les informations strictement indispensables à la bonne exécution de vos commandes et au suivi technique :
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-600 mb-3">
            <li><strong>Identité et Coordonnées :</strong> Nom, prénom, adresse email et numéro de téléphone (utilisés pour la confirmation de commande et la livraison à Cotonou et au Bénin).</li>
            <li><strong>Adresse de livraison :</strong> Ville, quartier et précisions d'acheminement.</li>
            <li><strong>Historique des commandes et demandes de troc :</strong> Suivi en temps réel de vos appareils et transactions.</li>
          </ul>
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-xs text-emerald-900">
            <strong>Sécurité Bancaire & Mobile Money :</strong> {siteConfig.name} ne stocke <strong>aucun numéro de carte bancaire, ni aucun code secret ou code PIN Mobile Money</strong>. Les transactions sont directement traitées via des passerelles agréées et certifiées PCI-DSS.
          </div>
        </section>

        {/* Section 3 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
            <Icons.ShieldCheck size={18} className="text-[#0062BD]" />
            3. Mesures de Sécurité et Chiffrement
          </h2>
          <p className="mb-2">
            Conformément aux plus hauts standards de sécurité informatique :
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600">
            <li>Les mots de passe sont chiffrés et hachés à l'aide de l'algorithme <strong>Argon2id</strong> hautement sécurisé.</li>
            <li>Toutes les communications entre votre navigateur et notre serveur sont protégées par le protocole <strong>HTTPS / TLS</strong>.</li>
            <li>Les sessions utilisateur sont sécurisées par des cookies HTTP-Only protégés contre les failles XSS et CSRF.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
            <Icons.Sliders size={18} className="text-[#0062BD]" />
            4. Vos Droits (Accès, Rectification, Suppression)
          </h2>
          <p className="mb-2">
            Conformément aux dispositions du Livre V du Code du Numérique du Bénin, vous disposez des droits suivants sur vos données personnelles :
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600 mb-3">
            <li><strong>Droit d'accès et d'information :</strong> Consulter à tout moment les données rattachées à votre compte dans votre espace client.</li>
            <li><strong>Droit de rectification :</strong> Modifier directement vos adresses et numéros de téléphone.</li>
            <li><strong>Droit à l'effacement :</strong> Demander la suppression définitive de votre compte et de vos données en nous écrivant à {siteConfig.email}.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
            <Icons.PhoneCall size={18} className="text-[#0062BD]" />
            5. Contact et Réclamations
          </h2>
          <p className="text-xs text-gray-600">
            Pour toute question relative à vos données personnelles, vous pouvez contacter notre service d'assistance au <strong>{siteConfig.phone}</strong> ou par email à <strong>{siteConfig.email}</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
