'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, OrderStatus, OrderStatusEvent } from '@/types';
import { generateOrderNumber } from '@/lib/utils';

interface OrderContextType {
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'statusHistory' | 'status'>) => Order;
  getOrderByNumber: (orderNumber: string) => Order | undefined;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
}

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-001',
    orderNumber: 'TP229-928412',
    customerName: 'Koffi Mensah',
    customerEmail: 'koffi.mensah@gmail.com',
    customerPhone: '+229 97 00 11 22',
    shippingAddress: {
      city: 'Cotonou',
      district: 'Haie Vive',
      streetDetails: 'Rue 340, Immeuble Horizon, Apt 3B',
      notes: 'Sonner à l\'interphone B'
    },
    items: [
      {
        productId: 'prod-iphone-15-pro-max',
        productName: 'iPhone 15 Pro Max 256Go Titane Naturel',
        productImage: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
        variantInfo: '256 Go - Titane Naturel',
        quantity: 1,
        unitPrice: 850000
      },
      {
        productId: 'prod-chargeur-apple-20w',
        productName: 'Adaptateur Secteur Apple USB-C 20W Authentique',
        productImage: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
        variantInfo: 'Blanc',
        quantity: 1,
        unitPrice: 18500
      }
    ],
    totalAmount: 868500,
    shippingFee: 0,
    discountAmount: 0,
    paymentProvider: 'mtn_momo',
    paymentRef: 'MTN-BJ-TX-84920491',
    status: 'PAID',
    createdAt: '2024-03-22T09:14:00.000Z',
    statusHistory: [
      { id: 'ev-1', status: 'PENDING', note: 'Commande initiée sur le site', createdAt: '2024-03-22T09:12:00.000Z' },
      { id: 'ev-2', status: 'PAID', note: 'Paiement MTN MoMo validé (868 500 FCFA)', createdAt: '2024-03-22T09:14:00.000Z' }
    ]
  },
  {
    id: 'ord-002',
    orderNumber: 'TP229-418293',
    customerName: 'Fatouma Alabi',
    customerEmail: 'fatouma.alabi@yahoo.com',
    customerPhone: '+229 96 33 44 55',
    shippingAddress: {
      city: 'Cotonou',
      district: 'Akpakpa Dodomey',
      streetDetails: 'Face Pharmacie du Port',
      notes: 'Appeler avant livraison'
    },
    items: [
      {
        productId: 'prod-samsung-s24-ultra',
        productName: 'Samsung Galaxy S24 Ultra 512Go Gris Titane',
        productImage: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80',
        variantInfo: '512 Go - Gris Titane',
        quantity: 1,
        unitPrice: 750000
      }
    ],
    totalAmount: 750000,
    shippingFee: 0,
    discountAmount: 0,
    paymentProvider: 'moov_money',
    paymentRef: 'MOOV-BJ-903482',
    status: 'DELIVERED',
    createdAt: '2024-03-19T14:20:00.000Z',
    statusHistory: [
      { id: 'ev-3', status: 'PENDING', note: 'Commande passée', createdAt: '2024-03-19T14:20:00.000Z' },
      { id: 'ev-4', status: 'PAID', note: 'Paiement Moov Money reçu', createdAt: '2024-03-19T14:22:00.000Z' },
      { id: 'ev-5', status: 'PROCESSING', note: 'Emballage sécurisé avec scellé', createdAt: '2024-03-19T15:00:00.000Z' },
      { id: 'ev-6', status: 'SHIPPED', note: 'En cours de livraison avec coursier express Cotonou', createdAt: '2024-03-19T16:30:00.000Z' },
      { id: 'ev-7', status: 'DELIVERED', note: 'Colis remis en main propre contre signature', createdAt: '2024-03-19T17:45:00.000Z' }
    ]
  }
];

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const storeVersion = localStorage.getItem('techphone229_store_v');
      if (storeVersion === '2.0.0') {
        const saved = localStorage.getItem('techphone229_orders');
        if (saved) {
          setOrders(JSON.parse(saved));
        }
      } else {
        localStorage.removeItem('techphone229_orders');
        setOrders([]);
      }
    } catch (e) {
      console.error('Erreur chargement orders:', e);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('techphone229_orders', JSON.stringify(orders));
    } catch (e) {
      console.error('Erreur sauvegarde orders:', e);
    }
  }, [orders, mounted]);

  const createOrder = (
    orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'statusHistory' | 'status'>
  ): Order => {
    const orderNumber = generateOrderNumber();
    const id = `ord-${Date.now()}`;
    const initialStatus: OrderStatus = 'PAID'; // Pour la démo fluide, simulation de paiement réussi

    const newOrder: Order = {
      ...orderData,
      id,
      orderNumber,
      status: initialStatus,
      createdAt: new Date().toISOString(),
      statusHistory: [
        {
          id: `ev-${Date.now()}-1`,
          status: 'PENDING',
          note: 'Commande enregistrée',
          createdAt: new Date().toISOString()
        },
        {
          id: `ev-${Date.now()}-2`,
          status: 'PAID',
          note: `Paiement validé avec succès (${orderData.paymentProvider.toUpperCase()})`,
          createdAt: new Date().toISOString()
        }
      ]
    };

    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const getOrderByNumber = (orderNumber: string) => {
    const clean = orderNumber.trim().toUpperCase();
    return orders.find((o) => o.orderNumber.toUpperCase() === clean);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, note?: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const newEvent: OrderStatusEvent = {
            id: `ev-${Date.now()}`,
            status,
            note: note || `Statut mis à jour: ${status}`,
            createdAt: new Date().toISOString()
          };
          return {
            ...order,
            status,
            statusHistory: [...order.statusHistory, newEvent]
          };
        }
        return order;
      })
    );
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        createOrder,
        getOrderByNumber,
        updateOrderStatus
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrders must be used within an OrderProvider');
  return context;
};
