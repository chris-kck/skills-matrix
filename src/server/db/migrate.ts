import { getDriver } from "../../lib/neo4j.js";
import { seedWebSkills2025 } from "./migrations/01_web_skills_2025.js";
import { mergeEmployeeTypes } from "./migrations/02_merge_employee_types.js";
import { seedSkillsAndConnections } from "./migrations/03_seed_skills_and_connections.js";

/**
 * This script runs all migrations in the migrations directory
 */
async function migrate() {
  console.log("🚀 Starting database migrations...");
  
  const driver = getDriver();
  const session = driver.session();
  
  try {
    // Run migrations in order
    console.log("📚 Seeding web skills...");
    await seedWebSkills2025();
    
    console.log("👥 Merging employee types...");
    await mergeEmployeeTypes();
    
    console.log("🔄 Seeding MOHARA Radar skills and connections...");
    await seedSkillsAndConnections();
    
    console.log("✅ All migrations completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await session.close();
    await driver.close();
    console.log("🔌 Database connection closed");
  }
}

// Run migrations if this file is executed directly
migrate().catch((error) => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});

export { migrate }; 