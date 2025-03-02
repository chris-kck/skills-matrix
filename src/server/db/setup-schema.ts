import { getDriver } from "~/lib/neo4j"

export async function setupSchema() {
  const driver = getDriver()
  const session = driver.session()

  try {
    // Create constraints
    await session.executeWrite(tx => tx.run(`
      CREATE CONSTRAINT IF NOT EXISTS FOR (e:Employee)
      REQUIRE e.email IS UNIQUE
    `))

    await session.executeWrite(tx => tx.run(`
      CREATE CONSTRAINT IF NOT EXISTS FOR (s:Skill)
      REQUIRE s.name IS UNIQUE
    `))

    await session.executeWrite(tx => tx.run(`
      CREATE CONSTRAINT IF NOT EXISTS FOR (p:Project)
      REQUIRE p.name IS UNIQUE
    `))

    console.log('✅ Schema setup completed')
  } catch (error) {
    console.error('❌ Schema setup failed:', error)
    throw error
  } finally {
    await session.close()
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  void setupSchema().catch((error) => {
    console.error('Schema setup failed:', error)
    process.exit(1)
  })
}
