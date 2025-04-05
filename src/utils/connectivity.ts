import { ConnectionType } from '@appTypes/api.types';
import { InversifyContext } from '../contexts/InversifyContext';
import { useContext } from 'react';
import { SERVICE_IDENTIFIERS } from '../services/inversify/identifiers';
import type { BluetoothServiceInterface } from '../services/bluetooth/types';

// A React hook version for components
export const useConnectionMethod = () => {
  const container = useContext(InversifyContext);
  const bluetoothService = container.get<BluetoothServiceInterface>(
    SERVICE_IDENTIFIERS.BluetoothService
  );

  return {
    detectConnectionMethod: async (): Promise<ConnectionType> => {
      // Check internet connectivity
      if (navigator.onLine) {
        return ConnectionType.WLAN;
      }

      // Check Bluetooth connectivity
      if (bluetoothService.isConnected()) {
        return ConnectionType.BLUETOOTH;
      }

      return ConnectionType.OFFLINE;
    },
  };
};

// For non-component code, use dynamic import
export const detectConnectionMethod = async (): Promise<ConnectionType> => {
  // Check internet connectivity
  if (navigator.onLine) {
    return ConnectionType.WLAN;
  }

  try {
    // Import dynamically to avoid circular dependencies
    const { appContainer } = await import('../services/inversify/container');
    const bluetoothService = appContainer.get<BluetoothServiceInterface>(
      SERVICE_IDENTIFIERS.BluetoothService
    );

    // Check Bluetooth connectivity
    if (bluetoothService.isConnected()) {
      return ConnectionType.BLUETOOTH;
    }
  } catch (error) {
    console.error('Error checking bluetooth connection:', error);
  }

  return ConnectionType.OFFLINE;
};

export const isUrlReachable = async (url: string, timeoutMs = 5000): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    return false;
  }
};
