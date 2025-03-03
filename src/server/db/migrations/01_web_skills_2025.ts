import { getDriver } from "../../../lib/neo4j.js"

const webSkills2025 = {
  "Frontend Frameworks": [
    { name: "React", category: "Frontend", description: "Meta's UI library with Server Components and React Server Actions" },
    { name: "Next.js", category: "Frontend", description: "Full-stack React framework with App Router and Server Components" },
    { name: "Vue 3", category: "Frontend", description: "Progressive JavaScript framework with Composition API" },
    { name: "Svelte", category: "Frontend", description: "Compiler-first framework with SvelteKit" },
    { name: "Astro", category: "Frontend", description: "Static site builder with Islands Architecture" },
    { name: "Qwik", category: "Frontend", description: "Resumable framework with zero hydration" },
  ],
  "Backend Technologies": [
    { name: "Node.js", category: "Backend", description: "JavaScript runtime with worker threads and performance improvements" },
    { name: "Deno", category: "Backend", description: "Secure TypeScript runtime with built-in tools" },
    { name: "Bun", category: "Backend", description: "Fast all-in-one JavaScript runtime and toolchain" },
    { name: "tRPC", category: "Backend", description: "End-to-end typesafe APIs with TypeScript" },
    { name: "GraphQL", category: "Backend", description: "Query language for APIs with federation support" },
  ],
  "Databases": [
    { name: "Neo4j", category: "Database", description: "Graph database for connected data" },
    { name: "PostgreSQL", category: "Database", description: "Advanced relational database with JSON support" },
    { name: "MongoDB", category: "Database", description: "Document database with time-series collections" },
    { name: "Redis", category: "Database", description: "In-memory data store with Redis Stack" },
    { name: "PlanetScale", category: "Database", description: "Serverless MySQL platform" },
  ],
  "State Management": [
    { name: "Zustand", category: "State", description: "Simple state management with hooks" },
    { name: "Jotai", category: "State", description: "Atomic state management for React" },
    { name: "TanStack Query", category: "State", description: "Powerful async state management" },
    { name: "Redux Toolkit", category: "State", description: "Modern Redux with simplified logic" },
  ],
  "Testing": [
    { name: "Vitest", category: "Testing", description: "Next-generation testing framework" },
    { name: "Playwright", category: "Testing", description: "End-to-end testing for modern web apps" },
    { name: "Testing Library", category: "Testing", description: "Testing utilities for user-centric testing" },
    { name: "Cypress", category: "Testing", description: "Modern web testing framework" },
  ],
  "DevOps & Deployment": [
    { name: "Docker", category: "DevOps", description: "Container platform with compose V2" },
    { name: "Kubernetes", category: "DevOps", description: "Container orchestration platform" },
    { name: "Vercel", category: "DevOps", description: "Frontend deployment and hosting platform" },
    { name: "GitHub Actions", category: "DevOps", description: "CI/CD automation platform" },
  ],
  "AI & ML Integration": [
    { name: "OpenAI API", category: "AI", description: "GPT-4 and DALL-E integration" },
    { name: "Langchain", category: "AI", description: "Framework for LLM applications" },
    { name: "TensorFlow.js", category: "AI", description: "Machine learning in JavaScript" },
    { name: "Hugging Face", category: "AI", description: "ML models and datasets platform" },
  ],
  "UI & Design": [
    { name: "Tailwind CSS", category: "UI", description: "Utility-first CSS framework" },
    { name: "Shadcn UI", category: "UI", description: "Re-usable component system" },
    { name: "Radix UI", category: "UI", description: "Unstyled accessible components" },
    { name: "Framer Motion", category: "UI", description: "Production-ready animation library" },
  ],
  "Performance & Monitoring": [
    { name: "Web Vitals", category: "Performance", description: "Core Web Vitals optimization" },
    { name: "Sentry", category: "Monitoring", description: "Error tracking and monitoring" },
    { name: "Datadog", category: "Monitoring", description: "Observability platform" },
    { name: "Lighthouse", category: "Performance", description: "Performance auditing tool" },
  ]
}

export async function seedWebSkills2025() {
  const driver = getDriver()
  const session = driver.session()

  try {
    // Create skill categories and skills
    for (const [category, skills] of Object.entries(webSkills2025)) {
      for (const skill of skills) {
        await session.executeWrite(tx =>
          tx.run(
            `
            MERGE (s:Skill {name: $name})
            SET s.category = $category,
                s.description = $description,
                s.updatedAt = datetime()
            RETURN s
            `,
            skill
          )
        )
      }
    }

    // Create some skill relationships
    const skillRelationships = [
      { from: "React", to: "Next.js", type: "RELATED_TO" },
      { from: "Next.js", to: "Vercel", type: "DEPLOYED_ON" },
      { from: "React", to: "TanStack Query", type: "WORKS_WITH" },
      { from: "Node.js", to: "tRPC", type: "SUPPORTS" },
      { from: "Tailwind CSS", to: "Shadcn UI", type: "USED_BY" },
    ]

    for (const rel of skillRelationships) {
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

    console.log("✅ Web Skills 2025 seeded successfully")
  } catch (error) {
    console.error("❌ Error seeding web skills:", error)
    throw error
  } finally {
    await session.close()
  }
}

// Example Cypher queries for skill insights
export const skillQueries = {
  // Find skills by category
  byCategory: `
    MATCH (s:Skill)
    RETURN s.category, collect(s.name) as skills
    ORDER BY s.category
  `,
  
  // Find related skills
  relatedSkills: `
    MATCH (s1:Skill)-[r]->(s2:Skill)
    RETURN s1.name, type(r), s2.name
  `,
  
  // Find most in-demand skills (by employee count)
  mostInDemand: `
    MATCH (e:Employee)-[r:HAS_SKILL]->(s:Skill)
    RETURN s.name, count(e) as employeeCount, avg(r.level) as avgLevel
    ORDER BY employeeCount DESC
  `,
  
  // Skill gaps analysis
  skillGaps: `
    MATCH (s:Skill)
    OPTIONAL MATCH (e:Employee)-[r:HAS_SKILL]->(s)
    WITH s, count(e) as employeeCount
    WHERE employeeCount = 0
    RETURN s.name, s.category
    ORDER BY s.category
  `
} 