import path from 'path';

const config = {
  port: Number(process.env.PORT || 3030),
  useHttps: process.env.USE_HTTPS === 'true',
  certsDir: process.env.CERTS_DIR || '../certs/mock-bt-bridge',
  
  deviceName: process.env.DEVICE_NAME || 'POS-Proxy-Mock',
  serviceUUID: process.env.SERVICE_UUID || '00000000-1111-2222-3333-444444444444',
  characteristicUUID: process.env.CHARACTERISTIC_UUID || '11111111-2222-3333-4444-555555555555',
  responseDelay: Number(process.env.RESPONSE_DELAY_MS || 200),
  
  getCertPath: function(file: string) {
    return path.resolve(process.cwd(), this.certsDir, file);
  }
};

export default config;
