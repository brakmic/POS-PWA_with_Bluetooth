export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export enum ConnectionType {
  WLAN = 'wlan',
  BLUETOOTH = 'bluetooth',
  OFFLINE = 'offline',
}

export interface NetworkState {
  isOnline: boolean;
  connectionType: ConnectionType;
  lastSync: Date | null;
}
