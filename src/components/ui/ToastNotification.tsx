'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';

export const ToastNotification: React.FC = () => {
  const { notification } = useCart();

  if (!notification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="bg-[#1D2129] text-white px-5 py-3.5 rounded-xl shadow-2xl border border-[#F1B20B] flex items-center gap-3 text-xs font-semibold">
        <span>{notification}</span>
      </div>
    </div>
  );
};
