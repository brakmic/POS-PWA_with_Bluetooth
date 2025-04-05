import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { mockDevice, getClients, broadcast } from './websocket';

// Create router
const router = express.Router();

// Status endpoint
router.get('/status', (req, res) => {
  res.json({
    device: mockDevice,
    clients: getClients(),
    uptime: process.uptime()
  });
});

// Control device delay
router.post('/control/delay', (req, res) => {
  mockDevice.responseDelay = req.body.delay || 200;
  res.json({ success: true, delay: mockDevice.responseDelay });
});

// Connect device
router.post('/control/connect', (req, res) => {
  mockDevice.connected = true;
  res.json({ success: true, connected: mockDevice.connected });
});

// Disconnect device
router.post('/control/disconnect', (req, res) => {
  mockDevice.connected = false;
  res.json({ success: true, connected: mockDevice.connected });
});

// Simulate error
router.post('/control/simulate-error', (req, res) => {
  const { endpoint = '/products', errorMessage = 'Simulated error', status = 500 } = req.body;
  
  res.json({
    success: true,
    simulation: {
      endpoint,
      errorMessage,
      status
    }
  });
  
  // Broadcast error to all clients
  broadcast({
    id: `sim-${uuidv4()}`,
    type: 'error',
    endpoint,
    payload: {
      message: errorMessage,
      status
    },
    timestamp: Date.now()
  });
});

export default router;
