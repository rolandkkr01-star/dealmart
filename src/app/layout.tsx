import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { OrderProvider } from '@/context/OrderContext';
import { AppShell } from '@/components/layout/AppShell';
import { siteConfig } from '@/lib/site-config';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: `${siteConfig.name} - ${siteConfig.slogan}`,
  description: `${siteConfig.name} is Solomon Islands' premier online marketplace for Electronics, Beauty, Cosmetics, Fashion and Home essentials. Fast delivery in ${siteConfig.city} and nationwide.`,
  keywords: [
    siteConfig.name,
    'Dealmart Solomon Islands',
    'online shopping Honiara',
    'electronics Solomon Islands',
    'cosmetics Honiara',
    'beauty Solomon Islands',
    'fashion Solomon Islands'
  ],
  openGraph: {
    title: `${siteConfig.name} - ${siteConfig.slogan}`,
    description: `Shop Electronics, Beauty, Cosmetics, Fashion and more with fast delivery in Honiara and across the Solomon Islands.`,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: 'en_US',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/dealmart_favicon_transparent.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', type: 'image/x-icon' },
    ],
    shortcut: '/favicon.ico',
    apple: '/dealmart_favicon_fond_clair_512.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLdOrganization = {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    name: siteConfig.name,
    description: siteConfig.slogan,
    url: siteConfig.url,
    telephone: siteConfig.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.address,
      addressLocality: siteConfig.city,
      addressCountry: 'SB',
    },
    currenciesAccepted: 'SBD',
    paymentAccepted: 'Cash on Delivery, Direct Bank Transfer (BSP), Credit Card',
  };

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased" suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            <OrderProvider>
              <AppShell>
                {children}
              </AppShell>
            </OrderProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
