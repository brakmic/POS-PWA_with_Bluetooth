import { injectable } from 'inversify';
import { VAT_CATEGORIES, DEFAULT_VAT_RATE } from './vatConfig';
import {
  VatServiceInterface,
  VatCalculation,
  OrderVatSummary,
  VatBreakdownItem,
  VatCategory,
} from './types';
import { Product, CartItem, Order } from '@appTypes/pos.types';

interface ProductWithVat extends Product {
  vatCategoryId?: string;
}

/**
 * VAT Service implementation
 *
 * This service calculates VAT for products and orders based on
 * product categories and configurable rates.
 */
@injectable()
export class VatService implements VatServiceInterface {
  private readonly vatEnabled: boolean;
  private readonly defaultRate: number;
  private readonly region: string;

  constructor() {
    // Read configuration from environment variables
    this.vatEnabled = process.env.REACT_APP_VAT_ENABLED !== 'false';
    this.defaultRate = parseFloat(
      process.env.REACT_APP_VAT_DEFAULT_RATE || DEFAULT_VAT_RATE.toString()
    );
    this.region = (process.env.REACT_APP_VAT_REGION || 'UK').toUpperCase();
  }

  /**
   * Check if VAT calculation is enabled
   */
  public isVatEnabled(): boolean {
    return this.vatEnabled;
  }

  /**
   * Get the current VAT region
   */
  public getRegion(): string {
    return this.region;
  }

  /**
   * Calculate VAT for a single product and quantity
   */
  public calculateItemVat(product: Product, quantity: number): VatCalculation {
    if (!this.vatEnabled) {
      return this.createZeroVatCalculation(product.price * quantity);
    }

    const category = this.resolveVatCategory(product);
    const baseAmount = product.price * quantity;
    const vatAmount = this.roundToTwoDecimals(baseAmount * category.rate);

    return {
      baseAmount,
      vatRate: category.rate,
      vatAmount,
      totalAmount: baseAmount + vatAmount,
      categoryName: category.name,
    };
  }

  /**
   * Calculate VAT for a cart containing multiple items
   */
  public calculateCartVat(items: CartItem[]): OrderVatSummary {
    if (!this.vatEnabled) {
      const subtotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0);

      return {
        subtotal,
        vatBreakdown: [],
        vatTotal: 0,
        grandTotal: subtotal,
      };
    }

    // Calculate VAT for each item
    const itemVats = items.map((item) => ({
      item,
      vat: this.calculateItemVat(item.product, item.quantity),
    }));

    // Calculate subtotal
    const subtotal = this.roundToTwoDecimals(
      itemVats.reduce((sum, { vat }) => sum + vat.baseAmount, 0)
    );

    // Group by VAT rate
    const vatGroups: Record<string, VatBreakdownItem> = {};

    itemVats.forEach(({ vat }) => {
      // Use rate as key, with enough precision to distinguish different rates
      const rateKey = `${(vat.vatRate * 100).toFixed(2)}`;

      if (!vatGroups[rateKey]) {
        vatGroups[rateKey] = {
          rate: vat.vatRate,
          amount: 0,
          categoryName: vat.categoryName,
        };
      }

      vatGroups[rateKey].amount += vat.vatAmount;
    });

    // Convert to array and ensure amounts are properly rounded
    const vatBreakdown = Object.values(vatGroups).map((group) => ({
      ...group,
      amount: this.roundToTwoDecimals(group.amount),
    }));

    // Calculate total VAT
    const vatTotal = this.roundToTwoDecimals(
      vatBreakdown.reduce((sum, item) => sum + item.amount, 0)
    );

    // Calculate grand total
    const grandTotal = this.roundToTwoDecimals(subtotal + vatTotal);

    return {
      subtotal,
      vatBreakdown,
      vatTotal,
      grandTotal,
    };
  }

  /**
   * Apply VAT calculations to an order object
   */
  public applyVatToOrder(orderData: Partial<Order>): Partial<Order> & {
    subtotal: number;
    vatBreakdown: VatBreakdownItem[];
    vatTotal: number;
  } {
    if (!orderData.items || !orderData.items.length) {
      return {
        ...orderData,
        subtotal: orderData.totalAmount || 0,
        vatBreakdown: [],
        vatTotal: 0,
      };
    }

    // Convert order items to cart items structure
    const cartItems: CartItem[] = orderData.items.map((item) => ({
      product: {
        id: item.productId,
        name: item.name,
        price: item.price,
        sku: item.productId,
        category: 'standard',
        stock: 0, // Not needed for VAT calculation
        image: '', // Not needed for VAT calculation
      },
      quantity: item.quantity,
    }));

    // Calculate VAT
    const vatResult = this.calculateCartVat(cartItems);

    // Return enhanced order with VAT information
    return {
      ...orderData,
      subtotal: vatResult.subtotal,
      vatBreakdown: vatResult.vatBreakdown,
      vatTotal: vatResult.vatTotal,
      totalAmount: vatResult.grandTotal, // Update total amount to include VAT
    };
  }

  /**
   * Resolve the appropriate VAT category for a product
   * Implements category inheritance and fallback logic
   */
  private resolveVatCategory(product: Product): VatCategory {
    const productWithVat = product as ProductWithVat;
    if (productWithVat.vatCategoryId && VAT_CATEGORIES[productWithVat.vatCategoryId]) {
      return this.resolveCategory(VAT_CATEGORIES[productWithVat.vatCategoryId]);
    }

    // Try to get VAT category from product category
    const categoryId = product.category?.toLowerCase();
    if (categoryId && VAT_CATEGORIES[categoryId]) {
      return this.resolveCategory(VAT_CATEGORIES[categoryId]);
    }

    // Use region-specific default if available
    const regionDefault = `${this.region.toLowerCase()}_standard`;
    if (VAT_CATEGORIES[regionDefault]) {
      return this.resolveCategory(VAT_CATEGORIES[regionDefault]);
    }

    // Fallback to default
    return {
      id: 'default',
      name: 'Standard Rate',
      rate: this.defaultRate,
    };
  }

  /**
   * Resolve category inheritance
   * This allows categories to inherit rates from parent categories
   */
  private resolveCategory(category: VatCategory, depth = 0): VatCategory {
    // Prevent infinite recursion
    if (depth > 5) {
      return category;
    }

    // If no parent, return as is
    if (!category.parent) {
      return category;
    }

    // Get parent category
    const parent = VAT_CATEGORIES[category.parent];
    if (!parent) {
      return category;
    }

    // Resolve parent (recursively)
    const resolvedParent = this.resolveCategory(parent, depth + 1);

    // Return category with inherited values where not explicitly defined
    return {
      ...category,
      // Only inherit rate if not defined in the category itself
      rate: category.rate !== undefined ? category.rate : resolvedParent.rate,
    };
  }

  /**
   * Create a zero-VAT calculation for a given amount
   */
  private createZeroVatCalculation(amount: number): VatCalculation {
    return {
      baseAmount: amount,
      vatRate: 0,
      vatAmount: 0,
      totalAmount: amount,
      categoryName: 'No VAT',
    };
  }

  /**
   * Round to two decimal places for currency calculations
   */
  private roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
