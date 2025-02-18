import { getDb } from './db';

const constraints = [
  'CREATE CONSTRAINT skill_name IF NOT EXISTS FOR (s:Skill) REQUIRE s.name IS UNIQUE',
  'CREATE CONSTRAINT user_email IF NOT EXISTS FOR (u:User) REQUIRE u.email IS UNIQUE',
  'CREATE CONSTRAINT category_name IF NOT EXISTS FOR (c:Category) REQUIRE c.name IS UNIQUE'
];

const indexes = [
  'CREATE INDEX skill_name_idx IF NOT EXISTS FOR (s:Skill) ON (s.name)',
  'CREATE INDEX user_email_idx IF NOT EXISTS FOR (u:User) ON (u.email)',
  'CREATE INDEX category_name_idx IF NOT EXISTS FOR (c:Category) ON (c.name)'
];

export async function setupSchema() {
  const driver = getDb();
  const session = driver.session();

  try {
    // Create constraints
    for (const constraint of constraints) {
      await session.run(constraint);
    }

    // Create indexes
    for (const index of indexes) {
      await session.run(index);
    }

    console.log('Database schema setup completed');
  } catch (error) {
    console.error('Error setting up database schema:', error);
    throw error;
  } finally {
    await session.close();
  }
}
