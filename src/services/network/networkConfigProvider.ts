import { injectable } from 'inversify';
import { ConnectionType } from '@appTypes/api.types';

export interface NetworkConfigProviderInterface {
  getOverrides(): {
    forceOffline?: boolean;
    forceConnectionType?: ConnectionType;
  };
}

/**
 * Provides network configuration that can be influenced by dev tools
 */
@injectable()
export class NetworkConfigProvider implements NetworkConfigProviderInterface {
  /**
   * Gets the current network configuration overrides, if any
   */
  public getOverrides() {
    // Check for debug mode overrides
    const forceOffline = window.sessionStorage.getItem('FORCE_OFFLINE') === 'true';
    const forceBluetoothOnly = window.sessionStorage.getItem('FORCE_BLUETOOTH_ONLY') === 'true';

    return {
      forceOffline,
      forceConnectionType: forceBluetoothOnly ? ConnectionType.BLUETOOTH : undefined,
    };
  }
}
