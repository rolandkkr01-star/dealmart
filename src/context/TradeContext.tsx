'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { TradeOffer, TradeOfferStatus, ProductCondition } from '@/types';

interface TradeContextType {
  tradeOffers: TradeOffer[];
  userOffers: TradeOffer[];
  submitTradeOffer: (offer: Omit<TradeOffer, 'id' | 'createdAt' | 'status'>) => string;
  updateTradeOfferStatus: (id: string, status: TradeOfferStatus, adminNote?: string, counterOfferAmount?: number) => void;
  getOfferById: (id: string) => TradeOffer | undefined;
}

const INITIAL_TRADE_OFFERS: TradeOffer[] = [
  {
    id: 'TR-2024-001',
    customerName: 'Ablam Dossou',
    customerPhone: '+229 97 12 34 56',
    customerEmail: 'ablam.dossou@gmail.com',
    customerCity: 'Cotonou (Cadjehoun)',
    productId: 'prod-iphone-15-pro-max',
    productName: 'iPhone 15 Pro Max 256Go Titane Naturel',
    productImage: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
    targetProductPrice: 850000,
    offeredDeviceModel: 'iPhone 13 Pro Max 128Go Graphite',
    offeredDeviceDescription: 'Très bon état, batterie à 87%, écran d\'origine sans fissure, légères micro-rayures sur le contour. Fourni avec boîte.',
    offeredDeviceCondition: 'OCCASION',
    offeredDevicePhotos: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80'
    ],
    complementDirection: 'CLIENT_TO_STORE',
    cashComplement: 380000,
    status: 'PENDING',
    createdAt: '2024-03-20T14:32:00.000Z'
  },
  {
    id: 'TR-2024-002',
    customerName: 'Grâce Houndété',
    customerPhone: '+229 95 88 77 66',
    customerEmail: 'grace.h@yahoo.fr',
    customerCity: 'Abomey-Calavi',
    productId: 'prod-samsung-s24-ultra',
    productName: 'Samsung Galaxy S24 Ultra 512Go Gris Titane',
    productImage: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80',
    targetProductPrice: 750000,
    offeredDeviceModel: 'Samsung Galaxy S22 Ultra 256Go Noir',
    offeredDeviceDescription: 'Écran parfait avec protège-écran posé depuis le premier jour. S-Pen fonctionnel.',
    offeredDeviceCondition: 'OCCASION',
    offeredDevicePhotos: [
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80'
    ],
    complementDirection: 'CLIENT_TO_STORE',
    cashComplement: 420000,
    status: 'COUNTERED',
    adminNote: 'Votre S22 Ultra est évalué à 310 000 FCFA après inspection préliminaire des photos. Nous vous proposons un complément de 440 000 FCFA pour le S24 Ultra 512Go Neuf Scellé.',
    counterComplementDirection: 'CLIENT_TO_STORE',
    counterOfferAmount: 440000,
    createdAt: '2024-03-18T10:15:00.000Z'
  }
];

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export const TradeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tradeOffers, setTradeOffers] = useState<TradeOffer[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const storeVersion = localStorage.getItem('techphone229_store_v');
      if (storeVersion === '2.0.0') {
        const saved = localStorage.getItem('techphone229_trade_offers');
        if (saved) {
          setTradeOffers(JSON.parse(saved));
        }
      } else {
        localStorage.removeItem('techphone229_trade_offers');
        setTradeOffers([]);
      }
    } catch (e) {
      console.error('Erreur chargement trade offers:', e);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('techphone229_trade_offers', JSON.stringify(tradeOffers));
    } catch (e) {
      console.error('Erreur sauvegarde trade offers:', e);
    }
  }, [tradeOffers, mounted]);

  const submitTradeOffer = (offerData: Omit<TradeOffer, 'id' | 'createdAt' | 'status'>): string => {
    const id = `TR-2024-${Math.floor(100 + Math.random() * 900)}`;
    const newOffer: TradeOffer = {
      ...offerData,
      id,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    setTradeOffers((prev) => [newOffer, ...prev]);
    return id;
  };

  const updateTradeOfferStatus = (
    id: string,
    status: TradeOfferStatus,
    adminNote?: string,
    counterOfferAmount?: number
  ) => {
    setTradeOffers((prev) =>
      prev.map((offer) => {
        if (offer.id === id) {
          return {
            ...offer,
            status,
            adminNote: adminNote ?? offer.adminNote,
            counterOfferAmount: counterOfferAmount ?? offer.counterOfferAmount,
            updatedAt: new Date().toISOString()
          };
        }
        return offer;
      })
    );
  };

  const getOfferById = (id: string) => tradeOffers.find((o) => o.id === id);

  return (
    <TradeContext.Provider
      value={{
        tradeOffers,
        userOffers: tradeOffers,
        submitTradeOffer,
        updateTradeOfferStatus,
        getOfferById
      }}
    >
      {children}
    </TradeContext.Provider>
  );
};

export const useTrade = () => {
  const context = useContext(TradeContext);
  if (!context) throw new Error('useTrade must be used within a TradeProvider');
  return context;
};
