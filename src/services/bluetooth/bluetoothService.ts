import { injectable, inject, optional } from 'inversify';
import { BluetoothServiceInterface } from './types';
import { SERVICE_IDENTIFIERS } from '../inversify/identifiers';
import { POS_SERVICE_CONFIG } from './gattProfiles';
import type {
  BluetoothDeviceConnection,
  BluetoothMessage,
  BluetoothServiceConfig,
} from '@appTypes/bluetooth.types';
import { ApiResponse } from '@appTypes/api.types';

@injectable()
export class BluetoothService implements BluetoothServiceInterface {
  private device: BluetoothDeviceConnection | null = null;
  private config: BluetoothServiceConfig;
  private connectionListeners: ((device: BluetoothDeviceConnection | null) => void)[] = [];
  private pendingRequests: Map<
    string,
    {
      resolve: (value: ApiResponse<any>) => void;
      reject: (reason: any) => void;
      timeout: NodeJS.Timeout;
    }
  > = new Map();

  constructor(
    @optional() @inject(SERVICE_IDENTIFIERS.BluetoothConfig) config?: BluetoothServiceConfig
  ) {
    this.config = config || POS_SERVICE_CONFIG;
  }

  public async connect(): Promise<BluetoothDeviceConnection | null> {
    if (!navigator.bluetooth) {
      console.error('Web Bluetooth API is not available');
      return null;
    }

    try {
      // Request device with our service UUID
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: [this.config.serviceUUID] },
          ...(this.config.deviceNamePrefix ? [{ namePrefix: this.config.deviceNamePrefix }] : []),
        ],
      });

      // Setup disconnect listener
      device.addEventListener('gattserverdisconnected', this.handleDisconnection.bind(this));

      // Connect to GATT server
      const server = await device.gatt?.connect();
      if (!server) throw new Error('Failed to connect to GATT server');

      // Get primary service
      const service = await server.getPrimaryService(this.config.serviceUUID);

      // Get characteristic for read/write operations
      const characteristic = await service.getCharacteristic(this.config.characteristicUUID);

      // Start notifications to receive data
      await characteristic.startNotifications();
      characteristic.addEventListener(
        'characteristicvaluechanged',
        this.handleCharacteristicValueChanged.bind(this)
      );

      this.device = {
        device,
        server,
        service,
        characteristic,
        status: 'connected',
      };

      this.notifyConnectionListeners();
      return this.device;
    } catch (error) {
      console.error('Bluetooth connection failed:', error);
      this.device = null;
      this.notifyConnectionListeners();
      return null;
    }
  }

  public async disconnect(): Promise<boolean> {
    if (!this.device || !this.device.server) {
      return false;
    }

    try {
      // Stop notifications
      if (this.device.characteristic) {
        this.device.characteristic.removeEventListener(
          'characteristicvaluechanged',
          this.handleCharacteristicValueChanged.bind(this)
        );
        await this.device.characteristic.stopNotifications();
      }

      // Disconnect from GATT server
      this.device.server.disconnect();
      this.device = null;
      this.notifyConnectionListeners();
      return true;
    } catch (error) {
      console.error('Bluetooth disconnection error:', error);
      return false;
    }
  }

  public isConnected(): boolean {
    return this.device !== null && this.device.status === 'connected';
  }

  public async sendMessage<T>(message: BluetoothMessage): Promise<ApiResponse<T>> {
    const requestTimeout =
      Number(process.env.REACT_APP_BLUETOOTH_REQUEST_TIMEOUT_SECONDS || 10) * 1000;

    if (!this.isConnected() || !this.device?.characteristic) {
      return {
        data: null,
        error: 'Not connected to Bluetooth device',
        status: 0,
      };
    }

    return new Promise<ApiResponse<T>>((resolve, reject) => {
      try {
        // Convert message to ArrayBuffer
        const encoder = new TextEncoder();
        const messageString = JSON.stringify(message);
        const data = encoder.encode(messageString);

        // Set timeout for response
        const timeout = setTimeout(() => {
          this.pendingRequests.delete(message.id);
          reject({
            data: null,
            error: 'Request timeout',
            status: 408,
          });
        }, requestTimeout);

        // Store the promise resolvers
        this.pendingRequests.set(message.id, { resolve, reject, timeout });

        // Send the data
        this.device!.characteristic!.writeValue(data).catch((error) => {
          clearTimeout(timeout);
          this.pendingRequests.delete(message.id);
          reject({
            data: null,
            error: `Failed to send message: ${
              error instanceof Error ? error.message : String(error)
            }`,
            status: 0,
          });
        });
      } catch (error) {
        reject({
          data: null,
          error: `Message encoding error: ${
            error instanceof Error ? error.message : String(error)
          }`,
          status: 0,
        });
      }
    });
  }

  private handleCharacteristicValueChanged(event: Event): void {
    const characteristic = event.target as unknown as BluetoothRemoteGATTCharacteristic;
    const value = characteristic.value;

    if (!value) return;

    try {
      // Convert received ArrayBuffer to string
      const decoder = new TextDecoder('utf-8');
      const messageString = decoder.decode(value);
      const message = JSON.parse(messageString) as BluetoothMessage;

      // Find the pending request
      const pendingRequest = this.pendingRequests.get(message.id);
      if (pendingRequest) {
        clearTimeout(pendingRequest.timeout);
        this.pendingRequests.delete(message.id);

        if (message.type === 'response') {
          pendingRequest.resolve({
            data: message.payload,
            error: null,
            status: 200,
          });
        } else if (message.type === 'error') {
          pendingRequest.resolve({
            data: null,
            error: message.payload?.message || 'Unknown error',
            status: message.payload?.status || 500,
          });
        }
      }
    } catch (error) {
      console.error('Error processing Bluetooth message:', error);
    }
  }

  private handleDisconnection(): void {
    if (this.device) {
      this.device.status = 'disconnected';
      this.notifyConnectionListeners();

      // Reject all pending requests
      this.pendingRequests.forEach((request) => {
        clearTimeout(request.timeout);
        request.reject({
          data: null,
          error: 'Device disconnected',
          status: 0,
        });
      });

      this.pendingRequests.clear();
      this.device = null;
    }
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

  private notifyConnectionListeners(): void {
    this.connectionListeners.forEach((callback) => callback(this.device));
  }
}
