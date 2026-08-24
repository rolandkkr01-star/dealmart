/**
 * Configuration globale du site et des paramètres de l'entreprise.
 * Toutes les valeurs proviennent des variables d'environnement (.env)
 * avec des valeurs par défaut sécurisées.
 */
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_STORE_NAME || 'TechPhone229',
  legalName: process.env.NEXT_PUBLIC_STORE_LEGAL_NAME || 'TechPhone229 SARL',
  slogan: process.env.NEXT_PUBLIC_STORE_SLOGAN || 'Smartphones Neufs & Accessoires Authentiques au Bénin',
  phone: process.env.NEXT_PUBLIC_STORE_PHONE || '+229 97 00 00 00',
  whatsapp: process.env.NEXT_PUBLIC_STORE_WHATSAPP || '+229 97 00 00 00',
  email: process.env.NEXT_PUBLIC_STORE_EMAIL || 'contact@techphone229.bj',
  address: process.env.NEXT_PUBLIC_STORE_ADDRESS || 'Cadjehoun, Cotonou, Bénin',
  city: process.env.NEXT_PUBLIC_STORE_CITY || 'Cotonou',
  country: process.env.NEXT_PUBLIC_STORE_COUNTRY || 'Bénin',
  openingHours: process.env.NEXT_PUBLIC_STORE_OPENING_HOURS || 'Lun - Sam : 08h30 - 19h30',
  currency: process.env.NEXT_PUBLIC_STORE_CURRENCY || 'FCFA',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
};
