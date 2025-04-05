import { useEffect, useState, useContext } from 'react';
import { NetworkState } from '@appTypes/api.types';
import { InversifyContext } from '../contexts/InversifyContext';
import { SERVICE_IDENTIFIERS } from '../services/inversify/identifiers';
import type { NetworkManagerInterface } from '../services/network/types';

export const useNetworkStatus = () => {
  // Get the service from InversifyJS container
  const container = useContext(InversifyContext);
  const networkManager = container.get<NetworkManagerInterface>(SERVICE_IDENTIFIERS.NetworkManager);

  const [networkState, setNetworkState] = useState<NetworkState>({
    isOnline: navigator.onLine,
    connectionType: networkManager.getConnectionType(),
    lastSync: null,
  });

  useEffect(() => {
    // Initial check
    const checkNetworkStatus = async () => {
      const state = await networkManager.checkConnectivity();
      setNetworkState(state);
    };

    checkNetworkStatus();

    // Set up listener for network changes
    const handleNetworkChange = (state: NetworkState) => {
      setNetworkState(state);
    };

    networkManager.addNetworkChangeListener(handleNetworkChange);

    // Cleanup
    return () => {
      networkManager.removeNetworkChangeListener(handleNetworkChange);
    };
  }, [networkManager]);

  return networkState;
};
