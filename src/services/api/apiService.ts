import { injectable, inject, optional } from 'inversify';
import { ConnectionType, ApiResponse } from '@appTypes/api.types';
import { Product, Order } from '@appTypes/pos.types';
import type { BluetoothServiceInterface } from '../bluetooth/types';
import { BluetoothMessage } from '@appTypes/bluetooth.types';
import type { ApiServiceInterface, ApiServiceOptions } from './types';
import type { NetworkManagerInterface } from '../network/types';
import { SERVICE_IDENTIFIERS } from '../inversify/identifiers';
import { API_ENDPOINTS, API_CONFIG } from './endpoints';
import { v4 as uuidv4 } from 'uuid';

@injectable()
export class ApiService implements ApiServiceInterface {
  private options: ApiServiceOptions;

  constructor(
    @inject(SERVICE_IDENTIFIERS.NetworkManager) private networkManager: NetworkManagerInterface,
    @inject(SERVICE_IDENTIFIERS.BluetoothService)
    private bluetoothService: BluetoothServiceInterface,
    @optional() @inject(SERVICE_IDENTIFIERS.ApiConfig) options?: ApiServiceOptions
  ) {
    this.options = options || API_CONFIG;
  }

  private async request<T>(endpoint: string, method = 'GET', data?: any): Promise<ApiResponse<T>> {
    // Get network state
    const networkState = await this.networkManager.checkConnectivity();

    try {
      // Try WLAN first if available
      if (networkState.connectionType === ConnectionType.WLAN) {
        try {
          return await this.httpRequest<T>(endpoint, method, data);
        } catch (error) {
          console.log('WLAN request failed, trying Bluetooth fallback...');
          // Fall through to try Bluetooth
        }
      }

      // Use injected bluetoothService
      if (
        networkState.connectionType === ConnectionType.BLUETOOTH ||
        this.bluetoothService.isConnected()
      ) {
        return await this.bluetoothRequest<T>(endpoint, method, data);
      }

      // No connectivity available
      throw new Error('No network connectivity available');
    } catch (error) {
      return {
        data: null as unknown as T,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 0,
      };
    }
  }

  /**
   * Regular HTTP fetch request
   */
  private async httpRequest<T>(
    endpoint: string,
    method = 'GET',
    data?: any
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.options.baseUrl}${endpoint}`;
      console.log(`API Request: ${method} ${url}`);

      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      console.log(`API Response status: ${response.status} for ${url}`);

      if (!response.ok) {
        console.error(`API error: ${response.status} ${response.statusText}`);
        return {
          data: null,
          error: `Server responded with status: ${response.status}`,
          status: response.status,
        };
      }

      const result = await response.json();
      console.log('API data received:', result);

      return result as ApiResponse<T>;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 500,
      };
    }
  }

  /**
   * Send request via Bluetooth
   */
  private async bluetoothRequest<T>(
    endpoint: string,
    method = 'GET',
    data?: any
  ): Promise<ApiResponse<T>> {
    // Use injected bluetoothService
    if (!this.bluetoothService.isConnected()) {
      try {
        const device = await this.bluetoothService.connect();
        if (!device) {
          return {
            data: null,
            error: 'Failed to connect to Bluetooth device',
            status: 0,
          };
        }
      } catch (error) {
        return {
          data: null,
          error: 'Bluetooth connection error',
          status: 0,
        };
      }
    }

    // Create Bluetooth message
    const message: BluetoothMessage = {
      type: 'request',
      endpoint,
      payload: {
        method,
        data,
      },
      id: uuidv4(),
      timestamp: Date.now(),
    };

    // Send the message through bluetoothService
    return this.bluetoothService.sendMessage<T>(message);
  }

  /**
   * Cache response in IndexedDB (via service worker)
   */
  private async cacheResponse(endpoint: string, data: any): Promise<void> {
    try {
      const cache = await caches.open('api-cache');
      const response = new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'X-Cache-Date': new Date().toISOString(),
        },
      });
      await cache.put(`${this.options.baseUrl}${endpoint}`, response);
    } catch (error) {
      console.error('Failed to cache response:', error);
    }
  }

  /**
   * Get cached response from IndexedDB
   */
  private async getCachedResponse<T>(endpoint: string): Promise<ApiResponse<T> | null> {
    try {
      const cache = await caches.open('api-cache');
      const cachedResponse = await cache.match(`${this.options.baseUrl}${endpoint}`);

      if (cachedResponse) {
        const data = await cachedResponse.json();
        const cacheDate = cachedResponse.headers.get('X-Cache-Date');

        return {
          data,
          error: null,
          status: 200,
          cached: true,
          cacheDate: cacheDate ? new Date(cacheDate) : null,
        } as ApiResponse<T>;
      }

      return null;
    } catch (error) {
      console.error('Failed to retrieve cached response:', error);
      return null;
    }
  }

  // Implement the API methods

  public async getProducts(): Promise<ApiResponse<Product[]>> {
    return this.request<Product[]>(API_ENDPOINTS.PRODUCTS);
  }

  public async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.request<Product>(API_ENDPOINTS.PRODUCT(id));
  }

  public async createOrder(order: Omit<Order, 'id'>): Promise<ApiResponse<Order>> {
    return this.request<Order>(API_ENDPOINTS.ORDERS, 'POST', order);
  }

  public async getOrder(id: string): Promise<ApiResponse<Order>> {
    return this.request<Order>(API_ENDPOINTS.ORDER(id));
  }

  public async updateInventory(productId: string, quantity: number): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/api/products/${productId}/inventory`, 'PUT', { quantity });
  }
}
