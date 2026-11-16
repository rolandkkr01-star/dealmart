import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import { Icons } from '@/components/ui/Icons';

export const metadata: Metadata = {
  title: `Conditions Générales de Vente - ${siteConfig.name}`,
  description: `Conditions Générales de Vente et d'utilisation de ${siteConfig.name}, applicables aux transactions commerciales aux Îles Salomon.`,
};

export default function CGVPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Fil d'ariane */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <Link href="/" className="hover:text-[#0054A4] transition-colors">
          Accueil
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold">Conditions Générales de Vente</span>
      </nav>

      {/* En-tête */}
      <div className="border-b border-gray-200 pb-6 mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-[#0054A4] px-3 py-1 rounded-full text-xs font-bold mb-3">
          <Icons.ShieldCheck size={14} />
          <span>Cadre Commercial • Îles Salomon (Solomon Islands)</span>
        </div>
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-gray-900 tracking-tight">
          Conditions Générales de Vente (CGV)
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Applicable à l'ensemble des commandes passées sur {siteConfig.name}.
        </p>
      </div>

      {/* Contenu structuré */}
      <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
        {/* Article 1 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#F1B20B] text-[#1D2129] text-xs font-black flex items-center justify-center">
              1
            </span>
            Objet et Identité de l'Exploitant
          </h2>
          <p className="mb-2">
            Les présentes Conditions Générales de Vente régissent l'ensemble des transactions commerciales conclues sur la marketplace en ligne <strong>{siteConfig.name}</strong>, exploitée par la société <strong>{siteConfig.legalName}</strong> à {siteConfig.city}, Îles Salomon.
          </p>
          <p>
            <strong>Contact officiel :</strong> {siteConfig.email} • Téléphone : {siteConfig.phone} • Adresse : {siteConfig.address}.
          </p>
        </section>

        {/* Article 2 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#F1B20B] text-[#1D2129] text-xs font-black flex items-center justify-center">
              2
            </span>
            Catalogue de Produits et Garantie Qualité
          </h2>
          <p className="mb-3">
            {siteConfig.name} est une place de marché généraliste proposant des produits dans les rayons Électronique & Gadgets, Beauté & Soins, Mode & Accessoires, ainsi que Maison & Déco. Chaque article fait l'objet d'un contrôle de qualité rigoureux :
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-600 mb-3">
            <li><strong>Neuf Scellé :</strong> Produit sous emballage d'origine scellé par le fabricant avec garantie constructeur.</li>
            <li><strong>Neuf Déballé / Certifié :</strong> Produit d'origine en parfait état esthétique et opérationnel, testé par nos soins.</li>
            <li><strong>Occasion Contrôlée :</strong> Article contrôlé et testé sur nos points techniques d'inspection.</li>
          </ul>
          <p className="text-xs bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-900">
            <strong>Garantie Authenticité :</strong> Tout produit livré non conforme ou défectueux fait l'objet d'un remplacement rapide ou d'un remboursement intégral.
          </p>
        </section>

        {/* Article 3 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#F1B20B] text-[#1D2129] text-xs font-black flex items-center justify-center">
              3
            </span>
            Devise et Modalités de Paiement
          </h2>
          <p className="mb-2">
            Tous les prix sont affichés en <strong>Dollars des Îles Salomon (SI$ / SBD)</strong> toutes taxes comprises.
          </p>
          <p className="mb-2">
            Les modes de règlement acceptés sont :
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600">
            <li><strong>Paiement à la livraison (Cash on Delivery - COD) :</strong> Règlement en espèces au coursier lors de la remise physique de la commande à Honiara et environs.</li>
            <li><strong>Virement bancaire direct :</strong> Règlement auprès des banques locales (Bank South Pacific - BSP, ANZ) avec confirmation par numéro de référence.</li>
            <li><strong>Carte bancaire (Visa / Mastercard) :</strong> Règlement sécurisé en ligne.</li>
          </ul>
        </section>

        {/* Article 4 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#F1B20B] text-[#1D2129] text-xs font-black flex items-center justify-center">
              4
            </span>
            Livraison et Expédition
          </h2>
          <p className="mb-2">
            Les livraisons sont opérées sur l'ensemble de l'archipel :
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600">
            <li><strong>Honiara & Guadalcanal :</strong> Livraison standard sous 24h à 48h ouvrées (livraison gratuite dès SI$ 500 d'achats).</li>
            <li><strong>Provinces (Western, Malaita, Isabel, etc.) :</strong> Expédition inter-îles par transport maritime ou fret aérien selon les liaisons régulières (Gizo, Noro, Auki, etc.).</li>
          </ul>
        </section>

        {/* Article 5 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#F1B20B] text-[#1D2129] text-xs font-black flex items-center justify-center">
              5
            </span>
            Droit Applicable et Résolution des Différends
          </h2>
          <p className="mb-2">
            Les présentes conditions générales sont régies par les <strong>lois en vigueur aux Îles Salomon (Solomon Islands)</strong>.
          </p>
          <p className="text-xs text-gray-600">
            En cas de réclamation, le client est invité à contacter en priorité notre service client au {siteConfig.phone} ou par email à {siteConfig.email}. À défaut de conciliation amiable, les tribunaux compétents de Honiara seront seuls compétents.
          </p>
        </section>
      </div>
    </div>
  );
}
