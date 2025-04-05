import express from 'express';
import { OrderService } from '../services/order.service';
import { ApiResponse } from '../models';
import config from '../config';

export function createOrdersRouter(orderService: OrderService) {
  const router = express.Router();

  // Helper to add delay if needed
  const withLatency = <T>(fn: (req: express.Request, res: express.Response) => Promise<void>) => {
    return async (req: express.Request, res: express.Response) => {
      if (config.simulateLatency) {
        setTimeout(() => fn(req, res), config.latencyMs);
      } else {
        await fn(req, res);
      }
    };
  };

  // Helper to create API responses
  const sendResponse = <T>(res: express.Response, data: T | null, error: string | null = null, status = 200) => {
    const response: ApiResponse<T> = {
      data,
      error,
      status
    };
    
    res.status(status).json(response);
  };

  // Get all orders
  router.get('/', withLatency(async (req, res) => {
    try {
      const customerId = req.query.customerId as string | undefined;
      const status = req.query.status as string | undefined;
      const orders = await orderService.getAllOrders(customerId, status);
      sendResponse(res, orders);
    } catch (error) {
      console.error('Error getting orders:', error);
      sendResponse(res, null, 'Failed to fetch orders', 500);
    }
  }));

  // Get order by ID
  router.get('/:id', withLatency(async (req, res) => {
    try {
      const order = await orderService.getOrder(req.params.id);
      
      if (order) {
        sendResponse(res, order);
      } else {
        sendResponse(res, null, 'Order not found', 404);
      }
    } catch (error) {
      console.error('Error getting order:', error);
      sendResponse(res, null, 'Failed to fetch order', 500);
    }
  }));

  // Create order
  router.post('/', withLatency(async (req, res) => {
    try {
      const newOrder = await orderService.createOrder(req.body);
      sendResponse(res, newOrder, null, 201);
    } catch (error) {
      console.error('Error creating order:', error);
      sendResponse(res, null, 'Failed to create order', 500);
    }
  }));

  // Update order status
  router.put('/:id/status', withLatency(async (req, res) => {
    try {
      const { status } = req.body;
      const order = await orderService.updateOrderStatus(req.params.id, status);
      
      if (order) {
        sendResponse(res, order);
      } else {
        sendResponse(res, null, 'Order not found', 404);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      sendResponse(res, null, 'Failed to update order status', 500);
    }
  }));

  return router;
}
