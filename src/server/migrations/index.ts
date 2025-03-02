import { seedWebSkills2025 } from "./01_web_skills_2025"
import { mergeEmployeeTypes } from "./02_merge_employee_types"

export async function runMigrations() {
  try {
    console.log("🚀 Starting migrations...")
    
    // Run migrations in order
    console.log("📚 Seeding web skills...")
    await seedWebSkills2025()
    
    console.log("👥 Merging employee types...")
    await mergeEmployeeTypes()
    
    console.log("✨ All migrations completed successfully")
  } catch (error) {
    console.error("❌ Migration failed:", error)
    process.exit(1)
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
} 