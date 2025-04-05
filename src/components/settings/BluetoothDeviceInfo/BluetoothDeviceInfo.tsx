import React from 'react';
import { BluetoothDeviceConnection } from '@appTypes/bluetooth.types';
import {
  getServiceUUID,
  getCharacteristicUUID,
  isMockDevice,
  getProtocolVersion,
  getConnectionTime,
  getMockBridgeURL,
} from '@utils/bluetooth';
import './BluetoothDeviceInfo.css';

interface BluetoothDeviceInfoProps {
  device: BluetoothDeviceConnection;
}

const BluetoothDeviceInfo: React.FC<BluetoothDeviceInfoProps> = ({ device }) => {
  // Get all device details using the utility functions
  const serviceUUID = getServiceUUID(device);
  const characteristicUUID = getCharacteristicUUID(device);
  const isMock = isMockDevice(device);
  const protocolVersion = getProtocolVersion(device);
  const connectionTime = getConnectionTime(device);

  return (
    <div className="bluetooth-device-info">
      <h3>Connected Device Details</h3>

      <div className="device-info-grid">
        <div className="info-group basic-info">
          <h4>Basic Information</h4>
          <div className="info-row">
            <span className="info-label">Device Name:</span>
            <span className="info-value">{device.device.name || 'Unknown'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Device ID:</span>
            <span className="info-value">{device.device.id || 'Unknown'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Connection Status:</span>
            <span className="info-value status-connected">{device.status}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Connected At:</span>
            <span className="info-value">{connectionTime}</span>
          </div>
        </div>

        <div className="info-group technical-info">
          <h4>Technical Details</h4>
          <div className="info-row">
            <span className="info-label">Service UUID:</span>
            <span className="info-value uuid">{serviceUUID}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Characteristic UUID:</span>
            <span className="info-value uuid">{characteristicUUID}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Protocol Version:</span>
            <span className="info-value">{protocolVersion}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Device Type:</span>
            <span className="info-value">{isMock ? 'Mock Device' : 'Physical Device'}</span>
          </div>

          {/* Additional mock device info for mock device only */}
          {isMock && (
            <div className="info-row">
              <span className="info-label">Mock Bridge URL:</span>
              <span className="info-value">{getMockBridgeURL()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BluetoothDeviceInfo;
