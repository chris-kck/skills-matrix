import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"
import { getDriver } from "~/lib/neo4j"

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
        
        return result.records[0].get('s').properties
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
      
      return result.records.map(record => record.get('s').properties)
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
        
        return result.records[0]?.get('s').properties
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
        
        return result.records[0].get('s').properties
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
}) 