import React, { useState, useEffect } from 'react';
import { useNetwork } from '@contexts/NetworkContext';
import './NetworkModeSwitcher.css';

const NetworkModeSwitcher: React.FC = () => {
  const [currentMode, setCurrentMode] = useState('auto');
  const { checkConnectivity } = useNetwork();

  // Apply the selected network mode
  const changeNetworkMode = (mode: string) => {
    setCurrentMode(mode);
    localStorage.setItem('DEBUG_NETWORK_MODE', mode);
    applyNetworkMode(mode);
  };

  // Apply network mode on component mount and when changed
  useEffect(() => {
    const savedMode = localStorage.getItem('DEBUG_NETWORK_MODE') || 'auto';
    setCurrentMode(savedMode);
    applyNetworkMode(savedMode);
  }, []);

  // Helper function to apply network mode settings
  const applyNetworkMode = (mode: string) => {
    // Reset any overrides first
    window.sessionStorage.removeItem('FORCE_OFFLINE');
    window.sessionStorage.removeItem('FORCE_BLUETOOTH_ONLY');

    // Apply the selected mode
    switch (mode) {
      case 'offline':
        window.sessionStorage.setItem('FORCE_OFFLINE', 'true');
        break;
      case 'bluetooth':
        window.sessionStorage.setItem('FORCE_BLUETOOTH_ONLY', 'true');
        break;
      case 'wlan':
        // Just use the default navigator.onLine behavior
        break;
      case 'auto':
      default:
        // Use the actual device state
        break;
    }

    checkConnectivity().then(() => {
      console.log('Network mode updated to:', mode);
    });
  };

  return (
    <div className="network-mode-switcher">
      <h3>Network Testing</h3>
      <div className="mode-options">
        <button
          className={currentMode === 'auto' ? 'active' : ''}
          onClick={() => changeNetworkMode('auto')}
        >
          Auto-Detect
        </button>

        <button
          className={currentMode === 'wlan' ? 'active' : ''}
          onClick={() => changeNetworkMode('wlan')}
        >
          Force WLAN
        </button>

        <button
          className={currentMode === 'bluetooth' ? 'active' : ''}
          onClick={() => changeNetworkMode('bluetooth')}
        >
          Force Bluetooth
        </button>

        <button
          className={currentMode === 'offline' ? 'active' : ''}
          onClick={() => changeNetworkMode('offline')}
        >
          Force Offline
        </button>
      </div>
    </div>
  );
};

export default NetworkModeSwitcher;
