export interface BluetoothServiceConfig {
  serviceUUID: string;
  characteristicUUID: string;
  deviceNamePrefix?: string;
}

export type BluetoothConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// Fix: Use a different name to avoid the circular reference
export interface BluetoothDeviceConnection {
  device: globalThis.BluetoothDevice;
  server?: BluetoothRemoteGATTServer;
  service?: BluetoothRemoteGATTService;
  characteristic?: BluetoothRemoteGATTCharacteristic;
  status: BluetoothConnectionStatus;
}

export interface BluetoothMessage {
  type: 'request' | 'response' | 'error';
  endpoint: string;
  payload: any;
  id: string;
  timestamp: number;
}
