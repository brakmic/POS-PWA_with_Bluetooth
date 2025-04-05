import React from 'react';
import { useBluetooth } from '@contexts/BluetoothContext';
import { useNetwork } from '@contexts/NetworkContext';
import BluetoothDeviceInfo from '@components/settings/BluetoothDeviceInfo';
import NetworkModeSwitcher from '@components/dev/NetworkModeSwitcher/NetworkModeSwitcher';
import './Settings.css';

const showDevTools =
  process.env.NODE_ENV === 'development' || process.env.REACT_APP_ENABLE_DEV_TOOLS === 'true';

const Settings: React.FC = () => {
  const { device, isConnected, isConnecting, error, connect, disconnect } = useBluetooth();
  const { networkState, checkConnectivity } = useNetwork();

  const handleConnectBluetooth = () => {
    console.log('Manual Bluetooth connection attempt');
    connect();
  };

  return (
    <div className="settings-page">
      <h1>Settings</h1>

      <section className="settings-section">
        <h2>Network Settings</h2>
        <div className="status-item">
          <span className="status-label">Status:</span>
          <span className={`status-value ${networkState.isOnline ? 'online' : 'offline'}`}>
            {networkState.isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">Connection Type:</span>
          <span className="status-value">{networkState.connectionType}</span>
        </div>
        <button onClick={checkConnectivity} className="primary-button">
          Check Connection
        </button>
      </section>

      <section className="settings-section">
        <h2>Bluetooth Settings</h2>

        <div className="status-item">
          <span className="status-label">Status:</span>
          <span className={`status-value ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {device && <BluetoothDeviceInfo device={device} />}

        {error && <div className="error-message">Error: {error}</div>}

        <div className="button-group">
          {!isConnected ? (
            <button
              onClick={handleConnectBluetooth}
              disabled={isConnecting}
              className="primary-button"
            >
              {isConnecting ? 'Connecting...' : 'Connect Device'}
            </button>
          ) : (
            <button onClick={disconnect} className="secondary-button">
              Disconnect Device
            </button>
          )}
        </div>
      </section>

      {/* Developer Tools */}
      {showDevTools && (
        <section className="settings-section">
          <h2>Developer Options</h2>
          <NetworkModeSwitcher />
        </section>
      )}
    </div>
  );
};

export default Settings;
