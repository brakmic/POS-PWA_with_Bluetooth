import { Knex } from 'knex';
import { Category } from '../models';

export class CategoryRepository {
  constructor(private db: Knex) {}

  async findAll(): Promise<Category[]> {
    return this.db('categories').select('*');
  }

  async findById(id: string): Promise<Category | null> {
    return this.db('categories')
      .select('*')
      .where('id', id)
      .first() || null;
  }

  async create(category: Omit<Category, 'id'> & { id?: string }): Promise<Category> {
    const id = category.id || category.name.toLowerCase().replace(/\s+/g, '-');
    
    const newCategory = {
      ...category,
      id
    };
    
    await this.db('categories').insert(newCategory);
    
    return this.findById(id) as Promise<Category>;
  }

  async update(id: string, category: Partial<Category>): Promise<Category | null> {
    await this.db('categories')
      .where('id', id)
      .update(category);
    
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db('categories')
      .where('id', id)
      .delete();
    
    return result > 0;
  }
}
