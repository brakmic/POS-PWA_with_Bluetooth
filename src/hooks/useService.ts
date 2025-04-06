import { useContext } from 'react';
import { InversifyContext } from '../contexts/InversifyContext';
import { SERVICE_IDENTIFIERS } from '../services/inversify/identifiers';
import type {
  NetworkManagerInterface,
  BluetoothServiceInterface,
  ApiServiceInterface,
  CacheManagerInterface,
  VatServiceInterface,
} from '../services/inversify/interfaces';

export function useNetworkManagerDirect(): NetworkManagerInterface {
  const container = useContext(InversifyContext);
  return container.get<NetworkManagerInterface>(SERVICE_IDENTIFIERS.NetworkManager);
}

export function useBluetoothServiceDirect(): BluetoothServiceInterface {
  const container = useContext(InversifyContext);
  return container.get<BluetoothServiceInterface>(SERVICE_IDENTIFIERS.BluetoothService);
}

export function useApiServiceDirect(): ApiServiceInterface {
  const container = useContext(InversifyContext);
  return container.get<ApiServiceInterface>(SERVICE_IDENTIFIERS.ApiService);
}

export function useCacheManagerDirect(): CacheManagerInterface {
  const container = useContext(InversifyContext);
  return container.get<CacheManagerInterface>(SERVICE_IDENTIFIERS.CacheManager);
}

export const useVatServiceDirect = (): VatServiceInterface => {
  const container = useContext(InversifyContext);
  return container.get<VatServiceInterface>(SERVICE_IDENTIFIERS.VatService);
};

// Generic service hook if needed
export function useService<T>(identifier: symbol): T {
  const container = useContext(InversifyContext);
  return container.get<T>(identifier);
}
