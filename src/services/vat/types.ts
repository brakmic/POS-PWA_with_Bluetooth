import { Product, CartItem, Order } from '@appTypes/pos.types';

/**
 * VAT calculation result for a single item
 */
export interface VatCalculation {
  baseAmount: number; // Price before VAT
  vatRate: number; // VAT rate as decimal (e.g., 0.19 for 19%)
  vatAmount: number; // VAT amount
  totalAmount: number; // Price with VAT included
  categoryName: string; // VAT category name for display
}

/**
 * VAT breakdown item for receipt display
 */
export interface VatBreakdownItem {
  rate: number; // VAT rate as decimal
  amount: number; // Total VAT amount for this rate
  categoryName: string; // Display name for this VAT category
}

/**
 * Complete VAT summary for an order or cart
 */
export interface OrderVatSummary {
  subtotal: number; // Total before VAT
  vatBreakdown: VatBreakdownItem[]; // Breakdown by VAT rate
  vatTotal: number; // Total VAT amount
  grandTotal: number; // Final amount including VAT
}

/**
 * VAT category configuration
 */
export interface VatCategory {
  id: string; // Unique identifier
  name: string; // Display name
  rate: number; // VAT rate as decimal
  parent?: string; // Parent category for inheritance
}

/**
 * VAT service interface for dependency injection
 */
export interface VatServiceInterface {
  /**
   * Calculate VAT for a single product and quantity
   */
  calculateItemVat(product: Product, quantity: number): VatCalculation;

  /**
   * Calculate VAT for a collection of cart items
   */
  calculateCartVat(items: CartItem[]): OrderVatSummary;

  /**
   * Apply VAT calculations to an order
   * Returns the original order enhanced with VAT information
   */
  applyVatToOrder(order: Partial<Order>): Partial<Order> & {
    subtotal: number;
    vatBreakdown: VatBreakdownItem[];
    vatTotal: number;
  };

  /**
   * Check if VAT calculation is enabled
   */
  isVatEnabled(): boolean;

  /**
   * Get the current VAT region code
   */
  getRegion(): string;
}
