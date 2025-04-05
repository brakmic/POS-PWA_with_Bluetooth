import knex from 'knex';
import config from '../config';
import { setupSchema } from './migrations';
import { seedDatabase } from './seeds';

// Create database connection using unified config
export const db = knex(config.dbConfig);

// Initialize the database - run migrations and seeds
export async function initializeDatabase() {
  try {
    // Check if we need to reset the database
    if (config.dbReset) {
      console.log('Resetting database...');
      await dropAllTables();
    }

    // Run migrations
    await setupSchema(db);

    // Seed data if needed
    if (config.seedData) {
      console.log('Seeding database...');
      await seedDatabase(db);
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

// Drop all tables for reset
async function dropAllTables() {
  const tables = await db
    .select('name')
    .from('sqlite_master')
    .where('type', 'table')
    .whereNot('name', 'sqlite_sequence');

  for (const table of tables) {
    await db.schema.dropTable(table.name);
  }
}
