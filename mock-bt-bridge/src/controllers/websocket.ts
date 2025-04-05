import fetch from 'node-fetch';
import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { BluetoothMessage, ApiResponse } from '../types';
import config from '../config';

// Store client connections
const clients = new Map<string, WebSocket>();

// Mock device state
export const mockDevice = {
  name: config.deviceName,
  serviceUUID: config.serviceUUID,
  characteristicUUID: config.characteristicUUID,
  connected: false,
  responseDelay: config.responseDelay,
};

// Process a request and generate a response
export async function processRequest(request: BluetoothMessage): Promise<BluetoothMessage> {
  console.log(`Processing request to ${request.endpoint}`);
  
  const endpoint = request.endpoint;
  const method = request.payload?.method || 'GET';
  const data = request.payload?.data;
  
  try {
    // Forward the request to the mock API server
    const mockApiUrl = process.env.MOCK_API_URL || 'https://localhost:5000';
    const url = `${mockApiUrl}${endpoint}`;
    
    console.log(`Forwarding ${method} request to: ${url}`);
    
    // Prepare fetch options
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    // Add body for non-GET requests
    if (method !== 'GET' && data) {
      options.body = JSON.stringify(data);
    }
    
    // Make the request
    const response = await fetch(url, options);
    let responseData;
    
    try {
      responseData = await response.json();
    } catch (e) {
      // Handle non-JSON responses
      responseData = { message: await response.text() };
    }
    
    console.log(`Received response from API (${response.status})`, responseData);
    
    // Return successful response
    return {
      id: request.id,
      type: 'response',
      endpoint: request.endpoint,
      payload: responseData, // API already wraps responses in {data, error, status} format
      timestamp: Date.now()
    };
    
  } catch (error) {
    console.error(`Error forwarding request to API: ${error}`);
    
    // Return error response
    return {
      id: request.id,
      type: 'error',
      endpoint: request.endpoint,
      payload: {
        message: `Failed to process request: ${error instanceof Error ? error.message : String(error)}`,
        status: 500
      },
      timestamp: Date.now()
    };
  }
}

// Handle WebSocket connection
export function handleConnection(ws: WebSocket) {
  const clientId = uuidv4();
  clients.set(clientId, ws);
  
  console.log(`Client ${clientId} connected`);
  
  // Handle incoming messages
  ws.on('message', async (messageData: Buffer) => {
    try {
      const message = messageData.toString();
      const parsedMessage = JSON.parse(message) as BluetoothMessage;
      console.log(`Received message from client ${clientId}:`, parsedMessage);
      
      // Process the request
      if (parsedMessage.type === 'request') {
        // Simulate processing delay
        setTimeout(async () => {
          try {
            // Process request and get response - note async now
            const response = await processRequest(parsedMessage);
            
            // Send response back
            ws.send(JSON.stringify(response));
            console.log(`Sent response to client ${clientId}:`, response);
          } catch (error) {
            console.error(`Error processing request: ${error}`);
            
            // Send error response
            const errorResponse = {
              id: parsedMessage.id,
              type: 'error',
              endpoint: parsedMessage.endpoint,
              payload: {
                message: `Failed to process request: ${error instanceof Error ? error.message : String(error)}`,
                status: 500
              },
              timestamp: Date.now()
            };
            
            ws.send(JSON.stringify(errorResponse));
          }
        }, mockDevice.responseDelay);
      }
    } catch (error) {
      console.error(`Error processing message from client ${clientId}:`, error);
      ws.send(JSON.stringify({
        type: 'error',
        id: 'error-' + uuidv4(),
        endpoint: '/',
        payload: {
          message: error instanceof Error ? error.message : String(error),
          status: 400
        },
        timestamp: Date.now()
      }));
    }
  });
  
  // Rest of the function remains the same
  ws.on('close', () => {
    clients.delete(clientId);
    console.log(`Client ${clientId} disconnected`);
  });
  
  return clientId;
}

// Get all connected clients
export function getClients() {
  return Array.from(clients.keys());
}

// Broadcast a message to all clients
export function broadcast(message: any) {
  for (const client of clients.values()) {
    client.send(JSON.stringify(message));
  }
}
