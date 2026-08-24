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

const INITIAL_ORDERS: Order[] = [];

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const storeVersion = localStorage.getItem('techphone229_store_v');
      if (storeVersion === '2.0.0') {
        const saved = localStorage.getItem('techphone229_orders');
        if (saved && saved !== 'undefined' && saved !== 'null') {
          try { setOrders(JSON.parse(saved)); } catch (_) {}
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
