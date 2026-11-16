export type ProductCondition = 'NEUF_SCELLE' | 'NEUF_NON_SCELLE' | 'OCCASION';

export type Brand = string;

export interface ProductVariant {
  id: string;
  productId: string;
  color?: string;
  colorCode?: string;
  storage?: string;
  priceOverride?: number;
  promoPrice?: number;
  stock: number;
  sku: string;
  imagesJson?: string;
  images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string;
  color?: string;
  position: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription?: string;
  brand: Brand;
  categoryId: string;
  categoryName?: string;
  condition: ProductCondition;
  basePrice: number; // en SI$
  promoPrice?: number; // en SI$
  isActive: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  rating: number;
  reviewsCount: number;
  images: ProductImage[];
  variants: ProductVariant[];
  specs?: Record<string, string>;
  warrantyMonths?: number;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  variantId?: string;
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant;
  unitPrice: number;
}

export type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

export interface OrderStatusEvent {
  id: string;
  status: OrderStatus;
  note?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    city: string;
    district: string;
    streetDetails: string;
    notes?: string;
  };
  items: {
    productId: string;
    productName: string;
    productImage: string;
    variantInfo?: string;
    quantity: number;
    unitPrice: number;
  }[];
  totalAmount: number; // SI$
  shippingFee: number; // SI$
  discountAmount: number; // SI$
  promoCode?: string;
  paymentProvider: 'cod' | 'bank_transfer' | 'card' | 'kkiapay' | 'fedapay' | 'mtn_momo' | 'moov_money';
  paymentRef?: string;
  status: OrderStatus;
  createdAt: string;
  statusHistory: OrderStatusEvent[];
}

export interface PromoCode {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount?: number;
  isActive: boolean;
}

export interface UserAddress {
  id: string;
  userId: string;
  label: string;
  city: string;
  district?: string;
  street: string;
  phone: string;
  isDefault: boolean;
  createdAt: string;
}

