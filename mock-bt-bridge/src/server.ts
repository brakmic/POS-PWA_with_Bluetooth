import express from 'express';
import fs from 'fs';
import path from 'path';
import https from 'https';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import dotenvSafe from 'dotenv-safe';
import httpController from './controllers/http';
import { handleConnection, mockDevice } from './controllers/websocket';
import config from './config';

// Load environment variables from .env file
dotenvSafe.config({
  path: path.resolve(__dirname, '../.env'),
  example: path.resolve(__dirname, '../.env.example'),
  allowEmptyValues: true
});

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Register HTTP routes
app.use('/', httpController);

// Create HTTP(S) server
let server: https.Server | any;

if (config.useHttps) {
  try {
    const options = {
      key: fs.readFileSync(config.getCertPath('key.pem')),
      cert: fs.readFileSync(config.getCertPath('cert.pem'))
    };
    server = https.createServer(options, app);
  } catch (error) {
    console.error('❌ Error loading SSL certificates:', error);
    process.exit(1);
  }
} else {
  server = app;
}

// Create WebSocket server
const wss = new WebSocketServer({ 
  server: config.useHttps ? server : undefined,
  port: config.useHttps ? undefined : config.port
});

// Handle WebSocket connections
wss.on('connection', handleConnection);

// Start server
if (config.useHttps) {
  server.listen(config.port, () => {
    console.log(`🔌 Secure mock Bluetooth bridge (WSS) running on port ${config.port}`);
    console.log(`📱 Device name: ${mockDevice.name}`);
    console.log(`🆔 Service UUID: ${mockDevice.serviceUUID}`);
  });
} else {
  console.log(`🔌 Mock Bluetooth bridge (WS) running on port ${config.port}`);
  console.log(`📱 Device name: ${mockDevice.name}`);
  console.log(`🆔 Service UUID: ${mockDevice.serviceUUID}`);
}
