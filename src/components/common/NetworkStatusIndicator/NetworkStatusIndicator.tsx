import React from 'react';
import { useNetwork } from '@contexts/NetworkContext';
import { ConnectionType } from '@appTypes/api.types';
import './NetworkStatusIndicator.css';

const NetworkStatusIndicator: React.FC = () => {
  const { networkState } = useNetwork();

  const getStatusLabel = () => {
    if (!networkState.isOnline) return 'Offline';
    return networkState.connectionType === ConnectionType.WLAN ? 'WiFi' : 'Bluetooth';
  };

  const getStatusIcon = () => {
    if (!networkState.isOnline) return '📵'; // Offline icon
    return networkState.connectionType === ConnectionType.WLAN ? '📶' : '📱';
  };

  const statusClass = networkState.isOnline
    ? `online ${networkState.connectionType.toLowerCase()}`
    : 'offline';

  return (
    <div className={`network-status ${statusClass}`}>
      <span className="network-status-icon">{getStatusIcon()}</span>
      <span className="network-status-label">{getStatusLabel()}</span>
    </div>
  );
};

export default NetworkStatusIndicator;
