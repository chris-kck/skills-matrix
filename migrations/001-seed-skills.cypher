UNWIND [
  {
    name: "ADR",
    category: "tools-and-techniques",
    description: "Architecture Decision Records for tracking changes to architecture",
    ring: "adopt",
    quadrant: "tools-and-techniques",
    featured: true,
    tags: ["Architecture", "Documentation"]
  },
  {
    name: "AWS",
    category: "platforms",
    description: "Amazon Web Services cloud platform",
    ring: "adopt",
    quadrant: "platforms",
    featured: true,
    tags: ["Cloud", "Infrastructure", "DevOps"]
  },
  {
    name: "Docker",
    category: "platforms",
    description: "Container platform for application packaging",
    ring: "adopt",
    quadrant: "platforms",
    featured: true,
    tags: ["DevOps", "Containers", "Infrastructure"]
  },
  {
    name: "TypeScript",
    category: "languages",
    description: "Strongly typed programming language that builds on JavaScript",
    ring: "adopt",
    quadrant: "languages",
    featured: true,
    tags: ["JavaScript", "Static Typing", "Development"]
  },
  {
    name: "React",
    category: "frameworks",
    description: "JavaScript library for building user interfaces",
    ring: "adopt",
    quadrant: "frameworks",
    featured: true,
    tags: ["Frontend", "UI", "JavaScript"]
  },
  {
    name: "Next.js",
    category: "frameworks",
    description: "React framework for production with SSR and SSG",
    ring: "adopt",
    quadrant: "frameworks",
    featured: true,
    tags: ["Frontend", "React", "SSR"]
  },
  {
    name: "Vercel",
    category: "platforms",
    description: "Deployment platform for frontend applications",
    ring: "adopt",
    quadrant: "platforms",
    featured: true,
    tags: ["Hosting", "Deployment", "Frontend"]
  }
] AS skill
MERGE (s:Skill {name: skill.name})
SET s.category = skill.category,
    s.description = skill.description,
    s.ring = skill.ring,
    s.quadrant = skill.quadrant,
    s.featured = skill.featured,
    s.tags = skill.tags,
    s.updatedAt = datetime()
RETURN s;

MATCH (react:Skill {name: "React"})
MATCH (nextjs:Skill {name: "Next.js"})
MATCH (typescript:Skill {name: "TypeScript"})
MATCH (vercel:Skill {name: "Vercel"})
MATCH (docker:Skill {name: "Docker"})
MATCH (aws:Skill {name: "AWS"});

MERGE (react)-[:USED_BY]->(nextjs);
MERGE (typescript)-[:ENHANCES]->(react);
MERGE (nextjs)-[:DEPLOYED_ON]->(vercel);
MERGE (docker)-[:DEPLOYED_ON]->(aws);
MERGE (vercel)-[:RUNS_ON]->(aws);

RETURN *; 