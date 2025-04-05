import { Knex } from 'knex';
import { Order, OrderItem } from '../models';

export class OrderRepository {
  constructor(private db: Knex) {}

  async findAll(customerId?: string, status?: string): Promise<Order[]> {
    let query = this.db('orders').select('*');
    
    if (customerId) {
      query = query.where('customerId', customerId);
    }
    
    if (status) {
      query = query.where('status', status);
    }
    
    const orders = await query.orderBy('timestamp', 'desc');
    
    // Get items for each order
    for (const order of orders) {
      order.items = await this.getOrderItems(order.id);
    }
    
    return orders;
  }

  async findById(id: string): Promise<Order | null> {
    const order = await this.db('orders')
      .select('*')
      .where('id', id)
      .first();
    
    if (!order) return null;
    
    // Get order items
    order.items = await this.getOrderItems(id);
    
    return order;
  }

  async create(orderData: Omit<Order, 'id' | 'timestamp'> & { items: OrderItem[] }): Promise<Order> {
    const id = await this.getNextOrderId();
    const timestamp = new Date().toISOString();
    const receiptNumber = `R${new Date().getFullYear()}${id.padStart(6, '0')}`;
    
    // Create new order
    const order: Order = {
      id,
      totalAmount: orderData.totalAmount,
      status: orderData.status || 'pending',
      timestamp,
      customerId: orderData.customerId,
      paymentMethod: orderData.paymentMethod,
      receiptNumber
    };
    
    // Begin transaction
    await this.db.transaction(async (trx) => {
      // Insert order
      await trx('orders').insert(order);
      
      // Insert order items
      if (orderData.items && orderData.items.length > 0) {
        const items = orderData.items.map(item => ({
          orderId: id,
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }));
        
        await trx('order_items').insert(items);
      }
    });
    
    // Return created order with items
    return this.findById(id) as Promise<Order>;
  }

  async updateStatus(id: string, status: Order['status']): Promise<Order | null> {
    await this.db('orders')
      .where('id', id)
      .update('status', status);
    
    return this.findById(id);
  }

  private async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return this.db('order_items')
      .select('*')
      .where('orderId', orderId);
  }

  private async getNextOrderId(): Promise<string> {
    const result = await this.db('orders')
      .count('* as count')
      .first();
    
    const nextId = result ? Number(result.count) + 1 : 1;
    return nextId.toString().padStart(4, '0');
  }
}
