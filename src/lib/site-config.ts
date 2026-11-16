/**
 * Configuration globale du site et des paramètres de l'entreprise DealMart.
 * Toutes les valeurs proviennent des variables d'environnement (.env)
 * avec des valeurs par défaut pour les Îles Salomon.
 */
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_STORE_NAME || 'DealMart',
  legalName: process.env.NEXT_PUBLIC_STORE_LEGAL_NAME || 'DealMart Solomon Islands Ltd',
  slogan: process.env.NEXT_PUBLIC_STORE_SLOGAN || 'Marketplace N°1 aux Îles Salomon • Électronique, Beauté, Mode & Maison',
  phone: process.env.NEXT_PUBLIC_STORE_PHONE || '+677 7465588',
  whatsapp: process.env.NEXT_PUBLIC_STORE_WHATSAPP || '+677 7465588',
  email: process.env.NEXT_PUBLIC_STORE_EMAIL || 'contact@dealmart.sb',
  address: process.env.NEXT_PUBLIC_STORE_ADDRESS || 'Kukum Highway, Honiara, Solomon Islands',
  city: process.env.NEXT_PUBLIC_STORE_CITY || 'Honiara',
  country: process.env.NEXT_PUBLIC_STORE_COUNTRY || 'Solomon Islands',
  openingHours: process.env.NEXT_PUBLIC_STORE_OPENING_HOURS || 'Lun - Sam : 08h30 - 18h00',
  currency: process.env.NEXT_PUBLIC_STORE_CURRENCY || 'SI$',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
};
