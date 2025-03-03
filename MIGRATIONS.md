# Database Migrations

This document explains how to run database migrations for the Skills Matrix application.

## Prerequisites

- Node.js 18+ installed
- Neo4j database running (use `npm run db:start` to start it)

## Running Migrations

There are several ways to run migrations:

### Option 1: Using the TypeScript migrations

```bash
npm run db:migrate
```

This will run all TypeScript migrations in the correct order.

### Option 2: Using the simple Cypher migrations

```bash
npm run db:migrate:simple
```

This will run all Cypher migrations in the `migrations` directory.

## Migration Structure

### TypeScript Migrations

TypeScript migrations are located in `src/server/db/migrations` and are executed in numerical order:

1. `01_web_skills_2025.ts` - Seeds initial web skills data
2. `02_merge_employee_types.ts` - Merges employee types
3. `03_seed_skills_and_connections.ts` - Seeds MOHARA Radar skills and their relationships

### Cypher Migrations

Cypher migrations are located in the `migrations` directory and are executed in alphabetical order:

1. `001-seed-skills-simple.cypher` - Seeds skills data
2. `002-create-relationships.cypher` - Creates relationships between skills

## Creating New Migrations

### Creating TypeScript Migrations

1. Create a new file in `src/server/db/migrations` with the naming pattern `XX_description.ts`
2. Export a function that performs the migration
3. Import and add the function to the `runMigrations` function in `src/server/db/migrations/index.ts`

Example migration file structure:

```typescript
import { getDriver } from "~/lib/neo4j.js";

export async function myNewMigration() {
  const driver = getDriver();
  const session = driver.session();

  try {
    // Migration logic here
    await session.executeWrite(tx =>
      tx.run(`
        // Cypher query here
      `)
    );

    console.log("✅ My new migration completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await session.close();
  }
}
```

### Creating Cypher Migrations

1. Create a new file in the `migrations` directory with the naming pattern `XXX-description.cypher`
2. Write your Cypher queries in the file
3. End each statement with a semicolon (`;`)
4. Run the migrations with `npm run db:migrate:simple`

Example Cypher migration file:

```cypher
// Create a new skill
MERGE (skill:Skill {name: "New Skill"})
SET skill.category = "Category",
    skill.description = "Description",
    skill.ring = "adopt",
    skill.quadrant = "tools",
    skill.featured = true,
    skill.tags = ["Tag1", "Tag2"],
    skill.updatedAt = datetime();

// Create a relationship
MATCH (skill1:Skill {name: "Skill1"})
MATCH (skill2:Skill {name: "Skill2"})
MERGE (skill1)-[:RELATED_TO]->(skill2);