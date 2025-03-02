import { getDriver } from "~/lib/neo4j"
import type { Transaction } from "neo4j-driver"

const MIGRATIONS_TABLE = 'migrations'

interface Migration {
  id: string
  up: (tx: Transaction) => Promise<void>
}

async function ensureMigrationsTable() {
  const driver = getDriver()
  const session = driver.session()

  try {
    await session.executeWrite(tx =>
      tx.run(`
        CREATE CONSTRAINT IF NOT EXISTS FOR (m:${MIGRATIONS_TABLE})
        REQUIRE m.id IS UNIQUE
      `)
    )
  } finally {
    await session.close()
  }
}

async function getMigratedVersions() {
  const driver = getDriver()
  const session = driver.session()

  try {
    const result = await session.executeRead(tx =>
      tx.run(`
        MATCH (m:${MIGRATIONS_TABLE})
        RETURN m.id as id, m.appliedAt as appliedAt
        ORDER BY m.appliedAt ASC
      `)
    )

    return result.records.map(record => ({
      id: record.get('id'),
      appliedAt: record.get('appliedAt'),
    }))
  } finally {
    await session.close()
  }
}

async function markMigrationAsApplied(migrationId: string) {
  const driver = getDriver()
  const session = driver.session()

  try {
    await session.executeWrite(tx =>
      tx.run(`
        CREATE (m:${MIGRATIONS_TABLE} {
          id: $id,
          appliedAt: datetime()
        })
      `, { id: migrationId })
    )
  } finally {
    await session.close()
  }
}

export async function deployMigration(migration: Migration) {
  const driver = getDriver()
  const session = driver.session()

  try {
    // Start a transaction
    const tx = session.beginTransaction()

    try {
      // Run the up migration
      await migration.up(tx)

      // Mark migration as complete
      await markMigrationAsApplied(migration.id)

      // Commit the transaction
      await tx.commit()
      console.log(`✅ Migration ${migration.id} applied successfully`)
    } catch (error) {
      // Rollback on error
      await tx.rollback()
      throw error
    }
  } catch (error) {
    console.error(`❌ Migration ${migration.id} failed:`, error)
    throw error
  } finally {
    await session.close()
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  void (async () => {
    try {
      await ensureMigrationsTable()
      const migrations = await getMigratedVersions()
      console.log('Applied migrations:', migrations)
    } catch (error) {
      console.error('Migration deployment failed:', error)
      process.exit(1)
    }
  })()
} 