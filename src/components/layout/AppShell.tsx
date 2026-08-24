'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { TopUtilityBar } from '@/components/layout/TopUtilityBar';
import { Header } from '@/components/layout/Header';
import { MainNav } from '@/components/layout/MainNav';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ToastNotification } from '@/components/ui/ToastNotification';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return (
      <>
        {children}
        <ToastNotification />
      </>
    );
  }

  return (
    <>
      <TopUtilityBar />
      <Header />
      <MainNav />

      <main className="flex-1 bg-[#F8F9FA] w-full max-w-full overflow-x-hidden">
        {children}
      </main>

      <CartDrawer />
      <ToastNotification />
      <Footer />
    </>
  );
}
