import { getDriver } from "~/lib/neo4j"

export async function mergeEmployeeTypes() {
  const driver = getDriver()
  const session = driver.session()

  try {
    // First, match all Engineer nodes and merge them into Employee nodes
    await session.executeWrite(tx =>
      tx.run(`
        MATCH (eng:Engineer)
        MERGE (emp:Employee {
          name: eng.name,
          role: eng.role,
          email: eng.email,
          department: eng.department
        })
        WITH eng, emp
        // Transfer all relationships from Engineer to Employee
        MATCH (eng)-[r:HAS_SKILL]->(s:Skill)
        MERGE (emp)-[r2:HAS_SKILL]->(s)
        SET r2 = r
        WITH eng, emp
        MATCH (eng)-[w:WORKS_ON]->(p:Project)
        MERGE (emp)-[w2:WORKS_ON]->(p)
        SET w2 = w
        // Delete the old Engineer node and its relationships
        DETACH DELETE eng
        RETURN emp
      `)
    )

    // Update any remaining references to Engineer in the database
    await session.executeWrite(tx =>
      tx.run(`
        MATCH (p:Project)-[r:REQUIRES_ROLE {role: 'Engineer'}]->(s:Skill)
        SET r.role = 'Employee'
      `)
    )

    // Add role types as a property on Employee nodes
    await session.executeWrite(tx =>
      tx.run(`
        MATCH (e:Employee)
        WHERE NOT EXISTS(e.roleType)
        SET e.roleType = 'technical'
      `)
    )

    console.log("✅ Employee types merged successfully")
  } catch (error) {
    console.error("❌ Error merging employee types:", error)
    throw error
  } finally {
    await session.close()
  }
} 