import { injectable, inject } from 'inversify';
import { SERVICE_IDENTIFIERS } from '../inversify/identifiers';
import { ConnectionType, NetworkState } from '@appTypes/api.types';
import { NetworkManagerInterface } from './types';
import type { NetworkConfigProviderInterface } from './networkConfigProvider';

@injectable()
export class NetworkManager implements NetworkManagerInterface {
  private networkState: NetworkState;
  private listeners: ((state: NetworkState) => void)[] = [];

  constructor(
    @inject(SERVICE_IDENTIFIERS.NetworkConfigProvider)
    private configProvider: NetworkConfigProviderInterface
  ) {
    this.networkState = {
      isOnline: navigator.onLine,
      connectionType: navigator.onLine ? ConnectionType.WLAN : ConnectionType.OFFLINE,
      lastSync: navigator.onLine ? new Date() : null,
    };

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => this.handleNetworkChange(true));
    window.addEventListener('offline', () => this.handleNetworkChange(false));
  }

  private async handleNetworkChange(isOnline: boolean): Promise<void> {
    const previousState = { ...this.networkState };

    if (isOnline) {
      this.networkState.isOnline = true;
      this.networkState.connectionType = ConnectionType.WLAN;
      this.networkState.lastSync = new Date();
    } else {
      const bluetoothAvailable = await this.checkBluetoothAvailability();

      this.networkState.isOnline = bluetoothAvailable;
      this.networkState.connectionType = bluetoothAvailable
        ? ConnectionType.BLUETOOTH
        : ConnectionType.OFFLINE;
    }

    // Notify listeners only if the state has changed
    if (
      previousState.isOnline !== this.networkState.isOnline ||
      previousState.connectionType !== this.networkState.connectionType
    ) {
      this.notifyListeners();
    }
  }

  private async checkBluetoothAvailability(): Promise<boolean> {
    if (!navigator.bluetooth) {
      return false;
    }

    try {
      // Just check if Bluetooth is available, don't actually connect
      await navigator.bluetooth.getAvailability();
      return true;
    } catch (error) {
      console.error('Bluetooth check failed:', error);
      return false;
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((callback) => callback(this.networkState));
  }

  public async checkConnectivity(): Promise<NetworkState> {
    // Get configuration overrides
    const overrides = this.configProvider.getOverrides();

    // Apply overrides if present
    if (overrides.forceOffline) {
      this.networkState.isOnline = false;
      this.networkState.connectionType = ConnectionType.OFFLINE;
      return this.networkState;
    }

    if (overrides.forceConnectionType) {
      const isConnected =
        overrides.forceConnectionType === ConnectionType.BLUETOOTH
          ? await this.checkBluetoothAvailability()
          : true;

      this.networkState.isOnline = isConnected;
      this.networkState.connectionType = isConnected
        ? overrides.forceConnectionType
        : ConnectionType.OFFLINE;

      return this.networkState;
    }

    if (navigator.onLine) {
      this.networkState.isOnline = true;
      this.networkState.connectionType = ConnectionType.WLAN;
      return this.networkState;
    }

    const bluetoothAvailable = await this.checkBluetoothAvailability();

    this.networkState.isOnline = bluetoothAvailable;
    this.networkState.connectionType = bluetoothAvailable
      ? ConnectionType.BLUETOOTH
      : ConnectionType.OFFLINE;

    return this.networkState;
  }

  public getConnectionType(): ConnectionType {
    return this.networkState.connectionType;
  }

  public addNetworkChangeListener(callback: (state: NetworkState) => void): void {
    this.listeners.push(callback);
  }

  public removeNetworkChangeListener(callback: (state: NetworkState) => void): void {
    const index = this.listeners.indexOf(callback);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }
}
