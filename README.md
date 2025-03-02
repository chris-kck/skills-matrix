# Skills Matrix

A comprehensive skills management system built with Next.js, tRPC, Neo4j, and React Flow. Track employee skills, manage projects, and visualize skill relationships across your organization.

## Features

- 🎯 **Skills Management**: Create, update, and track skills with categories
- 👥 **Employee Profiles**: Manage employee information and their skill levels
- 📊 **Visual Graph**: Interactive visualization of skills and employee relationships
- 📋 **Project Management**: Track projects and required skills
- 🔄 **Real-time Updates**: Instant UI updates when data changes
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14, React Flow, Shadcn UI
- **Backend**: tRPC, Neo4j
- **Database**: Neo4j Graph Database
- **Styling**: Tailwind CSS

## Prerequisites

- Node.js 18+ and npm
- Neo4j Database (local or cloud)

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/skills-matrix.git
   cd skills-matrix
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file with:
   ```env
   NEO4J_URI=bolt://localhost:7687
   NEO4J_USER=neo4j
   NEO4J_PASSWORD=your_password
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Web app: [http://localhost:3000](http://localhost:3000)
   - Neo4j Browser: [http://localhost:7474/browser/](http://localhost:7474/browser/)

## Database Visualization

To view and interact with the database directly:

1. Open [http://localhost:7474/browser/](http://localhost:7474/browser/)
2. Login with your Neo4j credentials
3. Run these sample queries:

```cypher
// View all employees and their skills
MATCH (e:Employee)-[r:HAS_SKILL]->(s:Skill)
RETURN e, r, s;

// View skill distribution
MATCH (e:Employee)-[r:HAS_SKILL]->(s:Skill)
RETURN s.name, count(e) as employeeCount, avg(r.level) as avgLevel
ORDER BY employeeCount DESC;

// View project requirements
MATCH (p:Project)-[r:REQUIRES_SKILL]->(s:Skill)
RETURN p, r, s;
```

## API Routes

### Skills
- `GET /api/trpc/skills.getAll` - List all skills
- `POST /api/trpc/skills.create` - Create new skill
- `PUT /api/trpc/skills.update` - Update skill
- `DELETE /api/trpc/skills.delete` - Delete skill

### Employees
- `GET /api/trpc/employees.getAll` - List all employees with skills
- `POST /api/trpc/employees.create` - Create new employee
- `POST /api/trpc/employees.addSkill` - Add skill to employee
- `PUT /api/trpc/employees.updateSkillLevel` - Update skill level
- `DELETE /api/trpc/employees.removeSkill` - Remove skill from employee

### Projects
- `GET /api/trpc/projects.getAll` - List all projects
- `POST /api/trpc/projects.create` - Create new project
- `POST /api/trpc/projects.addTeamMember` - Add team member
- `POST /api/trpc/projects.addRequiredSkill` - Add required skill
- `PUT /api/trpc/projects.updateStatus` - Update project status

## Data Model

```cypher
// Node Labels
:Employee {
  name: string,
  role: string,
  email: string,
  department: string?,
  createdAt: datetime
}

:Skill {
  name: string,
  category: string?,
  description: string?,
  createdAt: datetime
}

:Project {
  name: string,
  description: string,
  startDate: datetime,
  endDate: datetime?,
  status: enum['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'],
  createdAt: datetime
}

// Relationships
[:HAS_SKILL {level: number, updatedAt: datetime}]
[:WORKS_ON {role: string, joinedAt: datetime}]
[:REQUIRES_SKILL {requiredLevel: number, updatedAt: datetime}]
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
