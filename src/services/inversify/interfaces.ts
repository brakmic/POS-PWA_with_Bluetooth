import type { BluetoothServiceInterface } from '../bluetooth';
import type { NetworkManagerInterface, NetworkConfigProviderInterface } from '../network';
import type { ApiServiceInterface, ApiServiceOptions } from '../api';
import type { CacheManagerInterface } from '../cache';

// Use 'export type' for re-exporting types
export type {
  BluetoothServiceInterface,
  NetworkManagerInterface,
  ApiServiceInterface,
  CacheManagerInterface,
  NetworkConfigProviderInterface,
  ApiServiceOptions,
};

export interface ServiceProviderInterface {
  get<T>(serviceIdentifier: symbol): T;
}
