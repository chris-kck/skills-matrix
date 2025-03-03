import { getDriver } from "../../../lib/neo4j.js"
import moharaRadarData from "./mohara-radar-complete.json" assert { type: "json" }

// Define the technology type based on the JSON structure
interface Technology {
  title: string
  ring: string
  quadrant: string
  featured: boolean
  tags: string[]
  description: string
}

// Define relationships between technologies
const technologyRelationships = [
  { from: "Next.js", to: "Vercel", type: "DEPLOYED_ON" },
  { from: "React", to: "Next.js", type: "USED_BY" },
  { from: "TypeScript", to: "React", type: "ENHANCES" },
  { from: "TypeScript", to: "NestJS", type: "USED_BY" },
  { from: "NestJS", to: "Node.js", type: "RUNS_ON" },
  { from: "React Query", to: "React", type: "EXTENDS" },
  { from: "Tailwind CSS", to: "React", type: "STYLES" },
  { from: "Prisma", to: "PostgreSQL", type: "CONNECTS_TO" },
  { from: "Prisma", to: "TypeScript", type: "INTEGRATES_WITH" },
  { from: "Apollo GraphQL", to: "GraphQL", type: "IMPLEMENTS" },
  { from: "GraphQL", to: "React", type: "WORKS_WITH" },
  { from: "Docker", to: "Kubernetes", type: "ORCHESTRATED_BY" },
  { from: "GitHub Actions", to: "Docker", type: "BUILDS" },
  { from: "Cypress", to: "React", type: "TESTS" },
  { from: "Jest", to: "React", type: "TESTS" },
  { from: "Playwright", to: "Cypress", type: "ALTERNATIVE_TO" },
  { from: "Chakra UI", to: "React", type: "EXTENDS" },
  { from: "Tailwind CSS", to: "Chakra UI", type: "ALTERNATIVE_TO" },
  { from: "Contentful", to: "Next.js", type: "INTEGRATES_WITH" },
  { from: "Sanity", to: "Contentful", type: "ALTERNATIVE_TO" },
  { from: "Firebase", to: "Supabase", type: "ALTERNATIVE_TO" },
  { from: "AWS", to: "Vercel", type: "ALTERNATIVE_TO" },
  { from: "Cloudflare", to: "Vercel", type: "COMPLEMENTS" },
  { from: "pnpm", to: "nx", type: "WORKS_WITH" },
  { from: "Zod", to: "TypeScript", type: "VALIDATES" },
  { from: "React Native", to: "React", type: "EXTENDS" },
  { from: "Flutter", to: "React Native", type: "ALTERNATIVE_TO" },
  { from: "Remix", to: "Next.js", type: "ALTERNATIVE_TO" },
  { from: "Storybook", to: "React", type: "DOCUMENTS" },
  { from: "Terraform", to: "AWS", type: "PROVISIONS" },
  { from: "Redis", to: "PostgreSQL", type: "COMPLEMENTS" },
  { from: "MongoDB", to: "PostgreSQL", type: "ALTERNATIVE_TO" },
  { from: "Elasticsearch", to: "MongoDB", type: "COMPLEMENTS" },
  { from: "dbt", to: "PostgreSQL", type: "TRANSFORMS" },
  { from: "Apache Airflow", to: "dbt", type: "ORCHESTRATES" },
  { from: "Kafka", to: "Redis", type: "COMPLEMENTS" },
  
  // Additional relationships
  { from: "Vercel", to: "Next.js", type: "OPTIMIZED_FOR" },
  { from: "Next.js", to: "React", type: "BUILT_ON" },
  { from: "Svelte", to: "React", type: "ALTERNATIVE_TO" },
  { from: "Vue 3", to: "React", type: "ALTERNATIVE_TO" },
  { from: "Astro", to: "Next.js", type: "ALTERNATIVE_TO" },
  { from: "Qwik", to: "React", type: "ALTERNATIVE_TO" },
  { from: "Deno", to: "Node.js", type: "ALTERNATIVE_TO" },
  { from: "Bun", to: "Node.js", type: "ALTERNATIVE_TO" },
  { from: "tRPC", to: "GraphQL", type: "ALTERNATIVE_TO" },
  { from: "Neo4j", to: "PostgreSQL", type: "ALTERNATIVE_TO" },
  { from: "PlanetScale", to: "PostgreSQL", type: "BASED_ON" },
  { from: "Zustand", to: "Redux Toolkit", type: "ALTERNATIVE_TO" },
  { from: "Jotai", to: "Zustand", type: "ALTERNATIVE_TO" },
  { from: "TanStack Query", to: "Apollo GraphQL", type: "COMPLEMENTS" },
  { from: "Vitest", to: "Jest", type: "ALTERNATIVE_TO" },
  { from: "Playwright", to: "Cypress", type: "ALTERNATIVE_TO" },
  { from: "Testing Library", to: "Jest", type: "WORKS_WITH" },
  { from: "Docker", to: "Kubernetes", type: "CONTAINERIZES_FOR" },
  { from: "GitHub Actions", to: "Vercel", type: "INTEGRATES_WITH" },
  { from: "OpenAI API", to: "Langchain", type: "USED_BY" },
  { from: "TensorFlow.js", to: "JavaScript", type: "BUILT_FOR" },
  { from: "Hugging Face", to: "OpenAI API", type: "ALTERNATIVE_TO" },
  { from: "Tailwind CSS", to: "Shadcn UI", type: "POWERS" },
  { from: "Radix UI", to: "Shadcn UI", type: "USED_BY" },
  { from: "Framer Motion", to: "React", type: "ENHANCES" },
  { from: "Web Vitals", to: "Lighthouse", type: "MEASURED_BY" },
  { from: "Sentry", to: "Datadog", type: "COMPLEMENTS" },
]

// Generate additional relationships based on tags
function generateTagBasedRelationships(technologies: Technology[]): { from: string, to: string, type: string }[] {
  const relationships: { from: string, to: string, type: string }[] = []
  const techByTag: Record<string, string[]> = {}
  
  // Group technologies by tag
  technologies.forEach(tech => {
    if (tech.tags) {
      tech.tags.forEach(tag => {
        const tagString = String(tag);
        if (!techByTag[tagString]) {
          techByTag[tagString] = []
        }
        techByTag[tagString].push(tech.title)
      })
    }
  })
  
  // Create relationships between technologies with the same tag
  Object.entries(techByTag).forEach(([tag, techs]) => {
    if (techs.length > 1) {
      for (let i = 0; i < techs.length; i++) {
        for (let j = i + 1; j < techs.length; j++) {
          // Avoid duplicating existing relationships
          const existingRelationship = technologyRelationships.some(
            rel => (rel.from === techs[i] && rel.to === techs[j]) || 
                  (rel.from === techs[j] && rel.to === techs[i])
          )
          
          if (!existingRelationship) {
            // Ensure both tech names are defined
            const fromTech = techs[i];
            const toTech = techs[j];
            
            if (fromTech && toTech) {
              relationships.push({
                from: fromTech,
                to: toTech,
                type: "SHARES_TAG_WITH"
              })
            }
          }
        }
      }
    }
  })
  
  return relationships
}

export async function seedSkillsAndConnections() {
  const driver = getDriver()
  const session = driver.session()

  try {
    // Create skills from the radar data
    for (const tech of moharaRadarData.technologies) {
      await session.executeWrite(tx =>
        tx.run(
          `
          MERGE (s:Skill {name: $name})
          SET s.category = $category,
              s.description = $description,
              s.ring = $ring,
              s.quadrant = $quadrant,
              s.featured = $featured,
              s.tags = $tags,
              s.updatedAt = datetime()
          RETURN s
          `,
          {
            name: tech.title,
            category: tech.quadrant,
            description: tech.description,
            ring: tech.ring,
            quadrant: tech.quadrant,
            featured: tech.featured,
            tags: tech.tags
          }
        )
      )
    }

    // Create relationships between technologies
    for (const rel of technologyRelationships) {
      await session.executeWrite(tx =>
        tx.run(
          `
          MATCH (s1:Skill {name: $from}), (s2:Skill {name: $to})
          MERGE (s1)-[r:${rel.type}]->(s2)
          RETURN r
          `,
          { from: rel.from, to: rel.to }
        )
      )
    }
    
    // Generate and create tag-based relationships
    const tagBasedRelationships = generateTagBasedRelationships(moharaRadarData.technologies)
    for (const rel of tagBasedRelationships) {
      await session.executeWrite(tx =>
        tx.run(
          `
          MATCH (s1:Skill {name: $from}), (s2:Skill {name: $to})
          MERGE (s1)-[r:${rel.type}]->(s2)
          RETURN r
          `,
          { from: rel.from, to: rel.to }
        )
      )
    }

    console.log("✅ MOHARA Radar skills and connections seeded successfully")
  } catch (error) {
    console.error("❌ Error seeding MOHARA Radar skills:", error)
    throw error
  } finally {
    await session.close()
  }
}

// Example Cypher queries for technology insights
export const technologyQueries = {
  // Find technologies by quadrant
  byQuadrant: `
    MATCH (s:Skill)
    WHERE s.quadrant IS NOT NULL
    RETURN s.quadrant, collect(s.name) as technologies
    ORDER BY s.quadrant
  `,
  
  // Find technologies by adoption ring
  byRing: `
    MATCH (s:Skill)
    WHERE s.ring IS NOT NULL
    RETURN s.ring, collect(s.name) as technologies
    ORDER BY s.ring
  `,
  
  // Find featured technologies
  featured: `
    MATCH (s:Skill)
    WHERE s.featured = true
    RETURN s.name, s.quadrant, s.ring
    ORDER BY s.quadrant, s.ring
  `,
  
  // Find technology relationships
  relationships: `
    MATCH (s1:Skill)-[r]->(s2:Skill)
    WHERE s1.quadrant IS NOT NULL AND s2.quadrant IS NOT NULL
    RETURN s1.name, type(r), s2.name
    ORDER BY s1.name
  `,

  // Find technologies by tag
  byTag: `
    MATCH (s:Skill)
    WHERE s.tags IS NOT NULL AND ANY(tag IN s.tags WHERE tag = $tagName)
    RETURN s.name, s.quadrant, s.ring
    ORDER BY s.quadrant, s.ring
  `,
  
  // Find technologies that share tags
  sharingTags: `
    MATCH (s1:Skill)-[:SHARES_TAG_WITH]-(s2:Skill)
    RETURN s1.name, s2.name, [tag IN s1.tags WHERE tag IN s2.tags] AS shared_tags
    ORDER BY size(shared_tags) DESC
  `,
  
  // Find technology clusters
  technologyClusters: `
    MATCH path = (s1:Skill)-[r*1..2]-(s2:Skill)
    WHERE s1.quadrant IS NOT NULL AND s2.quadrant IS NOT NULL
    RETURN s1.name, s2.name, [rel in r | type(rel)] AS relationships
    ORDER BY s1.name, s2.name
  `
}
