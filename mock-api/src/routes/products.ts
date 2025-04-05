import express from 'express';
import { ProductService } from '../services/product.service';
import { ApiResponse, Product } from '../models';
import config from '../config';

export function createProductsRouter(productService: ProductService) {
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

  // Get all products
  router.get('/', withLatency(async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const products = await productService.getAllProducts(category);
      sendResponse(res, products);
    } catch (error) {
      console.error('Error getting products:', error);
      sendResponse(res, null, 'Failed to fetch products', 500);
    }
  }));

  // Get product by ID
  router.get('/:id', withLatency(async (req, res) => {
    try {
      const product = await productService.getProduct(req.params.id);
      
      if (product) {
        sendResponse(res, product);
      } else {
        sendResponse(res, null, 'Product not found', 404);
      }
    } catch (error) {
      console.error('Error getting product:', error);
      sendResponse(res, null, 'Failed to fetch product', 500);
    }
  }));

  // Create product
  router.post('/', withLatency(async (req, res) => {
    try {
      const newProduct = await productService.createProduct(req.body);
      sendResponse(res, newProduct, null, 201);
    } catch (error) {
      console.error('Error creating product:', error);
      sendResponse(res, null, 'Failed to create product', 500);
    }
  }));

  // Update product
  router.put('/:id', withLatency(async (req, res) => {
    try {
      const updatedProduct = await productService.updateProduct(req.params.id, req.body);
      
      if (updatedProduct) {
        sendResponse(res, updatedProduct);
      } else {
        sendResponse(res, null, 'Product not found', 404);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      sendResponse(res, null, 'Failed to update product', 500);
    }
  }));

  // Update inventory
  router.put('/:id/inventory', withLatency(async (req, res) => {
    try {
      const productId = req.params.id;
      const { quantity } = req.body;
      
      if (quantity === undefined) {
        return sendResponse(res, null, 'Quantity is required', 400);
      }
      
      const product = await productService.updateInventory(productId, quantity);
      
      if (product) {
        sendResponse(res, product);
      } else {
        sendResponse(res, null, 'Product not found', 404);
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
      sendResponse(res, null, 'Failed to update inventory', 500);
    }
  }));

  return router;
}
