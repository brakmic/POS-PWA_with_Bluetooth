import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { NetworkState, ConnectionType } from '@appTypes/api.types';
import { useService } from '../hooks/useService';
import { NetworkManagerInterface } from '../services/inversify/interfaces';
import { SERVICE_IDENTIFIERS } from '../services/inversify/identifiers';

interface NetworkContextValue {
  networkState: NetworkState;
  checkConnectivity: () => Promise<void>;
}

const defaultNetworkState: NetworkState = {
  isOnline: navigator.onLine,
  connectionType: navigator.onLine ? ConnectionType.WLAN : ConnectionType.OFFLINE,
  lastSync: navigator.onLine ? new Date() : null,
};

/* eslint-disable @typescript-eslint/no-empty-function */
const NetworkContext = createContext<NetworkContextValue>({
  networkState: defaultNetworkState,
  checkConnectivity: async () => {},
});
/* eslint-enable @typescript-eslint/no-empty-function */

// Using a reducer guarantees state updates will trigger re-renders
function networkReducer(state: NetworkState, newState: NetworkState): NetworkState {
  // Always return a new object to ensure React detects the change
  return { ...newState };
}

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get the network manager from the container
  const networkManager = useService<NetworkManagerInterface>(SERVICE_IDENTIFIERS.NetworkManager);
  // Use reducer instead of useState for more reliable state updates
  const [networkState, dispatchNetworkState] = useReducer(networkReducer, defaultNetworkState);

  // Using a ref to prevent infinite loops in useEffect
  const networkStateRef = React.useRef(networkState);

  // Updated handler to guarantee React state updates
  const handleNetworkChange = React.useCallback((newState: NetworkState) => {
    // Update the ref first
    networkStateRef.current = newState;
    // Dispatch through the reducer
    dispatchNetworkState(newState);
  }, []);

  const checkConnectivity = React.useCallback(async () => {
    const currentState = await networkManager.checkConnectivity();
    handleNetworkChange(currentState);
  }, [handleNetworkChange]);

  // Initial setup and cleanup
  useEffect(() => {
    // Initial check
    checkConnectivity();

    // Add listener for network changes
    networkManager.addNetworkChangeListener(handleNetworkChange);

    return () => {
      networkManager.removeNetworkChangeListener(handleNetworkChange);
    };
  }, [checkConnectivity, handleNetworkChange]);

  // Create a stable context value with memoization
  const contextValue = React.useMemo(
    () => ({
      networkState,
      checkConnectivity,
    }),
    [networkState, checkConnectivity]
  );

  return <NetworkContext.Provider value={contextValue}>{children}</NetworkContext.Provider>;
};

export const useNetwork = () => useContext(NetworkContext);
