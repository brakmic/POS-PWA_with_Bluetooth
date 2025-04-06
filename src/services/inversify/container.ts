import { Container } from 'inversify';
import { SERVICE_IDENTIFIERS } from './identifiers';

// Import interfaces
import type {
  BluetoothServiceInterface,
  NetworkManagerInterface,
  NetworkConfigProviderInterface,
  ApiServiceInterface,
  CacheManagerInterface,
  VatServiceInterface,
} from './interfaces';
import type { ApiServiceOptions } from '../api';

// Import concrete implementations
import { BluetoothService } from '../bluetooth';
import { MockBluetoothService } from '../bluetooth';
import { NetworkManager } from '../network';
import { NetworkConfigProvider } from '../network';
import { ApiService } from '../api';
import { CacheManager } from '../cache';
import { VatService } from '../vat';
import { API_CONFIG } from '../api';
import { POS_SERVICE_CONFIG } from '../bluetooth';

// Create container
const container = new Container({ defaultScope: 'Singleton' });

// Configure service registrations
export function configureContainer(): Container {
  // 1. Register NetworkConfigProvider first (dependency for NetworkManager)
  container
    .bind<NetworkConfigProviderInterface>(SERVICE_IDENTIFIERS.NetworkConfigProvider)
    .to(NetworkConfigProvider)
    .inSingletonScope();

  // 2. Register NetworkManager
  container
    .bind<NetworkManagerInterface>(SERVICE_IDENTIFIERS.NetworkManager)
    .to(NetworkManager)
    .inSingletonScope();

  // 3. Register Bluetooth configuration
  container.bind(SERVICE_IDENTIFIERS.BluetoothConfig).toConstantValue(POS_SERVICE_CONFIG);

  // 4. Register BluetoothService with environment-based selection
  const useMockBluetooth =
    process.env.NODE_ENV === 'development' &&
    process.env.REACT_APP_MOCK_BLUETOOTH_URL !== undefined;

  if (useMockBluetooth) {
    container
      .bind<BluetoothServiceInterface>(SERVICE_IDENTIFIERS.BluetoothService)
      .to(MockBluetoothService)
      .inSingletonScope();
  } else {
    container
      .bind<BluetoothServiceInterface>(SERVICE_IDENTIFIERS.BluetoothService)
      .to(BluetoothService)
      .inSingletonScope();
  }

  // 5. Register API configuration
  container.bind<ApiServiceOptions>(SERVICE_IDENTIFIERS.ApiConfig).toConstantValue(API_CONFIG);

  // 6. Register ApiService
  container
    .bind<ApiServiceInterface>(SERVICE_IDENTIFIERS.ApiService)
    .to(ApiService)
    .inSingletonScope();

  // 7. Register CacheManager
  container
    .bind<CacheManagerInterface>(SERVICE_IDENTIFIERS.CacheManager)
    .to(CacheManager)
    .inSingletonScope();

  // 8. Register VAT Service
  container
    .bind<VatServiceInterface>(SERVICE_IDENTIFIERS.VatService)
    .to(VatService)
    .inSingletonScope();

  return container;
}

// Export the configured container
export const appContainer = configureContainer();
