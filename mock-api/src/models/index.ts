export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  sku: string;
  imageUrl?: string;
  attributes?: Record<string, string>;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  loyaltyPoints: number;
  lastVisit?: string;
}

export interface OrderItem {
  id?: number;
  orderId: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export type PaymentMethod = 'cash' | 'card' | 'mobile';

export interface Order {
  id: string;
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  timestamp: string;
  customerId?: string;
  paymentMethod: PaymentMethod;
  receiptNumber?: string;
  items?: OrderItem[];
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}
