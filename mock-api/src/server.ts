import fs from 'fs';
import https from 'https';
import path from 'path';
import dotenvSafe from 'dotenv-safe';

// Load environment variables first
dotenvSafe.config({
  path: path.resolve(__dirname, '../.env'),
  example: path.resolve(__dirname, '../.env.example'),
  allowEmptyValues: true
});

// Import unified config after env vars are loaded
import config from './config';
import { initializeDatabase } from './db';
import app from './app';

// Initialize the database and start server
async function start() {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Create HTTPS server if needed
    if (config.useHttps) {
      try {
        const options = {
          key: fs.readFileSync(config.getCertPath('key.pem')),
          cert: fs.readFileSync(config.getCertPath('cert.pem'))
        };
        
        https.createServer(options, app).listen(config.port, () => {
          console.log(`🚀 HTTPS API mock server running on port ${config.port}`);
        });
      } catch (error) {
        console.error('❌ Error loading SSL certificates:', error);
        console.log('⚠️ Falling back to HTTP...');
        
        app.listen(config.port, () => {
          console.log(`🚀 HTTP API mock server running on port ${config.port}`);
        });
      }
    } else {
      app.listen(config.port, () => {
        console.log(`🚀 HTTP API mock server running on port ${config.port}`);
      });
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
start();
