import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { TradeProvider } from '@/context/TradeContext';
import { OrderProvider } from '@/context/OrderContext';
import { AppShell } from '@/components/layout/AppShell';
import { siteConfig } from '@/lib/site-config';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  weight: ['500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: `${siteConfig.name} - ${siteConfig.slogan}`,
  description: `Boutique n°1 au ${siteConfig.country} pour l'achat d'iPhone et Samsung Galaxy avec garantie constructeur, livraison express à ${siteConfig.city} et paiement sécurisé Mobile Money.`,
  keywords: ['smartphone Cotonou', 'iPhone Bénin', 'Samsung Galaxy Cotonou', 'troc téléphone Bénin', siteConfig.name, 'achat téléphone MoMo'],
  openGraph: {
    title: `${siteConfig.name} - L'excellence technologique garantie au ${siteConfig.country}`,
    description: `Vente d'iPhones, Samsung et accessoires 100% authentiques. Livraison express à ${siteConfig.city} et reprise de votre ancien téléphone en troc.`,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: 'fr_FR',
    type: 'website',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLdOrganization = {
    '@context': 'https://schema.org',
    '@type': 'ElectronicsStore',
    name: siteConfig.name,
    description: `Boutique de smartphones iPhone et Samsung neufs garantis et accessoires certifiés au ${siteConfig.country}.`,
    url: siteConfig.url,
    telephone: siteConfig.phone,
    priceRange: '15000 XOF - 1500000 XOF',
    address: {
      '@type': 'PostalAddress',
      addressLocality: siteConfig.city,
      addressCountry: 'BJ',
    },
    currenciesAccepted: 'XOF',
    paymentAccepted: 'Cash, Mobile Money (MTN, Moov), Kkiapay, Credit Card',
  };

  return (
    <html lang="fr" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased" suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            <TradeProvider>
              <OrderProvider>
                <AppShell>
                  {children}
                </AppShell>
              </OrderProvider>
            </TradeProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
