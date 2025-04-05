import { BluetoothDeviceConnection } from '@appTypes/bluetooth.types';

/**
 * Format a UUID string to a more readable format
 */
export function formatUUID(uuid: string): string {
  return uuid.toLowerCase();
}

/**
 * Get the service UUID for a Bluetooth device
 * Note: Web Bluetooth API doesn't expose UUID directly from service object
 */
export function getServiceUUID(device: BluetoothDeviceConnection): string {
  try {
    // For real and mock devices, read from consistent sources
    const uuid =
      process.env.REACT_APP_BLUETOOTH_SERVICE_UUID || '00000000-1111-2222-3333-444444444444';

    return formatUUID(uuid);
  } catch (error) {
    console.warn('Error getting service UUID:', error);
    return 'Not available';
  }
}

/**
 * Get the characteristic UUID for a Bluetooth device
 */
export function getCharacteristicUUID(device: BluetoothDeviceConnection): string {
  try {
    // UUID is a property on BluetoothRemoteGATTCharacteristic
    if (device.characteristic?.uuid) {
      return formatUUID(device.characteristic.uuid);
    }

    // Fallback to mock device configuration
    if (device.device.name?.includes('Mock')) {
      return formatUUID(
        process.env.REACT_APP_BLUETOOTH_CHARACTERISTIC_UUID ||
          '11111111-2222-3333-4444-555555555555'
      );
    }

    return 'Not available';
  } catch (error) {
    console.warn('Error getting characteristic UUID:', error);
    return 'Not available';
  }
}

/**
 * Check if the device is a mock device
 */
export function isMockDevice(device: BluetoothDeviceConnection): boolean {
  return !!device.device.name?.includes('Mock');
}

/**
 * Get the protocol version (mock implementation,
 * in real app this would come from device)
 */
export function getProtocolVersion(device: BluetoothDeviceConnection): string {
  // In a real app, this might come from device information
  return 'v1.0';
}

/**
 * Get connection time as a formatted string
 */
export function getConnectionTime(device: BluetoothDeviceConnection): string {
  // In production, this would come from the device connection timestamp
  // Here we're just returning the current time
  return new Date().toLocaleString();
}

/**
 * Get the mock bridge URL for mock devices
 */
export function getMockBridgeURL(): string {
  return process.env.REACT_APP_MOCK_BLUETOOTH_URL || 'wss://localhost:3030';
}
