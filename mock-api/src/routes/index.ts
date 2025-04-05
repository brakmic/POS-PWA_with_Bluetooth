import express from 'express';
import productsRouter from './products';
import categoriesRouter from './categories';
import customersRouter from './customers';
import ordersRouter from './orders';

const router = express.Router();

// Status endpoint
router.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// Register route handlers
router.use('/api/products', productsRouter);
router.use('/api/categories', categoriesRouter);
router.use('/api/customers', customersRouter);
router.use('/api/orders', ordersRouter);

export default router;
