#!/usr/bin/env node

/**
 * Simple script to run migrations
 */
import { migrate } from './src/server/db/migrate.js';

console.log('🚀 Running database migrations...');

migrate()
  .then(() => {
    console.log('✅ Migrations completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }); 