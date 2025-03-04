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
    
  // Get skills by ring (e.g., adopt, trial, assess, hold)
  getByRing: publicProcedure
    .input(z.object({
      ring: z.string()
    }))
    .query(async ({ input }) => {
      const driver = getDriver()
      const session = driver.session()
      
      try {
        const result = await session.executeRead(tx =>
          tx.run(
            `
            MATCH (s:Skill {ring: $ring})
            RETURN s
            ORDER BY s.name
            `,
            input
          )
        )
        
        return result.records.map(record => 
          ((record.get('s') as NodeWithProperties).properties as unknown) as Skill
        )
      } finally {
        await session.close()
      }
    }),

  // Get top skills with their top practitioners
  getTopSkills: publicProcedure.query(async () => {
    const driver = getDriver()
    const session = driver.session()
    
    try {
      const result = await session.executeRead(tx =>
        tx.run(`
          MATCH (s:Skill)<-[r:HAS_SKILL]-(e:Employee)
          WITH s, AVG(r.level) as avgLevel,
               COLLECT({
                 name: e.name,
                 email: e.email,
                 level: r.level
               }) as people
          RETURN s,
                 avgLevel,
                 [x IN people | x] as topPeople
          ORDER BY avgLevel DESC
        `)
      )
      
      return result.records.map(record => {
        const skill = ((record.get('s') as NodeWithProperties).properties as unknown) as Skill
        const avgLevel = record.get('avgLevel') as number
        const topPeople = (record.get('topPeople') as any[])
          .sort((a, b) => b.level - a.level)
          .slice(0, 3)
        
        return {
          ...skill,
          averageLevel: Math.round(avgLevel),
          topPeople
        }
      })
    } finally {
      await session.close()
    }
  }),

  // Get skills that need development (lacking skills)
  getLackingSkills: publicProcedure.query(async () => {
    const driver = getDriver()
    const session = driver.session()
    
    try {
      const result = await session.executeRead(tx =>
        tx.run(`
          MATCH (s:Skill)
          OPTIONAL MATCH (s)<-[r:HAS_SKILL]-(e:Employee)
          WITH s,
               CASE WHEN COUNT(r) > 0 THEN AVG(r.level) ELSE 0 END as currentCoverage,
               COUNT(r) as employeeCount,
               CASE 
                 WHEN s.ring = 'adopt' THEN 90
                 WHEN s.ring = 'trial' THEN 70
                 WHEN s.ring = 'assess' THEN 50
                 ELSE 30
               END as requiredLevel
          WITH s,
               currentCoverage,
               requiredLevel,
               employeeCount,
               CASE 
                 WHEN s.ring = 'adopt' THEN 0.8
                 WHEN s.ring = 'trial' THEN 0.6
                 WHEN s.ring = 'assess' THEN 0.4
                 ELSE 0.2
               END as targetCoverage,
               SIZE(COLLECT(e)) as totalEmployees
          WITH s,
               currentCoverage,
               requiredLevel,
               employeeCount,
               targetCoverage * totalEmployees as targetEmployeeCount
          RETURN s,
                 currentCoverage,
                 requiredLevel,
                 employeeCount,
                 targetEmployeeCount,
                 (requiredLevel - currentCoverage) + 
                 (CASE WHEN employeeCount < targetEmployeeCount 
                      THEN 20 * (1 - employeeCount/targetEmployeeCount)
                      ELSE 0 
                  END) as gap
          ORDER BY gap DESC
        `)
      )
      
      return result.records.map(record => {
        const skill = ((record.get('s') as NodeWithProperties).properties as unknown) as Skill
        return {
          ...skill,
          currentCoverage: Math.round(record.get('currentCoverage') as number),
          requiredLevel: record.get('requiredLevel') as number,
          employeeCount: record.get('employeeCount') as number,
          targetEmployeeCount: Math.round(record.get('targetEmployeeCount') as number)
        }
      })
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
          MATCH (s1:Skill)<-[:HAS_SKILL]-(e:Employee)-[:HAS_SKILL]->(s2:Skill)
          WHERE s1 <> s2
          WITH s1, s2, COUNT(e) as strength
          WHERE strength > 0
          RETURN s1.name as source, s2.name as target, strength
        `)
      )
      
      const nodes = new Set<string>()
      const links = result.records.map(record => {
        const source = record.get('source') as string
        const target = record.get('target') as string
        const strength = record.get('strength') as number
        nodes.add(source)
        nodes.add(target)
        return { source, target, value: strength }
      })
      
      return {
        nodes: Array.from(nodes).map(name => ({
          id: name,
          name,
          group: 'skill'
        })),
        links
      }
    } finally {
      await session.close()
    }
  }),

  // Get skill recommendations
  getRecommendations: publicProcedure.query(async () => {
    const driver = getDriver()
    const session = driver.session()
    
    try {
      const result = await session.executeRead(tx =>
        tx.run(`
          MATCH (e:Employee)-[r:HAS_SKILL]->(s:Skill)
          WITH e, COLLECT({skill: s, level: r.level}) as currentSkills
          MATCH (s2:Skill)
          WHERE NOT (e)-[:HAS_SKILL]->(s2)
          WITH e, currentSkills,
               COLLECT(DISTINCT s2.name)[..4] as recommendedSkills,
               [skill IN currentSkills WHERE skill.level < 90 | skill.skill.name][..4] as upskillSkills
          RETURN e.name as employee,
                 [skill IN currentSkills | skill.skill.name] as currentSkills,
                 recommendedSkills,
                 upskillSkills
        `)
      )
      
      return result.records.map(record => ({
        employee: record.get('employee') as string,
        currentSkills: record.get('currentSkills') as string[],
        recommendedSkills: record.get('recommendedSkills') as string[],
        upskillSkills: record.get('upskillSkills') as string[]
      }))
    } finally {
      await session.close()
    }
  })
}) 