import { useEffect, useState, useCallback, useContext } from 'react';
import { BluetoothDeviceConnection } from '@appTypes/bluetooth.types';
import { InversifyContext } from '../contexts/InversifyContext';
import { SERVICE_IDENTIFIERS } from '../services/inversify/identifiers';
import type { BluetoothServiceInterface } from '../services/bluetooth/types';

// Define the return type explicitly matching what BluetoothContext expects
interface BluetoothServiceHookResult {
  device: BluetoothDeviceConnection | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<BluetoothDeviceConnection | null>;
  disconnect: () => Promise<boolean>;
  addConnectionListener: (callback: (device: BluetoothDeviceConnection | null) => void) => void;
  removeConnectionListener: (callback: (device: BluetoothDeviceConnection | null) => void) => void;
}

export const useBluetoothService = (): BluetoothServiceHookResult => {
  // Get the service from InversifyJS container
  const container = useContext(InversifyContext);
  const bluetoothService = container.get<BluetoothServiceInterface>(
    SERVICE_IDENTIFIERS.BluetoothService
  );

  const [device, setDevice] = useState<BluetoothDeviceConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // Initialize with the correct value
  const [isConnected, setIsConnected] = useState<boolean>(bluetoothService.isConnected());

  useEffect(() => {
    const handleDeviceChange = (newDevice: BluetoothDeviceConnection | null) => {
      setDevice(newDevice);
      setIsConnected(newDevice !== null);
      setIsConnecting(false);
      if (!newDevice) {
        setError(null);
      }
    };

    bluetoothService.addConnectionListener(handleDeviceChange);

    return () => {
      bluetoothService.removeConnectionListener(handleDeviceChange);
    };
  }, [bluetoothService]);

  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);
      const connectedDevice = await bluetoothService.connect();

      if (!connectedDevice) {
        setError('Failed to connect to device');
        setIsConnecting(false);
      }

      return connectedDevice;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection error');
      setIsConnecting(false);
      return null;
    }
  }, [bluetoothService]);

  const disconnect = useCallback(async () => {
    try {
      const result = await bluetoothService.disconnect();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Disconnection error');
      return false;
    }
  }, [bluetoothService]);

  // Create bound methods for connection listeners
  const addConnectionListener = useCallback(
    (callback: (device: BluetoothDeviceConnection | null) => void) => {
      bluetoothService.addConnectionListener(callback);
    },
    [bluetoothService]
  );

  const removeConnectionListener = useCallback(
    (callback: (device: BluetoothDeviceConnection | null) => void) => {
      bluetoothService.removeConnectionListener(callback);
    },
    [bluetoothService]
  );

  // Return type explicitly casts to make TypeScript happy
  return {
    device,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    addConnectionListener,
    removeConnectionListener,
  } as {
    device: BluetoothDeviceConnection | null;
    isConnected: boolean;
    isConnecting: boolean;
    error: string | null;
    connect: () => Promise<BluetoothDeviceConnection | null>;
    disconnect: () => Promise<boolean>;
    addConnectionListener: (callback: (device: BluetoothDeviceConnection | null) => void) => void;
    removeConnectionListener: (
      callback: (device: BluetoothDeviceConnection | null) => void
    ) => void;
  };
};
