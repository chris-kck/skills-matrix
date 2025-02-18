import { setupSchema } from './schema';
import { closeDb } from './db';

async function main() {
  try {
    await setupSchema();
    await closeDb();
    process.exit(0);
  } catch (error) {
    console.error('Failed to setup schema:', error);
    process.exit(1);
  }
}

main();
