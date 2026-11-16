export type PaymentGateway = 'cod' | 'bank_transfer' | 'card' | 'kkiapay' | 'fedapay';

export interface PaymentInitParams {
  orderNumber: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city?: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  status: 'PAID' | 'FAILED' | 'PENDING';
  transactionId?: string;
  amount?: number;
  message?: string;
  raw?: any;
}
