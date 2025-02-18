import neo4j from 'neo4j-driver';
import fs from 'fs';
import path from 'path';
import { env } from '../../../src/env.js';

const driver = neo4j.driver(env.NEO4J_URI, neo4j.auth.basic(env.NEO4J_USER, env.NEO4J_PASSWORD));
const session = driver.session();

const migrationsDir = path.join(__dirname, '../../../migrations');

async function applyMigrations() {
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const cypher = fs.readFileSync(filePath, 'utf-8');
    console.log(`Applying migration: ${file}`);
    await session.run(cypher);
  }

  await session.close();
  await driver.close();
}

applyMigrations()
  .then(() => {
    console.log('Migrations applied successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error applying migrations:', error);
    process.exit(1);
  });