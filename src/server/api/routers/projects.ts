import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"
import { getDriver } from "~/lib/neo4j"

export const projectsRouter = createTRPCRouter({
  // Create a new project
  create: publicProcedure
    .input(z.object({
      name: z.string(),
      description: z.string(),
      startDate: z.string(),
      endDate: z.string().optional(),
      status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD']),
    }))
    .mutation(async ({ input }) => {
      const driver = getDriver()
      const session = driver.session()
      
      try {
        const result = await session.executeWrite(tx =>
          tx.run(
            `
            CREATE (p:Project {
              name: $name,
              description: $description,
              startDate: datetime($startDate),
              endDate: $endDate,
              status: $status,
              createdAt: datetime()
            })
            RETURN p
            `,
            input
          )
        )
        
        return result.records[0].get('p').properties
      } finally {
        await session.close()
      }
    }),

  // Get all projects with their team members and required skills
  getAll: publicProcedure.query(async () => {
    const driver = getDriver()
    const session = driver.session()
    
    try {
      const result = await session.executeRead(tx =>
        tx.run(`
          MATCH (p:Project)
          OPTIONAL MATCH (p)-[w:WORKS_ON]-(e:Employee)
          OPTIONAL MATCH (p)-[r:REQUIRES_SKILL]->(s:Skill)
          RETURN p,
                 collect(DISTINCT {
                   employee: e,
                   role: w.role
                 }) as team,
                 collect(DISTINCT {
                   skill: s,
                   level: r.requiredLevel
                 }) as requiredSkills
        `)
      )
      
      return result.records.map(record => ({
        ...record.get('p').properties,
        team: record.get('team')
          .filter((t: any) => t.employee)
          .map((t: any) => ({
            ...t.employee.properties,
            projectRole: t.role
          })),
        requiredSkills: record.get('requiredSkills')
          .filter((s: any) => s.skill)
          .map((s: any) => ({
            ...s.skill.properties,
            requiredLevel: s.level
          }))
      }))
    } finally {
      await session.close()
    }
  }),

  // Add team member to project
  addTeamMember: publicProcedure
    .input(z.object({
      projectId: z.string(),
      employeeId: z.string(),
      role: z.string(),
    }))
    .mutation(async ({ input }) => {
      const driver = getDriver()
      const session = driver.session()
      
      try {
        const result = await session.executeWrite(tx =>
          tx.run(
            `
            MATCH (p:Project), (e:Employee)
            WHERE id(p) = $projectId AND id(e) = $employeeId
            MERGE (e)-[r:WORKS_ON]->(p)
            SET r.role = $role,
                r.joinedAt = datetime()
            RETURN e, p, r
            `,
            input
          )
        )
        
        return result.records[0].get('r').properties
      } finally {
        await session.close()
      }
    }),

  // Add required skill to project
  addRequiredSkill: publicProcedure
    .input(z.object({
      projectId: z.string(),
      skillId: z.string(),
      requiredLevel: z.number().min(0).max(100),
    }))
    .mutation(async ({ input }) => {
      const driver = getDriver()
      const session = driver.session()
      
      try {
        const result = await session.executeWrite(tx =>
          tx.run(
            `
            MATCH (p:Project), (s:Skill)
            WHERE id(p) = $projectId AND id(s) = $skillId
            MERGE (p)-[r:REQUIRES_SKILL]->(s)
            SET r.requiredLevel = $requiredLevel,
                r.updatedAt = datetime()
            RETURN p, s, r
            `,
            input
          )
        )
        
        return result.records[0].get('r').properties
      } finally {
        await session.close()
      }
    }),

  // Update project status
  updateStatus: publicProcedure
    .input(z.object({
      projectId: z.string(),
      status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD']),
    }))
    .mutation(async ({ input }) => {
      const driver = getDriver()
      const session = driver.session()
      
      try {
        const result = await session.executeWrite(tx =>
          tx.run(
            `
            MATCH (p:Project)
            WHERE id(p) = $projectId
            SET p.status = $status,
                p.updatedAt = datetime()
            RETURN p
            `,
            input
          )
        )
        
        return result.records[0].get('p').properties
      } finally {
        await session.close()
      }
    }),

  // Remove team member from project
  removeTeamMember: publicProcedure
    .input(z.object({
      projectId: z.string(),
      employeeId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const driver = getDriver()
      const session = driver.session()
      
      try {
        await session.executeWrite(tx =>
          tx.run(
            `
            MATCH (e:Employee)-[r:WORKS_ON]->(p:Project)
            WHERE id(p) = $projectId AND id(e) = $employeeId
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

  // Delete project
  delete: publicProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      const driver = getDriver()
      const session = driver.session()
      
      try {
        await session.executeWrite(tx =>
          tx.run(
            `
            MATCH (p:Project)
            WHERE id(p) = $id
            DETACH DELETE p
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