export type ProductCondition = 'NEUF_SCELLE' | 'NEUF_NON_SCELLE' | 'OCCASION';

export type Brand = 'IPHONE' | 'SAMSUNG' | 'ACCESSOIRE';

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
  shortDescription: string;
  brand: Brand;
  categoryId: string;
  categoryName: string;
  condition: ProductCondition;
  tradeEligible: boolean;
  basePrice: number; // en FCFA
  promoPrice?: number; // en FCFA si promo
  isActive: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  rating: number;
  reviewsCount: number;
  images: ProductImage[];
  variants: ProductVariant[];
  specs?: Record<string, string>;
  warrantyMonths: number;
  createdAt: string;
}

export type TradeOfferStatus = 'PENDING' | 'ACCEPTED' | 'COUNTERED' | 'REJECTED' | 'COMPLETED';

export interface TradeOffer {
  id: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerCity: string;
  productId: string;
  productName: string;
  productImage: string;
  targetProductPrice: number;
  offeredDeviceDescription: string;
  offeredDeviceModel: string;
  offeredDeviceCondition: ProductCondition;
  offeredDevicePhotos: string[];
  cashComplement?: number; // FCFA
  status: TradeOfferStatus;
  adminNote?: string;
  counterOfferAmount?: number;
  createdAt: string;
  updatedAt?: string;
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
  totalAmount: number; // FCFA
  shippingFee: number; // FCFA
  discountAmount: number; // FCFA
  promoCode?: string;
  paymentProvider: 'kkiapay' | 'mtn_momo' | 'moov_money' | 'fedapay';
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
