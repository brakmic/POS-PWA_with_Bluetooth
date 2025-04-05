import { Knex } from 'knex';
import { Product } from '../models';

export class ProductRepository {
  constructor(private db: Knex) {}

  async findAll(category?: string): Promise<Product[]> {
    let query = this.db('products')
      .select('*');
    
    if (category) {
      query = query.where('category', category);
    }
    
    const products = await query;
    
    // Parse JSON attributes
    return products.map(product => ({
      ...product,
      attributes: product.attributes ? JSON.parse(product.attributes as string) : undefined
    })) as Product[];
  }

  async findById(id: string): Promise<Product | null> {
    const product = await this.db('products')
      .select('*')
      .where('id', id)
      .first();
    
    if (!product) return null;
    
    // Parse JSON attributes
    return {
      ...product,
      attributes: product.attributes ? JSON.parse(product.attributes as string) : undefined
    } as Product;
  }

  async create(product: Omit<Product, 'id'> & { id?: string }): Promise<Product> {
    // Generate ID if not provided
    const id = product.id || (await this.getNextId());
    
    const newProduct = {
      ...product,
      id,
      attributes: product.attributes ? JSON.stringify(product.attributes) : null
    };
    
    await this.db('products').insert(newProduct);
    
    return this.findById(id) as Promise<Product>;
  }

  async update(id: string, product: Partial<Product>): Promise<Product | null> {
    const updateData = { ...product };
    
    // Stringify attributes if provided
    if (updateData.attributes) {
      updateData.attributes = JSON.stringify(updateData.attributes);
    }
    
    await this.db('products')
      .where('id', id)
      .update(updateData);
    
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db('products')
      .where('id', id)
      .delete();
    
    return result > 0;
  }

  async updateInventory(id: string, quantity: number): Promise<Product | null> {
    await this.db('products')
      .where('id', id)
      .update('stock', quantity);
    
    return this.findById(id);
  }

  private async getNextId(): Promise<string> {
    const max = await this.db('products')
      .max('id as maxId')
      .first();
    
    const nextId = max && max.maxId ? parseInt(max.maxId as string) + 1 : 1;
    return nextId.toString();
  }
}
