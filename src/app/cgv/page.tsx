import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import { Icons } from '@/components/ui/Icons';

export const metadata: Metadata = {
  title: `Conditions Générales de Vente - ${siteConfig.name}`,
  description: `Conditions Générales de Vente et d'utilisation de ${siteConfig.name}, applicables aux transactions en ligne en République du Bénin conformément au Code du Numérique.`,
};

export default function CGVPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Fil d'ariane */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <Link href="/" className="hover:text-[#0062BD] transition-colors">Accueil</Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold">Conditions Générales de Vente</span>
      </nav>

      {/* En-tête */}
      <div className="border-b border-gray-200 pb-6 mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-[#0062BD] px-3 py-1 rounded-full text-xs font-bold mb-3">
          <Icons.ShieldCheck size={14} />
          <span>Cadre Légal • Code du Numérique du Bénin (Loi n° 2017-20)</span>
        </div>
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-gray-900 tracking-tight">
          Conditions Générales de Vente (CGV)
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Dernière mise à jour : 23 Août 2026 • Applicable à l'ensemble des commandes passées sur {siteConfig.name}.
        </p>
      </div>

      {/* Contenu structuré */}
      <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
        {/* Article 1 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#FED700] text-[#1D2129] text-xs font-black flex items-center justify-center">1</span>
            Objet et Identité du Vendeur
          </h2>
          <p className="mb-2">
            Les présentes Conditions Générales de Vente régissent l'ensemble des transactions commerciales et des contrats électroniques conclus via la plateforme <strong>{siteConfig.name}</strong>, exploitée à {siteConfig.city}, République du Bénin.
          </p>
          <p>
            <strong>Contact officiel :</strong> {siteConfig.email} • Téléphone : {siteConfig.phone} • Adresse : {siteConfig.address}.
          </p>
        </section>

        {/* Article 2 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#FED700] text-[#1D2129] text-xs font-black flex items-center justify-center">2</span>
            Produits et Garantie d'Authenticité
          </h2>
          <p className="mb-3">
            {siteConfig.name} commercialise exclusivement des smartphones (Apple iPhone, Samsung Galaxy) et accessoires d'origine. Chaque fiche produit précise l'état certifié de l'appareil :
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-600 mb-3">
            <li><strong>Neuf Scellé :</strong> Appareil neuf dans son carton d'origine scellé avec garantie constructeur complète (12 mois).</li>
            <li><strong>Neuf non scellé / Reconditionné A+ :</strong> Appareil reconditionné certifié 100% fonctionnel, batterie et composants d'origine testés (garantie 6 mois).</li>
            <li><strong>Occasion Certifiée :</strong> Appareil vérifié sur plus de 30 points techniques par nos techniciens à Cotonou (garantie 3 mois).</li>
          </ul>
          <p className="text-xs bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-900">
            <strong>Engagement Zéro Contrefaçon :</strong> Tout article non conforme ou présentant une anomalie d'authenticité donne lieu à un remboursement intégral immédiat.
          </p>
        </section>

        {/* Article 3 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#FED700] text-[#1D2129] text-xs font-black flex items-center justify-center">3</span>
            Prix et Modalités de Paiement
          </h2>
          <p className="mb-2">
            Tous les prix sont affichés en <strong>Francs CFA (FCFA / XOF)</strong> toutes taxes comprises. Les prix sont fermes et définitifs lors de la validation de la commande.
          </p>
          <p className="mb-2">
            Le règlement s'effectue de manière sécurisée par les moyens suivants :
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600">
            <li>Mobile Money : <strong>MTN Mobile Money Bénin</strong> et <strong>Moov Money Bénin</strong> via passerelle sécurisée Kkiapay.</li>
            <li>Paiement à la livraison après inspection physique de l'appareil (disponible sur Cotonou et Abomey-Calavi).</li>
          </ul>
        </section>

        {/* Article 4 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#FED700] text-[#1D2129] text-xs font-black flex items-center justify-center">4</span>
            Livraison et Délais
          </h2>
          <p className="mb-2">
            Les livraisons sont assurées dans les conditions suivantes :
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600">
            <li><strong>Cotonou et environs immédiats :</strong> Livraison express en moins de 3 heures ouvrées.</li>
            <li><strong>Abomey-Calavi, Porto-Novo, Ouidah :</strong> Livraison le jour même (avant 18h).</li>
            <li><strong>Autres villes du Bénin (Parakou, Bohicon, Natitingou, etc.) :</strong> Expédition sous 24h à 48h via nos transporteurs partenaires agréés.</li>
          </ul>
        </section>

        {/* Article 5 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#FED700] text-[#1D2129] text-xs font-black flex items-center justify-center">5</span>
            Service de Troc et Reprise d'Appareil
          </h2>
          <p className="mb-2">
            Pour les articles marqués « Éligible au Troc », l'acheteur peut soumettre son ancien smartphone en compensation partielle ou totale.
          </p>
          <p className="text-xs text-gray-600">
            L'évaluation finale de l'appareil repris nécessite une vérification physique par nos techniciens (état de l'écran, batterie, Face ID / Touch ID, statut iCloud / compte Google). La transaction de troc ne devient définitive qu'après accord mutuel des deux parties.
          </p>
        </section>

        {/* Article 6 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#FED700] text-[#1D2129] text-xs font-black flex items-center justify-center">6</span>
            Droit Applicable et Règlement des Litiges
          </h2>
          <p className="mb-2">
            Les présentes CGV sont soumises au <strong>droit de la République du Bénin</strong>, notamment aux dispositions de la <strong>Loi n° 2017-20 portant Code du Numérique</strong>.
          </p>
          <p className="text-xs text-gray-600">
            En cas de contestation ou de réclamation, une solution amiable est privilégiée en contactant notre support client au {siteConfig.phone}. À défaut de résolution amiable, les tribunaux compétents de Cotonou seront seuls habilités à trancher le litige.
          </p>
        </section>
      </div>
    </div>
  );
}
