import path from 'path';

// Centralized configuration with environment variable fallbacks
const config = {
  // Server configuration
  port: Number(process.env.PORT || 5000),
  useHttps: process.env.USE_HTTPS === 'true',
  
  // Certificate paths
  certsDir: process.env.CERTS_DIR || '../certs/mock-api',
  
  // API behavior
  simulateLatency: process.env.SIMULATE_LATENCY === 'true',
  latencyMs: Number(process.env.LATENCY_MS || 200),
  
  // Database settings
  dbFilename: process.env.DB_FILENAME || 'database.sqlite',
  dbReset: process.env.DB_RESET === 'true',
  dbDebug: process.env.DB_DEBUG === 'true',
  seedData: process.env.SEED_DATA !== 'false',
  
  // Utility functions
  getCertPath: function(file: string) {
    return path.resolve(process.cwd(), this.certsDir, file);
  },
  
  // Database configuration object (for knex)
  get dbConfig() {
    return {
      client: 'better-sqlite3',
      connection: {
        filename: path.resolve(process.cwd(), this.dbFilename)
      },
      useNullAsDefault: true,
      debug: this.dbDebug
    };
  }
};

// For debugging during startup
console.log('Configuration loaded:');
console.log(`- Port: ${config.port}`);
console.log(`- HTTPS: ${config.useHttps}`);
console.log(`- Certificates directory: ${config.certsDir}`);
console.log(`- Database: ${config.dbFilename}`);
console.log(`- Seed data: ${config.seedData}`);

export default config;
