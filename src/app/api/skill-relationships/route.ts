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
      MATCH (s:Skill)-[r:RELATED_TO]-(s2:Skill)
      RETURN s.name AS source, s2.name AS target, r.strength AS strength
    `)

    const nodes = new Set()
    const links = result.records.map((record) => {
      nodes.add(record.get("source"))
      nodes.add(record.get("target"))
      return {
        source: record.get("source"),
        target: record.get("target"),
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
    console.error("Error fetching skill relationships:", error)
    return NextResponse.json({ error: "Failed to fetch skill relationships" }, { status: 500 })
  }
}

