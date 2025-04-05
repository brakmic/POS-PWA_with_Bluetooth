import { CustomerRepository } from '../repositories/customer.repository';
import { Customer } from '../models';

export class CustomerService {
  constructor(private repository: CustomerRepository) {}

  async getAllCustomers(): Promise<Customer[]> {
    return this.repository.findAll();
  }

  async getCustomer(id: string): Promise<Customer | null> {
    return this.repository.findById(id);
  }

  async createCustomer(customer: Omit<Customer, 'id'>): Promise<Customer> {
    return this.repository.create(customer);
  }

  async updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer | null> {
    return this.repository.update(id, customer);
  }

  async updateLoyaltyPoints(id: string, points: number): Promise<Customer | null> {
    return this.repository.updateLoyaltyPoints(id, points);
  }

  async deleteCustomer(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}
