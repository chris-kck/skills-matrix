import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"
import { getDriver, getFirstRecord } from "~/lib/neo4j"
import type { Employee, Project, Skill } from "~/types"
import type { Node as Neo4jNode } from "neo4j-driver"

// Define a more specific type for Neo4j Node with properties
interface NodeWithProperties extends Neo4jNode {
  properties: Record<string, unknown>
}

const projectStatus = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'] as const

interface ProjectWithTeamAndSkills extends Project {
  team: Array<{
    employee: Employee
    role: string
    joinedAt: string
  }>
  requiredSkills: Array<{
    skill: Skill
    requiredLevel: number
    name: string
    category: string
  }>
}

export const projectsRouter = createTRPCRouter({
  // Create a new project
  create: publicProcedure
    .input(z.object({
      name: z.string(),
      description: z.string(),
      startDate: z.string(),
      endDate: z.string().optional(),
      status: z.enum(projectStatus),
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
        
        return getFirstRecord<Project>(result, 'p')
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
                   role: w.role,
                   joinedAt: w.joinedAt
                 }) as team,
                 collect(DISTINCT {
                   skill: s,
                   requiredLevel: r.requiredLevel
                 }) as requiredSkills
        `)
      )
      
      return result.records.map(record => {
        const project = ((record.get('p') as NodeWithProperties).properties as unknown) as Project
        const teamData = record.get('team') as Array<{ employee: Neo4jNode | null; role: string; joinedAt: string }>
        const team = teamData
          .filter((t) => t.employee)
          .map((t) => ({
            employee: ((t.employee as NodeWithProperties).properties as unknown) as Employee,
            role: t.role,
            joinedAt: t.joinedAt
          }))
        const skillsData = record.get('requiredSkills') as Array<{ skill: Neo4jNode | null; requiredLevel: number }>
        const requiredSkills = skillsData
          .filter((s) => s.skill)
          .map((s) => ({
            skill: ((s.skill as NodeWithProperties).properties as unknown) as Skill,
            requiredLevel: s.requiredLevel
          }))
        return { ...project, team, requiredSkills } as ProjectWithTeamAndSkills
      })
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
        
        const record = result.records[0]
        if (!record) {
          throw new Error('Failed to create team member relationship')
        }

        return {
          employee: ((record.get('e') as NodeWithProperties).properties as unknown) as Employee,
          project: ((record.get('p') as NodeWithProperties).properties as unknown) as Project,
          relationship: ((record.get('r') as NodeWithProperties).properties as unknown) as { role: string; joinedAt: string }
        }
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
        
        const record = result.records[0]
        if (!record) {
          throw new Error('Failed to create skill requirement')
        }

        return {
          project: ((record.get('p') as NodeWithProperties).properties as unknown) as Project,
          skill: ((record.get('s') as NodeWithProperties).properties as unknown) as Skill,
          requirement: ((record.get('r') as NodeWithProperties).properties as unknown) as { requiredLevel: number; updatedAt: string }
        }
      } finally {
        await session.close()
      }
    }),

  // Update project status
  updateStatus: publicProcedure
    .input(z.object({
      projectId: z.string(),
      status: z.enum(projectStatus),
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
        
        return getFirstRecord<Project>(result, 'p')
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