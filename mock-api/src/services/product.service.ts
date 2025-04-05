import { ProductRepository } from '../repositories/product.repository';
import { Product } from '../models';

export class ProductService {
  constructor(private repository: ProductRepository) {}

  async getAllProducts(category?: string): Promise<Product[]> {
    return this.repository.findAll(category);
  }

  async getProduct(id: string): Promise<Product | null> {
    return this.repository.findById(id);
  }

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    return this.repository.create(product);
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product | null> {
    return this.repository.update(id, product);
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }

  async updateInventory(id: string, quantity: number): Promise<Product | null> {
    return this.repository.updateInventory(id, quantity);
  }
}
