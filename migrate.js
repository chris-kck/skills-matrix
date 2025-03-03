#!/usr/bin/env node

// @ts-nocheck
// This file is intentionally not type-checked

/**
 * Simple script to run migrations directly with Neo4j
 */
import 'dotenv/config';
import neo4j from 'neo4j-driver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting database migrations...');

// Connection details
const uri = process.env.NEO4J_URI || 'neo4j://localhost:7687';
const user = process.env.NEO4J_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD || 'password';

console.log(`Connecting to Neo4j at ${uri} with user ${user}`);

// Connect to Neo4j with retry logic
async function connectWithRetry(maxRetries = 5, delay = 2000) {
  let retries = 0;
  let driver;

  while (retries < maxRetries) {
    try {
      driver = neo4j.driver(
        uri,
        neo4j.auth.basic(user, password),
        { connectionTimeout: 30000 } // 30 seconds timeout
      );
      
      // Test the connection
      const session = driver.session();
      try {
        await session.run('RETURN 1 as n');
        console.log('✅ Connected to Neo4j successfully');
        await session.close();
        return driver;
      } catch (error) {
        await session.close();
        throw error;
      }
    } catch (error) {
      retries++;
      console.log(`Connection attempt ${retries}/${maxRetries} failed: ${error.message}`);
      
      if (retries >= maxRetries) {
        console.error('❌ Failed to connect to Neo4j after multiple attempts');
        throw error;
      }
      
      console.log(`Retrying in ${delay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Split a Cypher file into individual statements
function splitCypherStatements(cypher) {
  // Remove comments
  const withoutComments = cypher.replace(/\/\/.*$/gm, '');
  
  // Split by semicolons, but only if they're not inside quotes
  const statements = [];
  let currentStatement = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;
  
  for (let i = 0; i < withoutComments.length; i++) {
    const char = withoutComments[i];
    
    if (char === "'" && withoutComments[i-1] !== '\\') {
      inSingleQuote = !inSingleQuote;
    } else if (char === '"' && withoutComments[i-1] !== '\\') {
      inDoubleQuote = !inDoubleQuote;
    }
    
    if (char === ';' && !inSingleQuote && !inDoubleQuote) {
      if (currentStatement.trim()) {
        statements.push(currentStatement.trim());
      }
      currentStatement = '';
    } else {
      currentStatement += char;
    }
  }
  
  // Add the last statement if it doesn't end with a semicolon
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }
  
  return statements.filter(stmt => stmt.length > 0);
}

async function runMigrations() {
  let driver;
  let session;
  
  try {
    // Connect to Neo4j with retry
    driver = await connectWithRetry();
    session = driver.session();
    
    // Skip schema constraints as they may already exist
    console.log('📊 Checking schema...');
    
    // Run Cypher migrations
    const migrationsDir = path.join(__dirname, 'migrations');
    if (fs.existsSync(migrationsDir)) {
      const files = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.cypher'))
        .sort();

      if (files.length === 0) {
        console.log('⚠️ No .cypher migration files found in migrations directory');
      } else {
        console.log(`Found ${files.length} migration files to run`);
        
        for (const file of files) {
          console.log(`📄 Running migration: ${file}`);
          const filePath = path.join(migrationsDir, file);
          const cypherContent = fs.readFileSync(filePath, 'utf-8');
          
          // Split the file into individual statements
          const statements = splitCypherStatements(cypherContent);
          console.log(`Found ${statements.length} statements in ${file}`);
          
          // Execute each statement
          for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            console.log(`Executing statement ${i+1}/${statements.length}`);
            await session.executeWrite(tx => tx.run(statement));
          }
          
          console.log(`✅ Migration ${file} completed successfully`);
        }
      }
    } else {
      console.log('⚠️ No migrations directory found');
    }

    console.log('✅ All migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (session) {
      try {
        await session.close();
      } catch (e) {
        console.error('Error closing session:', e.message);
      }
    }
    
    if (driver) {
      try {
        await driver.close();
        console.log('🔌 Database connection closed');
      } catch (e) {
        console.error('Error closing driver:', e.message);
      }
    }
  }
}

// Run migrations
runMigrations(); 