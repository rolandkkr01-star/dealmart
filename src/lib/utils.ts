import { ProductCondition, OrderStatus, TradeOfferStatus } from '@/types';

/**
 * Formate un montant en FCFA (XOF) sans virgule décimale, avec séparateurs de milliers.
 */
export function formatFCFA(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) return '0 FCFA';
  const rounded = Math.round(amount);
  return `${rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA`;
}

/**
 * Calcule le pourcentage de réduction entre l'ancien prix et le prix promo.
 */
export function getDiscountPercentage(basePrice: number, promoPrice?: number): number | null {
  if (!promoPrice || promoPrice >= basePrice) return null;
  return Math.round(((basePrice - promoPrice) / basePrice) * 100);
}

/**
 * Détails et styles pour l'état d'un produit (Obligatoire selon les règles de confiance)
 */
export function getConditionBadgeInfo(condition: ProductCondition): {
  label: string;
  badgeClass: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  iconName: string;
  description: string;
  badgeShort: string;
} {
  switch (condition) {
    case 'NEUF_SCELLE':
      return {
        label: 'Neuf Scellé Constructeur',
        badgeShort: 'Neuf Scellé',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold',
        badgeBg: '#ECFDF5',
        badgeBorder: '#6EE7B7',
        badgeText: '#047857',
        iconName: 'ShieldCheck',
        description: 'Produit 100% neuf, boîte d\'origine scellée sous blister d\'usine.'
      };
    case 'NEUF_NON_SCELLE':
      return {
        label: 'Neuf Reconditionné Certifié',
        badgeShort: 'Reconditionné A+',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-300 font-semibold',
        badgeBg: '#EFF6FF',
        badgeBorder: '#93C5FD',
        badgeText: '#1D4ED8',
        iconName: 'Sparkles',
        description: 'Appareil testé sur 45 points de contrôle, état neuf irréprochable avec garantie.'
      };
    case 'OCCASION':
      return {
        label: 'Occasion Garantie TechPhone',
        badgeShort: 'Occasion Vérifiée',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-300 font-semibold',
        badgeBg: '#FFFBEB',
        badgeBorder: '#FCD34D',
        badgeText: '#92400E',
        iconName: 'CheckCircle2',
        description: 'Appareil d\'occasion authentifié, batterie saine certifiée (>85%), révisé et garanti.'
      };
  }
}

/**
 * Couleurs et libellés pour les statuts de commande
 */
export function getOrderStatusInfo(status: OrderStatus): {
  label: string;
  className: string;
} {
  switch (status) {
    case 'PENDING':
      return { label: 'En attente de paiement', className: 'bg-amber-100 text-amber-800 border-amber-200' };
    case 'PAID':
      return { label: 'Payée (En préparation)', className: 'bg-blue-100 text-blue-800 border-blue-200' };
    case 'PROCESSING':
      return { label: 'En cours de préparation', className: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
    case 'SHIPPED':
      return { label: 'Expédiée (En livraison)', className: 'bg-purple-100 text-purple-800 border-purple-200' };
    case 'DELIVERED':
      return { label: 'Livrée avec succès', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    case 'CANCELLED':
      return { label: 'Annulée', className: 'bg-red-100 text-red-800 border-red-200' };
    case 'REFUNDED':
      return { label: 'Remboursée', className: 'bg-gray-100 text-gray-800 border-gray-200' };
  }
}

/**
 * Couleurs et libellés pour les statuts de proposition de troc
 */
export function getTradeStatusInfo(status: TradeOfferStatus): {
  label: string;
  className: string;
} {
  switch (status) {
    case 'PENDING':
      return { label: 'En cours d\'examen', className: 'bg-amber-100 text-amber-800 border-amber-300' };
    case 'ACCEPTED':
      return { label: 'Offre acceptée !', className: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    case 'COUNTERED':
      return { label: 'Contre-proposition reçue', className: 'bg-blue-100 text-blue-800 border-blue-300' };
    case 'REJECTED':
      return { label: 'Offre refusée', className: 'bg-red-100 text-red-800 border-red-300' };
    case 'COMPLETED':
      return { label: 'Troc finalisé', className: 'bg-purple-100 text-purple-800 border-purple-300' };
  }
}

/**
 * Génère un identifiant de commande lisible client (ex: TP229-847291)
 */
export function generateOrderNumber(): string {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `TP229-${randomDigits}`;
}

/**
 * Convertit un texte en slug URL propre
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}
