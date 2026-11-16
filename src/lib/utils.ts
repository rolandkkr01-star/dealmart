import { ProductCondition, OrderStatus } from '@/types';
import { siteConfig } from '@/lib/site-config';

/**
 * Formats an amount in the official currency (SI$ for Solomon Islands).
 */
export function formatPrice(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) return `${siteConfig.currency} 0`;
  const rounded = Math.round(amount);
  return `${siteConfig.currency} ${rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

/**
 * Compatibility alias for legacy code
 */
export function formatFCFA(amount: number): string {
  return formatPrice(amount);
}

/**
 * Calculates discount percentage between base price and promo price.
 */
export function getDiscountPercentage(basePrice: number, promoPrice?: number): number | null {
  if (!promoPrice || promoPrice >= basePrice) return null;
  return Math.round(((basePrice - promoPrice) / basePrice) * 100);
}

/**
 * Details and badge styles for product condition
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
        label: 'Brand New Factory Sealed',
        badgeShort: 'Brand New',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold',
        badgeBg: '#ECFDF5',
        badgeBorder: '#6EE7B7',
        badgeText: '#047857',
        iconName: 'ShieldCheck',
        description: '100% genuine product, unopened in original factory sealed box.'
      };
    case 'NEUF_NON_SCELLE':
      return {
        label: 'Certified Refurbished (Grade A+)',
        badgeShort: 'Refurbished A+',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-300 font-semibold',
        badgeBg: '#EFF6FF',
        badgeBorder: '#93C5FD',
        badgeText: '#1D4ED8',
        iconName: 'Sparkles',
        description: 'Tested across 45 inspection points, flawless condition with warranty.'
      };
    case 'OCCASION':
      return {
        label: 'Certified Pre-Owned & Guaranteed',
        badgeShort: 'Verified Pre-Owned',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-300 font-semibold',
        badgeBg: '#FFFBEB',
        badgeBorder: '#FCD34D',
        badgeText: '#92400E',
        iconName: 'CheckCircle2',
        description: 'Authenticated pre-owned device, certified battery health (>85%), inspected and guaranteed.'
      };
  }
}

/**
 * Colors and English labels for order statuses
 */
export function getOrderStatusInfo(status: OrderStatus): {
  label: string;
  className: string;
} {
  switch (status) {
    case 'PENDING':
      return { label: 'Pending Payment', className: 'bg-amber-100 text-amber-800 border-amber-200' };
    case 'PAID':
      return { label: 'Paid (Processing)', className: 'bg-blue-100 text-blue-800 border-blue-200' };
    case 'PROCESSING':
      return { label: 'In Preparation', className: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
    case 'SHIPPED':
      return { label: 'Out for Delivery', className: 'bg-purple-100 text-purple-800 border-purple-200' };
    case 'DELIVERED':
      return { label: 'Delivered', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    case 'CANCELLED':
      return { label: 'Cancelled', className: 'bg-red-100 text-red-800 border-red-200' };
    case 'REFUNDED':
      return { label: 'Refunded', className: 'bg-gray-100 text-gray-800 border-gray-200' };
  }
}


/**
 * Génère un identifiant de commande lisible client (ex: DM-847291)
 */
export function generateOrderNumber(): string {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `DM-${randomDigits}`;
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
