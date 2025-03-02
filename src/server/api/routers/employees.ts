import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"
import { getDriver, getFirstRecord } from "~/lib/neo4j"

const employeeInput = z.object({
  name: z.string(),
  role: z.string(),
  email: z.string().email(),
  department: z.string().optional(),
  roleType: z.enum(['technical', 'management', 'design', 'product']).default('technical'),
})

export const employeesRouter = createTRPCRouter({
  // Create a new employee
  create: publicProcedure
    .input(employeeInput)
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
              roleType: $roleType,
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

  // Get employees by role type
  getByRoleType: publicProcedure
    .input(z.enum(['technical', 'management', 'design', 'product']))
    .query(async ({ input }) => {
      const driver = getDriver()
      const session = driver.session()
      
      try {
        const result = await session.executeRead(tx =>
          tx.run(`
            MATCH (e:Employee {roleType: $roleType})
            OPTIONAL MATCH (e)-[r:HAS_SKILL]->(s:Skill)
            RETURN e, collect({skill: s, level: r.level}) as skills
          `,
            { roleType: input }
          )
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
            WHERE e.email = $employeeId AND s.name = $skillId
            MERGE (e)-[r:HAS_SKILL]->(s)
            SET r.level = $level,
                r.updatedAt = datetime()
            RETURN e, s, r.level as level
            `,
            input
          )
        )
        
        const record = result.records[0]
        if (!record) {
          throw new Error('Failed to create relationship')
        }

        return {
          employee: record.get('e').properties,
          skill: record.get('s').properties,
          level: record.get('level')
        }
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
            WHERE e.email = $employeeId AND s.name = $skillId
            SET r.level = $level,
                r.updatedAt = datetime()
            RETURN e, s, r.level as level
            `,
            input
          )
        )
        
        const record = result.records[0]
        if (!record) {
          throw new Error('Skill relationship not found')
        }

        return {
          employee: record.get('e').properties,
          skill: record.get('s').properties,
          level: record.get('level')
        }
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
            WHERE e.email = $employeeId AND s.name = $skillId
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
            MATCH (e:Employee {email: $id})
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