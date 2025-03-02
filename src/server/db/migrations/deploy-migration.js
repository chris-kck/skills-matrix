import neo4j from 'neo4j-driver'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function runMigrations() {
    const driver = neo4j.driver(
        process.env.NEO4J_URI,
        neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
    )
    
    try {
        const session = driver.session()
        
        // Read and execute migration file
        const migrationPath = path.join(__dirname, '001-initial-schema.cypher')
        const migrationQuery = fs.readFileSync(migrationPath, 'utf8')
        
        console.log('Running migrations...')
        await session.run(migrationQuery)
        
        // Verify migration success
        console.log('Verifying database state...')
        
        const nodeCount = await session.run(
            'MATCH (n) RETURN labels(n) as Labels, count(n) as Count'
        )
        console.log('Node counts:', nodeCount.records.map(r => r.toObject()))
        
        const relCount = await session.run(
            'MATCH ()-[r]->() RETURN type(r) as RelationType, count(r) as Count'
        )
        console.log('Relationship counts:', relCount.records.map(r => r.toObject()))
        
        await session.close()
    } catch (error) {
        console.error('Migration failed:', error)
        process.exit(1)
    } finally {
        await driver.close()
    }
}

runMigrations()