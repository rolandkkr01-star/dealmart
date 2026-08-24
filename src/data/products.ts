import { Product, PromoCode } from '@/types';

// La liste de base est vide par défaut : tous les produits sont gérés dynamiquement via la BDD Prisma et le CRUD Admin
export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_PROMO_CODES: PromoCode[] = [
  {
    code: 'COTONOU229',
    discountType: 'FIXED_AMOUNT',
    discountValue: 10000,
    minOrderAmount: 100000,
    isActive: true,
  },
  {
    code: 'BIENVENUE5',
    discountType: 'PERCENTAGE',
    discountValue: 5,
    minOrderAmount: 50000,
    isActive: true,
  },
];

export const PROMO_CODES: PromoCode[] = INITIAL_PROMO_CODES;
