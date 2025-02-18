import { getDb, closeDb } from './db';

describe('Neo4j Connection', () => {
  afterAll(async () => {
    await closeDb();
  });

  it('should connect to Neo4j', async () => {
    const driver = getDb();
    const session = driver.session();
    try {
      const result = await session.run('MATCH (n) RETURN count(n) as count');
      expect(result.records).toBeDefined();
    } finally {
      await session.close();
    }
  });
});
