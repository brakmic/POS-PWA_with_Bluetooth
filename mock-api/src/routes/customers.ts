import express from 'express';
import { CustomerService } from '../services/customer.service';
import { ApiResponse } from '../models';
import config from '../config';

export function createCustomersRouter(customerService: CustomerService) {
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

  // Get all customers
  router.get('/', withLatency(async (req, res) => {
    try {
      const customers = await customerService.getAllCustomers();
      sendResponse(res, customers);
    } catch (error) {
      console.error('Error getting customers:', error);
      sendResponse(res, null, 'Failed to fetch customers', 500);
    }
  }));

  // Get customer by ID
  router.get('/:id', withLatency(async (req, res) => {
    try {
      const customer = await customerService.getCustomer(req.params.id);
      
      if (customer) {
        sendResponse(res, customer);
      } else {
        sendResponse(res, null, 'Customer not found', 404);
      }
    } catch (error) {
      console.error('Error getting customer:', error);
      sendResponse(res, null, 'Failed to fetch customer', 500);
    }
  }));

  // Create customer
  router.post('/', withLatency(async (req, res) => {
    try {
      const newCustomer = await customerService.createCustomer(req.body);
      sendResponse(res, newCustomer, null, 201);
    } catch (error) {
      console.error('Error creating customer:', error);
      sendResponse(res, null, 'Failed to create customer', 500);
    }
  }));

  // Update customer
  router.put('/:id', withLatency(async (req, res) => {
    try {
      const updatedCustomer = await customerService.updateCustomer(req.params.id, req.body);
      
      if (updatedCustomer) {
        sendResponse(res, updatedCustomer);
      } else {
        sendResponse(res, null, 'Customer not found', 404);
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      sendResponse(res, null, 'Failed to update customer', 500);
    }
  }));

  // Update loyalty points
  router.put('/:id/loyalty', withLatency(async (req, res) => {
    try {
      const { points } = req.body;
      const customer = await customerService.updateLoyaltyPoints(req.params.id, points);
      
      if (customer) {
        sendResponse(res, customer);
      } else {
        sendResponse(res, null, 'Customer not found', 404);
      }
    } catch (error) {
      console.error('Error updating loyalty points:', error);
      sendResponse(res, null, 'Failed to update loyalty points', 500);
    }
  }));

  // Delete customer
  router.delete('/:id', withLatency(async (req, res) => {
    try {
      const result = await customerService.deleteCustomer(req.params.id);
      
      if (result) {
        sendResponse(res, { id: req.params.id });
      } else {
        sendResponse(res, null, 'Customer not found', 404);
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      sendResponse(res, null, 'Failed to delete customer', 500);
    }
  }));

  return router;
}
