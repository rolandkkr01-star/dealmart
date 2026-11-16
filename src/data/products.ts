import { Product, PromoCode } from '@/types';

// La liste de base est vide par défaut : tous les produits sont gérés dynamiquement via la BDD Prisma et le CRUD Admin
export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_PROMO_CODES: PromoCode[] = [
  {
    code: 'HONIARA2026',
    discountType: 'FIXED_AMOUNT',
    discountValue: 50,
    minOrderAmount: 300,
    isActive: true,
  },
  {
    code: 'DEALMART5',
    discountType: 'PERCENTAGE',
    discountValue: 5,
    minOrderAmount: 150,
    isActive: true,
  },
];

export const PROMO_CODES: PromoCode[] = INITIAL_PROMO_CODES;
