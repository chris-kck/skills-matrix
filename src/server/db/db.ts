import neo4j, { type Driver } from 'neo4j-driver';
import { env } from '~/env';

let driver: Driver;

export const initDb = () => {
  try {
    driver = neo4j.driver(
      env.NEO4J_URI,
      neo4j.auth.basic(env.NEO4J_USER, env.NEO4J_PASSWORD)
    );
    console.log('Connected to Neo4j');
    return driver;
  } catch (error) {
    console.error('Error connecting to Neo4j:', error);
    throw error;
  }
};

export const getDb = () => {
  if (!driver) {
    return initDb();
  }
  return driver;
};

export const closeDb = async () => {
  if (driver) {
    await driver.close();
  }
};
