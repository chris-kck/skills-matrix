import { z } from "zod"
import type { Node as Neo4jNode } from "neo4j-driver"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"
import { getDriver, getFirstRecord } from "~/lib/neo4j"
import type { Skill } from "~/types"

// Define a more specific type for Neo4j Node with properties
interface NodeWithProperties extends Neo4jNode {
  properties: Record<string, unknown>
}

export const skillsRouter = createTRPCRouter({
  // Create a new skill
  create: publicProcedure
    .input(z.object({
      name: z.string(),
      category: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const driver = getDriver()
      const session = driver.session()
      
      try {
        const result = await session.executeWrite(tx =>
          tx.run(
            `
            CREATE (s:Skill {
              name: $name,
              category: $category,
              description: $description,
              createdAt: datetime()
            })
            RETURN s
            `,
            input
          )
        )
        
        return getFirstRecord<Skill>(result, 's')
      } finally {
        await session.close()
      }
    }),

  // Get all skills
  getAll: publicProcedure.query(async () => {
    const driver = getDriver()
    const session = driver.session()
    
    try {
      const result = await session.executeRead(tx =>
        tx.run('MATCH (s:Skill) RETURN s')
      )
      
      return result.records.map(record => ((record.get('s') as NodeWithProperties).properties as unknown) as Skill)
    } finally {
      await session.close()
    }
  }),

  // Get skill by ID
  getById: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const driver = getDriver()
      const session = driver.session()
      
      try {
        const result = await session.executeRead(tx =>
          tx.run(
            'MATCH (s:Skill) WHERE id(s) = $id RETURN s',
            { id: input }
          )
        )
        
        return getFirstRecord<Skill>(result, 's')
      } finally {
        await session.close()
      }
    }),

  // Update skill
  update: publicProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      category: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const driver = getDriver()
      const session = driver.session()
      
      try {
        const result = await session.executeWrite(tx =>
          tx.run(
            `
            MATCH (s:Skill)
            WHERE id(s) = $id
            SET s += $updates
            RETURN s
            `,
            {
              id: input.id,
              updates: {
                name: input.name,
                category: input.category,
                description: input.description,
                updatedAt: new Date().toISOString(),
              },
            }
          )
        )
        
        return getFirstRecord(result, 's')
      } finally {
        await session.close()
      }
    }),

  // Delete skill
  delete: publicProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      const driver = getDriver()
      const session = driver.session()
      
      try {
        await session.executeWrite(tx =>
          tx.run(
            'MATCH (s:Skill) WHERE id(s) = $id DELETE s',
            { id: input }
          )
        )
        
        return { success: true }
      } finally {
        await session.close()
      }
    }),
    
  // Get skill relationships
  getRelationships: publicProcedure.query(async () => {
    const driver = getDriver()
    const session = driver.session()
    
    try {
      const result = await session.executeRead(tx =>
        tx.run(`
          MATCH (s:Skill)-[r:RELATED_TO]-(s2:Skill)
          RETURN s.name AS source, s2.name AS target, r.strength AS strength
        `)
      )
      
      const nodes = new Set<string>()
      const links = result.records.map((record) => {
        const source = record.get("source") as string
        const target = record.get("target") as string
        nodes.add(source)
        nodes.add(target)
        return {
          source,
          target,
          strength: record.get("strength") as number,
        }
      })
      
      return {
        nodes: Array.from(nodes).map((name) => ({ id: name, name })),
        links,
      }
    } catch (error) {
      console.error("Error fetching skill relationships:", error)
      throw error
    } finally {
      await session.close()
    }
  }),
}) 