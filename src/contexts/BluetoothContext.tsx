import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { BluetoothDeviceConnection } from '@appTypes/bluetooth.types';
import { useBluetoothService } from '@hooks/useBluetoothService';

interface BluetoothContextValue {
  device: BluetoothDeviceConnection | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<boolean>; // Note: Return type is boolean
  disconnect: () => Promise<void>; // Note: Return type is void
  clearError: () => void;
  addConnectionListener: (callback: (device: BluetoothDeviceConnection | null) => void) => void;
  removeConnectionListener: (callback: (device: BluetoothDeviceConnection | null) => void) => void;
}

/* eslint-disable @typescript-eslint/no-empty-function */
const BluetoothContext = createContext<BluetoothContextValue>({
  device: null,
  isConnected: false,
  isConnecting: false,
  error: null,
  connect: async () => false,
  disconnect: async () => {
    return Promise.resolve();
  },
  clearError: () => {},
  addConnectionListener: (callback: (device: BluetoothDeviceConnection | null) => void) => {},
  removeConnectionListener: (callback: (device: BluetoothDeviceConnection | null) => void) => {},
});
/* eslint-enable @typescript-eslint/no-empty-function */

export const BluetoothProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    device: serviceDevice,
    isConnected: serviceIsConnected,
    isConnecting: serviceIsConnecting,
    error: serviceError,
    connect: serviceConnect,
    disconnect: serviceDisconnect,
    addConnectionListener,
    removeConnectionListener,
  } = useBluetoothService();

  const [device, setDevice] = useState<BluetoothDeviceConnection | null>(serviceDevice);
  const [isConnecting, setIsConnecting] = useState<boolean>(serviceIsConnecting);
  // Use the correct value from the service
  const [isConnected, setIsConnected] = useState<boolean>(serviceIsConnected);
  const [error, setError] = useState<string | null>(serviceError);
  const isAttemptingConnection = useRef(false);

  // Update local state when service state changes
  useEffect(() => {
    setDevice(serviceDevice);
    setIsConnected(serviceIsConnected);
    setIsConnecting(serviceIsConnecting);
    if (serviceError) {
      setError(serviceError);
    }
  }, [serviceDevice, serviceIsConnected, serviceIsConnecting, serviceError]);

  const handleDeviceChange = useCallback(
    (newDevice: BluetoothDeviceConnection | null) => {
      console.log('Device connection status changed:', newDevice ? 'connected' : 'disconnected');
      setDevice(newDevice);
      setIsConnected(newDevice !== null && newDevice.status === 'connected');

      // Clear errors when successfully connected
      if (newDevice !== null && newDevice.status === 'connected' && error) {
        setError(null);
      }
    },
    [error]
  ); // Only recreate when error changes

  // Explicitly clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const connect = async (): Promise<boolean> => {
    // Prevent multiple simultaneous connection attempts
    if (isAttemptingConnection.current) {
      console.log('Connection attempt already in progress');
      return false;
    }

    try {
      isAttemptingConnection.current = true;
      setIsConnecting(true);
      setError(null); // Clear any previous errors

      console.log('BluetoothContext: Attempting to connect...');

      // Add a timeout to prevent indefinite waiting
      const connectionPromise = serviceConnect();
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), 10000);
      });

      const connection = await Promise.race([connectionPromise, timeoutPromise]);

      if (connection) {
        console.log('BluetoothContext: Connection successful');
        setDevice(connection);
        setIsConnected(true);
        setError(null); // Clear any errors on success
        return true;
      } else {
        console.error('BluetoothContext: Connection failed (no connection returned)');
        setError('Failed to connect to Bluetooth device');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('BluetoothContext: Connection error:', errorMessage);

      // Don't show user canceled errors - these are expected
      if (errorMessage && errorMessage.includes('User cancelled')) {
        setError(null);
      } else {
        setError(`Bluetooth connection failed: ${errorMessage}`);
      }

      return false;
    } finally {
      setIsConnecting(false);
      isAttemptingConnection.current = false;
    }
  };

  const disconnect = async (): Promise<void> => {
    try {
      await serviceDisconnect();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect from Bluetooth device');
    }
  };

  useEffect(() => {
    // Add the connection listener when the component mounts
    addConnectionListener(handleDeviceChange);

    // Remove the listener when the component unmounts
    return () => {
      removeConnectionListener(handleDeviceChange);
    };
  }, [handleDeviceChange, addConnectionListener, removeConnectionListener]);

  return (
    <BluetoothContext.Provider
      value={{
        device,
        isConnected,
        isConnecting,
        error,
        connect,
        disconnect,
        clearError,
        addConnectionListener,
        removeConnectionListener,
      }}
    >
      {children}
    </BluetoothContext.Provider>
  );
};

export const useBluetooth = () => useContext(BluetoothContext);
