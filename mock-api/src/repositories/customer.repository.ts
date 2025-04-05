import { Knex } from 'knex';
import { Customer } from '../models';

export class CustomerRepository {
  constructor(private db: Knex) {}

  async findAll(): Promise<Customer[]> {
    return this.db('customers').select('*');
  }

  async findById(id: string): Promise<Customer | null> {
    return this.db('customers')
      .select('*')
      .where('id', id)
      .first() || null;
  }

  async create(customer: Omit<Customer, 'id'> & { id?: string }): Promise<Customer> {
    const id = customer.id || (await this.getNextId());
    
    const newCustomer = {
      ...customer,
      id,
      loyaltyPoints: customer.loyaltyPoints || 0
    };
    
    await this.db('customers').insert(newCustomer);
    
    return this.findById(id) as Promise<Customer>;
  }

  async update(id: string, customer: Partial<Customer>): Promise<Customer | null> {
    await this.db('customers')
      .where('id', id)
      .update(customer);
    
    return this.findById(id);
  }

  async updateLoyaltyPoints(id: string, points: number): Promise<Customer | null> {
    const customer = await this.findById(id);
    
    if (!customer) return null;
    
    const newPoints = Math.max(0, customer.loyaltyPoints + points);
    
    await this.db('customers')
      .where('id', id)
      .update('loyaltyPoints', newPoints);
    
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db('customers')
      .where('id', id)
      .delete();
    
    return result > 0;
  }

  private async getNextId(): Promise<string> {
    const max = await this.db('customers')
      .max('id as maxId')
      .first();
    
    const nextId = max && max.maxId ? parseInt(max.maxId as string) + 1 : 1;
    return nextId.toString();
  }
}
