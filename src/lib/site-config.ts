/**
 * Global site and business configuration for DealMart.
 * All values are loaded from environment variables (.env)
 * with reliable English defaults for the Solomon Islands.
 */
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_STORE_NAME || 'DealMart',
  legalName: process.env.NEXT_PUBLIC_STORE_LEGAL_NAME || 'DealMart Solomon Islands Ltd',
  slogan: process.env.NEXT_PUBLIC_STORE_SLOGAN || "Solomon Islands' #1 Marketplace • Electronics, Beauty, Fashion & Home",
  phone: process.env.NEXT_PUBLIC_STORE_PHONE || '+677 7465588',
  whatsapp: process.env.NEXT_PUBLIC_STORE_WHATSAPP || '+677 7465588',
  email: process.env.NEXT_PUBLIC_STORE_EMAIL || 'contact@dealmart.sb',
  address: process.env.NEXT_PUBLIC_STORE_ADDRESS || 'Kukum Transol Building, Honiara, Solomon Islands',
  city: process.env.NEXT_PUBLIC_STORE_CITY || 'Honiara',
  country: process.env.NEXT_PUBLIC_STORE_COUNTRY || 'Solomon Islands',
  openingHours: process.env.NEXT_PUBLIC_STORE_OPENING_HOURS || 'Mon - Sat: 8:30 AM - 7:30 PM',
  currency: process.env.NEXT_PUBLIC_STORE_CURRENCY || 'SI$',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
};
