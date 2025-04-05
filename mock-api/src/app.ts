import express from 'express';
import cors from 'cors';
import path from 'path';
import { db } from './db';
import { ProductRepository } from './repositories/product.repository';
import { CategoryRepository } from './repositories/category.repository';
import { CustomerRepository } from './repositories/customer.repository';
import { OrderRepository } from './repositories/order.repository';
import { ProductService } from './services/product.service';
import { CategoryService } from './services/category.service';
import { CustomerService } from './services/customer.service';
import { OrderService } from './services/order.service';
import { createProductsRouter } from './routes/products';
import { createCategoriesRouter } from './routes/categories';
import { createCustomersRouter } from './routes/customers';
import { createOrdersRouter } from './routes/orders';
import { setupSwagger } from './swagger';

// Create Express application
const app = express();
app.use(cors());
app.use(express.json());

// Create repositories
const productRepository = new ProductRepository(db);
const categoryRepository = new CategoryRepository(db);
const customerRepository = new CustomerRepository(db);
const orderRepository = new OrderRepository(db);

// Create services
const productService = new ProductService(productRepository);
const categoryService = new CategoryService(categoryRepository);
const customerService = new CustomerService(customerRepository);
const orderService = new OrderService(orderRepository);

// Status endpoint
app.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// Register routes
app.use('/api/products', createProductsRouter(productService));
app.use('/api/categories', createCategoriesRouter(categoryService));
app.use('/api/customers', createCustomersRouter(customerService));
app.use('/api/orders', createOrdersRouter(orderService));

// Add static file serving for product images with proper caching headers
app.use('/images', express.static(path.join(__dirname, '../../../public/images'), {
  // Set the maximum age for the served files in milliseconds (1 day = 86400000 ms)
  maxAge: '1d', 
  
  // Set immutable for images that won't change (better browser caching)
  immutable: true,
  
  // Set custom headers for different file types
  setHeaders: (res, path) => {
    // Check file types and set appropriate cache headers
    if (path.endsWith('.jpg') || path.endsWith('.png') || path.endsWith('.gif')) {
      // 1 day for images
      res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    } else {
      // 1 hour for other files
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
    
    // Set for etag support (conditional requests)
    res.setHeader('ETag', 'true');
    
    // Allow cross-origin resource sharing if needed
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

// Initialize and setup Swagger (automatically generates docs)
setupSwagger(app).catch(err => {
  console.error('Failed to initialize Swagger:', err);
});

export default app;
