import { CategoryRepository } from '../repositories/category.repository';
import { Category } from '../models';

export class CategoryService {
  constructor(private repository: CategoryRepository) {}

  async getAllCategories(): Promise<Category[]> {
    return this.repository.findAll();
  }

  async getCategory(id: string): Promise<Category | null> {
    return this.repository.findById(id);
  }

  async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    return this.repository.create(category);
  }

  async updateCategory(id: string, category: Partial<Category>): Promise<Category | null> {
    return this.repository.update(id, category);
  }

  async deleteCategory(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}
