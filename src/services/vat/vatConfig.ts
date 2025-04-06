import { VatCategory } from './types';

/**
 * VAT categories with inheritance support
 *
 * This configuration maps product categories to VAT rates and allows
 * inheritance through the parent property.
 */
export const VAT_CATEGORIES: Record<string, VatCategory> = {
  // Standard VAT rates
  standard: { id: 'standard', name: 'Standard Rate', rate: 0.19 },
  reduced: { id: 'reduced', name: 'Reduced Rate', rate: 0.07 },
  zero: { id: 'zero', name: 'Zero Rate', rate: 0 },

  // Region-specific standard rates
  uk_standard: { id: 'uk_standard', name: 'UK Standard', rate: 0.2, parent: 'standard' },
  de_standard: { id: 'de_standard', name: 'DE Standard', rate: 0.19, parent: 'standard' },
  fr_standard: { id: 'fr_standard', name: 'FR Standard', rate: 0.2, parent: 'standard' },

  // Product categories
  electronics: { id: 'electronics', name: 'Electronics', rate: 0.2, parent: 'standard' },
  books: { id: 'books', name: 'Books', rate: 0.05, parent: 'reduced' },
  food: { id: 'food', name: 'Food', rate: 0.07, parent: 'reduced' },
  coffee: { id: 'coffee', name: 'Coffee', rate: 0.1, parent: 'reduced' },
  pastry: { id: 'pastry', name: 'Pastry', rate: 0.07, parent: 'food' },

  // Add more categories as needed
};

/**
 * Default VAT rate if no category matches and no configuration is found
 */
export const DEFAULT_VAT_RATE = 0.2; // 20% standard rate
