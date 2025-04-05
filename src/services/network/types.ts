import { ConnectionType, NetworkState } from '@appTypes/api.types';

export interface NetworkManagerInterface {
  checkConnectivity(): Promise<NetworkState>;
  getConnectionType(): ConnectionType;
  addNetworkChangeListener(callback: (state: NetworkState) => void): void;
  removeNetworkChangeListener(callback: (state: NetworkState) => void): void;
}
