import {
  BluetoothDeviceConnection,
  BluetoothMessage,
  BluetoothServiceConfig,
} from '@appTypes/bluetooth.types';
import { ApiResponse } from '@appTypes/api.types';

export interface BluetoothServiceInterface {
  connect(): Promise<BluetoothDeviceConnection | null>;
  disconnect(): Promise<boolean>;
  isConnected(): boolean;
  sendMessage<T>(message: BluetoothMessage): Promise<ApiResponse<T>>;
  addConnectionListener(callback: (device: BluetoothDeviceConnection | null) => void): void;
  removeConnectionListener(callback: (device: BluetoothDeviceConnection | null) => void): void;
}
