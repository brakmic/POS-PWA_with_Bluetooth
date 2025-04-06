export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  category: string;
  sku: string;
  stock: number;
  vatCategoryId?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  totalAmount: number;
}

export type PaymentMethod = 'cash' | 'card' | 'mobile';

export interface PaymentDetails {
  method: PaymentMethod;
  reference: string;
  amountReceived?: number;
}

export interface Payment {
  method: PaymentMethod;
  amount: number;
  reference?: string;
  timestamp: string;
}

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

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}
