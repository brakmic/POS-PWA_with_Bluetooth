import { injectable } from 'inversify';
import { BluetoothDeviceConnection, BluetoothMessage } from '@appTypes/bluetooth.types';
import { ApiResponse } from '@appTypes/api.types';
import { BluetoothServiceInterface } from './types';

/**
 * Mock implementation of BluetoothService that uses WebSockets
 * instead of actual Web Bluetooth API
 */
@injectable()
export class MockBluetoothService implements BluetoothServiceInterface {
  private websocket: WebSocket | null = null;
  private mockDevice: BluetoothDeviceConnection | null = null;
  private connectionListeners: ((device: BluetoothDeviceConnection | null) => void)[] = [];
  private pendingRequests: Map<
    string,
    {
      resolve: <T>(value: ApiResponse<T>) => void;
      reject: (reason: Error | ApiResponse<unknown>) => void;
      timeout: NodeJS.Timeout;
    }
  > = new Map();

  constructor() {
    console.info('🔌 Using mock Bluetooth service for development');
  }

  public async connect(): Promise<BluetoothDeviceConnection | null> {
    try {
      // No need for user gesture - this is a mock!
      const wsUrl = process.env.REACT_APP_MOCK_BLUETOOTH_URL || 'wss://localhost:3030';
      console.log('Attempting to connect to WebSocket server:', wsUrl);

      return new Promise<BluetoothDeviceConnection | null>((resolve, reject) => {
        try {
          this.websocket = new WebSocket(wsUrl);

          const connectionTimeout = setTimeout(() => {
            console.error('WebSocket connection timed out');
            reject(new Error('Connection timeout'));
          }, 5000);

          this.websocket.onopen = () => {
            clearTimeout(connectionTimeout);
            console.log('✅ Successfully connected to mock Bluetooth server');

            this.mockDevice = {
              device: {
                name: 'POS-Proxy-Mock',
                id: 'mock-device-id',
              } as unknown as globalThis.BluetoothDevice,
              status: 'connected',
              // Add mockups of service and characteristic with UUID
              service: {
                uuid:
                  process.env.REACT_APP_BLUETOOTH_SERVICE_UUID ||
                  '00000000-1111-2222-3333-444444444444',
                // Other properties as needed
              } as unknown as BluetoothRemoteGATTService,
              characteristic: {
                uuid:
                  process.env.REACT_APP_BLUETOOTH_CHARACTERISTIC_UUID ||
                  '11111111-2222-3333-4444-555555555555',
                // Other properties as needed
              } as unknown as BluetoothRemoteGATTCharacteristic,
            };

            this.notifyListeners();
            resolve(this.mockDevice);
          };

          this.websocket.onclose = () => {
            console.log('WebSocket connection closed');
            this.mockDevice = null;
            this.notifyListeners();
          };

          this.websocket.onerror = (error) => {
            clearTimeout(connectionTimeout);
            console.error('WebSocket connection error:', error);
            reject(error);
          };

          this.websocket.onmessage = (event) => {
            try {
              // Parse the incoming message
              const message = JSON.parse(event.data) as BluetoothMessage;
              console.log('Received WebSocket message:', message);

              // Find the pending request with matching ID
              const pendingRequest = this.pendingRequests.get(message.id);
              if (pendingRequest) {
                // Clear the timeout to prevent rejection
                clearTimeout(pendingRequest.timeout);

                if (message.type === 'response') {
                  // Success case - resolve with response data
                  pendingRequest.resolve({
                    data: message.payload.data,
                    error: null,
                    status: message.payload.status || 200,
                  });
                } else if (message.type === 'error') {
                  // Error case - resolve with error information
                  pendingRequest.resolve({
                    data: null,
                    error: message.payload?.message || 'Unknown error',
                    status: message.payload?.status || 500,
                  });
                }

                // Remove the pending request
                this.pendingRequests.delete(message.id);
              } else {
                console.warn(`Received response for unknown request ID: ${message.id}`);
              }
            } catch (error) {
              console.error('Error processing WebSocket message:', error);
            }
          };
        } catch (error) {
          console.error('Failed to create WebSocket connection:', error);
          reject(error);
        }
      });
    } catch (error) {
      console.error('Mock Bluetooth connect error:', error);
      return null;
    }
  }

  public async disconnect(): Promise<boolean> {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
      this.mockDevice = null;
      this.notifyListeners();
      return true;
    }
    return false;
  }

  public isConnected(): boolean {
    return (
      this.websocket !== null &&
      this.websocket.readyState === WebSocket.OPEN &&
      this.mockDevice !== null
    );
  }

  public async sendMessage<T>(message: BluetoothMessage): Promise<ApiResponse<T>> {
    const requestTimeout =
      Number(process.env.REACT_APP_BLUETOOTH_REQUEST_TIMEOUT_SECONDS || 10) * 1000;

    if (!this.isConnected() || !this.websocket) {
      return {
        data: null,
        error: 'Not connected to mock Bluetooth server',
        status: 0,
      };
    }

    return new Promise<ApiResponse<T>>((resolve, reject) => {
      // Set timeout for response
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(message.id);
        reject({
          data: null,
          error: 'Request timeout',
          status: 408,
        });
      }, requestTimeout);

      // Store request handlers with correct type annotation
      this.pendingRequests.set(message.id, {
        // Use type assertion to fix the type mismatch
        resolve: resolve as <U>(value: ApiResponse<U>) => void,
        reject,
        timeout,
      });

      // Send the message
      if (this.websocket) {
        this.websocket.send(JSON.stringify(message));
      } else {
        clearTimeout(timeout);
        this.pendingRequests.delete(message.id);
        reject({
          data: null,
          error: 'WebSocket connection lost',
          status: 0,
        });
      }
    });
  }

  public addConnectionListener(callback: (device: BluetoothDeviceConnection | null) => void): void {
    this.connectionListeners.push(callback);
  }

  public removeConnectionListener(
    callback: (device: BluetoothDeviceConnection | null) => void
  ): void {
    const index = this.connectionListeners.indexOf(callback);
    if (index !== -1) {
      this.connectionListeners.splice(index, 1);
    }
  }

  private notifyListeners(): void {
    for (const listener of this.connectionListeners) {
      listener(this.mockDevice);
    }
  }
}
