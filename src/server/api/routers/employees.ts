import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"
import { getDriver, getFirstRecord } from "~/lib/neo4j"

export const employeesRouter = createTRPCRouter({
  // Create a new employee
  create: publicProcedure
    .input(z.object({
      name: z.string(),
      role: z.string(),
      email: z.string().email(),
      department: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const driver = getDriver()
      const session = driver.session()
      
      try {
        const result = await session.executeWrite(tx =>
          tx.run(
            `
            CREATE (e:Employee {
              name: $name,
              role: $role,
              email: $email,
              department: $department,
              createdAt: datetime()
            })
            RETURN e
            `,
            input
          )
        )
        
        return getFirstRecord(result, 'e')
      } finally {
        await session.close()
      }
    }),

  // Get all employees with their skills
  getAll: publicProcedure.query(async () => {
    const driver = getDriver()
    const session = driver.session()
    
    try {
      const result = await session.executeRead(tx =>
        tx.run(`
          MATCH (e:Employee)
          OPTIONAL MATCH (e)-[r:HAS_SKILL]->(s:Skill)
          RETURN e, collect({skill: s, level: r.level}) as skills
        `)
      )
      
      return result.records.map(record => ({
        ...record.get('e').properties,
        skills: record.get('skills')
          .filter((s: any) => s.skill)
          .map((s: any) => ({
            ...s.skill.properties,
            level: s.level
          }))
      }))
    } finally {
      await session.close()
    }
  }),

  // Add skill to employee
  addSkill: publicProcedure
    .input(z.object({
      employeeId: z.string(),
      skillId: z.string(),
      level: z.number().min(0).max(100),
    }))
    .mutation(async ({ input }) => {
      const driver = getDriver()
      const session = driver.session()
      
      try {
        const result = await session.executeWrite(tx =>
          tx.run(
            `
            MATCH (e:Employee), (s:Skill)
            WHERE id(e) = $employeeId AND id(s) = $skillId
            MERGE (e)-[r:HAS_SKILL]->(s)
            SET r.level = $level,
                r.updatedAt = datetime()
            RETURN e, s, r
            `,
            input
          )
        )
        
        return getFirstRecord(result, 'r')
      } finally {
        await session.close()
      }
    }),

  // Update employee skill level
  updateSkillLevel: publicProcedure
    .input(z.object({
      employeeId: z.string(),
      skillId: z.string(),
      level: z.number().min(0).max(100),
    }))
    .mutation(async ({ input }) => {
      const driver = getDriver()
      const session = driver.session()
      
      try {
        const result = await session.executeWrite(tx =>
          tx.run(
            `
            MATCH (e:Employee)-[r:HAS_SKILL]->(s:Skill)
            WHERE id(e) = $employeeId AND id(s) = $skillId
            SET r.level = $level,
                r.updatedAt = datetime()
            RETURN r
            `,
            input
          )
        )
        
        return getFirstRecord(result, 'r')
      } finally {
        await session.close()
      }
    }),

  // Remove skill from employee
  removeSkill: publicProcedure
    .input(z.object({
      employeeId: z.string(),
      skillId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const driver = getDriver()
      const session = driver.session()
      
      try {
        await session.executeWrite(tx =>
          tx.run(
            `
            MATCH (e:Employee)-[r:HAS_SKILL]->(s:Skill)
            WHERE id(e) = $employeeId AND id(s) = $skillId
            DELETE r
            `,
            input
          )
        )
        
        return { success: true }
      } finally {
        await session.close()
      }
    }),

  // Delete employee
  delete: publicProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      const driver = getDriver()
      const session = driver.session()
      
      try {
        await session.executeWrite(tx =>
          tx.run(
            `
            MATCH (e:Employee)
            WHERE id(e) = $id
            DETACH DELETE e
            `,
            { id: input }
          )
        )
        
        return { success: true }
      } finally {
        await session.close()
      }
    }),
}) 