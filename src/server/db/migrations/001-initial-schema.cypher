/*
    Engineer

        Properties: id, name, email, department, years_of_experience

    Skill

        Properties: id, name, category (e.g., "Frontend", "DevOps"), description

    Project

        Properties: id, name, description, start_date, end_date, status

Relationships (Edges)

    (Engineer)-[HAS_SKILL {proficiency: 1-5}]->(Skill)

        Tracks an engineer's skill proficiency (e.g., 1=Beginner, 5=Expert).

    (Project)-[REQUIRES_SKILL {required_proficiency: 1-5}]->(Skill)

        Specifies skills required for a project.

    (Engineer)-[WORKED_ON {role: "Lead"}]->(Project)

        Optional: Track historical project assignments.
*/

// Create constraints to ensure uniqueness
CREATE CONSTRAINT engineer_id IF NOT EXISTS FOR (e:Engineer) REQUIRE e.id IS UNIQUE;
CREATE CONSTRAINT skill_id IF NOT EXISTS FOR (s:Skill) REQUIRE s.id IS UNIQUE;
CREATE CONSTRAINT project_id IF NOT EXISTS FOR (p:Project) REQUIRE p.id IS UNIQUE;

// Create indexes for better query performance
CREATE INDEX engineer_email IF NOT EXISTS FOR (e:Engineer) ON (e.email);
CREATE INDEX skill_name IF NOT EXISTS FOR (s:Skill) ON (s.name);
CREATE INDEX project_name IF NOT EXISTS FOR (p:Project) ON (p.name);

// Sample data for testing
// Create Engineers
CREATE (e1:Engineer {
    id: "eng1",
    name: "John Doe",
    email: "john@example.com",
    department: "Engineering",
    years_of_experience: 5
});

CREATE (e2:Engineer {
    id: "eng2",
    name: "Jane Smith",
    email: "jane@example.com",
    department: "DevOps",
    years_of_experience: 3
});

// Create Skills
CREATE (s1:Skill {
    id: "skill1",
    name: "React",
    category: "Frontend",
    description: "React.js development"
});

CREATE (s2:Skill {
    id: "skill2",
    name: "Docker",
    category: "DevOps",
    description: "Container orchestration"
});

// Create Projects
CREATE (p1:Project {
    id: "proj1",
    name: "Web Platform Redesign",
    description: "Modernize the web platform",
    start_date: date("2024-01-01"),
    end_date: date("2024-12-31"),
    status: "In Progress"
});

// Create relationships
CREATE (e1)-[:HAS_SKILL {proficiency: 4}]->(s1)
CREATE (e2)-[:HAS_SKILL {proficiency: 5}]->(s2)
CREATE (p1)-[:REQUIRES_SKILL {required_proficiency: 3}]->(s1)
CREATE (e1)-[:WORKED_ON {role: "Lead"}]->(p1);


