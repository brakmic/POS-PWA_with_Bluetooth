import { OrderRepository } from '../repositories/order.repository';
import { Order } from '../models';

export class OrderService {
  constructor(private repository: OrderRepository) {}

  async getAllOrders(customerId?: string, status?: string): Promise<Order[]> {
    return this.repository.findAll(customerId, status);
  }

  async getOrder(id: string): Promise<Order | null> {
    return this.repository.findById(id);
  }

  async createOrder(order: Omit<Order, 'id' | 'timestamp'> & { items: any[] }): Promise<Order> {
    return this.repository.create(order);
  }

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order | null> {
    return this.repository.updateStatus(id, status);
  }
}
