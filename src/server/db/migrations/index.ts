import { seedWebSkills2025 } from "./01_web_skills_2025.js"
import { mergeEmployeeTypes } from "./02_merge_employee_types.js"
import { seedSkillsAndConnections } from "./03_seed_skills_and_connections.js"

export async function runMigrations() {
  try {
    console.log("🚀 Starting migrations...")
    
    // Run migrations in order
    console.log("📚 Seeding web skills...")
    await seedWebSkills2025()
    
    console.log("👥 Merging employee types...")
    await mergeEmployeeTypes()
    
    console.log("🔄 Seeding MOHARA Radar skills and connections...")
    await seedSkillsAndConnections()
    
    console.log("✨ All migrations completed successfully")
    return true
  } catch (error) {
    console.error("❌ Migration failed:", error)
    throw error
  }
}

// Run migrations if this file is executed directly
if (import.meta.url.endsWith('index.js')) {
  void runMigrations().catch((error) => {
    console.error("❌ Migration failed:", error)
    process.exit(1)
  })
} 