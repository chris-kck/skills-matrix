import { z } from "zod"
import type { Node as Neo4jNode } from "neo4j-driver"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"
import { getDriver, getFirstRecord } from "~/lib/neo4j"
import type { Employee, Skill } from "~/types"

// Define a more specific type for Neo4j Node with properties
interface NodeWithProperties extends Neo4jNode {
  properties: Record<string, unknown>
}

const roleTypes = ['technical', 'management', 'design', 'product'] as const

const employeeInput = z.object({
  name: z.string(),
  role: z.string(),
  email: z.string().email(),
  department: z.string().optional(),
  roleType: z.enum(roleTypes).default('technical'),
})

interface EmployeeWithSkills extends Employee {
  skills: Array<Skill & { level: number }>
}

interface SkillRelation {
  skill: NodeWithProperties
  level: number
}

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
        
        return getFirstRecord<Employee>(result, 'e')
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
      
      return result.records.map(record => {
        const employee = ((record.get('e') as NodeWithProperties).properties as unknown) as Employee
        const skills = (record.get('skills') as SkillRelation[])
          .filter(s => s.skill)
          .map(s => ({
            ...((s.skill.properties as unknown) as Skill),
            level: s.level
          }))
        return { ...employee, skills } as EmployeeWithSkills
      })
    } finally {
      await session.close()
    }
  }),

  // Get employees by role type
  getByRoleType: publicProcedure
    .input(z.enum(roleTypes))
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
        
        return result.records.map(record => {
          const employee = ((record.get('e') as NodeWithProperties).properties as unknown) as Employee
          const skills = (record.get('skills') as SkillRelation[])
            .filter(s => s.skill)
            .map(s => ({
              ...((s.skill.properties as unknown) as Skill),
              level: s.level
            }))
          return { ...employee, skills } as EmployeeWithSkills
        })
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
          employee: ((record.get('e') as NodeWithProperties).properties as unknown) as Employee,
          skill: ((record.get('s') as NodeWithProperties).properties as unknown) as Skill,
          level: record.get('level') as number
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
          employee: ((record.get('e') as NodeWithProperties).properties as unknown) as Employee,
          skill: ((record.get('s') as NodeWithProperties).properties as unknown) as Skill,
          level: record.get('level') as number
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

  // Get team collaboration data
  getTeamCollaboration: publicProcedure.query(async () => {
    const driver = getDriver()
    const session = driver.session()
    
    try {
      const result = await session.executeRead(tx =>
        tx.run(`
          MATCH (e1:Employee)-[:HAS_SKILL]->(s:Skill)<-[:HAS_SKILL]-(e2:Employee)
          WHERE e1 <> e2
          WITH e1, e2, COLLECT(s.name) AS sharedSkills
          WHERE SIZE(sharedSkills) > 0
          RETURN e1.name AS source, e2.name AS target, sharedSkills, SIZE(sharedSkills) AS strength
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
          sharedSkills: (record.get("sharedSkills") as string[]).join(","),
          strength: record.get("strength") as number,
        }
      })
      
      return {
        nodes: Array.from(nodes).map((name) => ({ id: name, name })),
        links,
      }
    } catch (error) {
      console.error("Error fetching team collaboration data:", error)
      throw error
    } finally {
      await session.close()
    }
  }),
}) 