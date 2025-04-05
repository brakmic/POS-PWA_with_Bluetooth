import { ApiResponse } from '@appTypes/api.types';
import { Product, Order } from '@appTypes/pos.types';

export interface ApiServiceInterface {
  getProducts(): Promise<ApiResponse<Product[]>>;
  getProduct(id: string): Promise<ApiResponse<Product>>;
  createOrder(order: Omit<Order, 'id'>): Promise<ApiResponse<Order>>;
  getOrder(id: string): Promise<ApiResponse<Order>>;
  updateInventory(productId: string, quantity: number): Promise<ApiResponse<Product>>;
}

export interface ApiServiceOptions {
  baseUrl: string;
  timeout?: number;
}
