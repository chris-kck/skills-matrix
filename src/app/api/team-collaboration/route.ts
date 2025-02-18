import { NextResponse } from "next/server"
import neo4j from "neo4j-driver"

export async function GET() {
  const driver = neo4j.driver(
    process.env.NEO4J_URI!,
    neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!),
  )
  const session = driver.session()

  try {
    const result = await session.run(`
      MATCH (e1:Employee)-[:HAS_SKILL]->(s:Skill)<-[:HAS_SKILL]-(e2:Employee)
      WHERE e1 <> e2
      WITH e1, e2, COLLECT(s.name) AS sharedSkills
      WHERE SIZE(sharedSkills) > 0
      RETURN e1.name AS source, e2.name AS target, sharedSkills, SIZE(sharedSkills) AS strength
    `)

    const nodes = new Set()
    const links = result.records.map((record) => {
      nodes.add(record.get("source"))
      nodes.add(record.get("target"))
      return {
        source: record.get("source"),
        target: record.get("target"),
        sharedSkills: record.get("sharedSkills").join(","),
        strength: record.get("strength"),
      }
    })

    await session.close()
    await driver.close()

    return NextResponse.json({
      nodes: Array.from(nodes).map((name) => ({ id: name, name: name })),
      links: links,
    })
  } catch (error) {
    console.error("Error fetching team collaboration data:", error)
    return NextResponse.json({ error: "Failed to fetch team collaboration data" }, { status: 500 })
  }
}

