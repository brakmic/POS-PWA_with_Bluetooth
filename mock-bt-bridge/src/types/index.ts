export interface MockDevice {
  name: string;
  serviceUUID: string;
  characteristicUUID: string;
  connected: boolean;
  responseDelay: number;
}

export interface BluetoothMessage {
  id: string;
  type: 'request' | 'response' | 'error';
  endpoint: string;
  payload: any;
  timestamp: number;
}

export interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
  status: number;
}

export interface PendingRequest {
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  timeout: NodeJS.Timeout;
}
