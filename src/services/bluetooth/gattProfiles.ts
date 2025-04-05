import { BluetoothServiceConfig } from '@appTypes/bluetooth.types';

// Example GATT profile for the POS application
export const POS_SERVICE_CONFIG: BluetoothServiceConfig = {
  serviceUUID:
    process.env.REACT_APP_BLUETOOTH_SERVICE_UUID || '00000000-1111-2222-3333-444444444444',
  characteristicUUID: '11111111-2222-3333-4444-555555555555',
  deviceNamePrefix: 'POS-Proxy',
};
