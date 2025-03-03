MERGE (adr:Skill {name: "ADR"})
SET adr.category = "tools-and-techniques",
    adr.description = "Architecture Decision Records for tracking changes to architecture",
    adr.ring = "adopt",
    adr.quadrant = "tools-and-techniques",
    adr.featured = true,
    adr.tags = ["Architecture", "Documentation"],
    adr.updatedAt = datetime();

MERGE (aws:Skill {name: "AWS"})
SET aws.category = "platforms",
    aws.description = "Amazon Web Services cloud platform",
    aws.ring = "adopt",
    aws.quadrant = "platforms",
    aws.featured = true,
    aws.tags = ["Cloud", "Infrastructure", "DevOps"],
    aws.updatedAt = datetime();

MERGE (docker:Skill {name: "Docker"})
SET docker.category = "platforms",
    docker.description = "Container platform for application packaging",
    docker.ring = "adopt",
    docker.quadrant = "platforms",
    docker.featured = true,
    docker.tags = ["DevOps", "Containers", "Infrastructure"],
    docker.updatedAt = datetime();

MERGE (typescript:Skill {name: "TypeScript"})
SET typescript.category = "languages",
    typescript.description = "Strongly typed programming language that builds on JavaScript",
    typescript.ring = "adopt",
    typescript.quadrant = "languages",
    typescript.featured = true,
    typescript.tags = ["JavaScript", "Static Typing", "Development"],
    typescript.updatedAt = datetime();

MERGE (react:Skill {name: "React"})
SET react.category = "frameworks",
    react.description = "JavaScript library for building user interfaces",
    react.ring = "adopt",
    react.quadrant = "frameworks",
    react.featured = true,
    react.tags = ["Frontend", "UI", "JavaScript"],
    react.updatedAt = datetime();

MERGE (nextjs:Skill {name: "Next.js"})
SET nextjs.category = "frameworks",
    nextjs.description = "React framework for production with SSR and SSG",
    nextjs.ring = "adopt",
    nextjs.quadrant = "frameworks",
    nextjs.featured = true,
    nextjs.tags = ["Frontend", "React", "SSR"],
    nextjs.updatedAt = datetime();

MERGE (vercel:Skill {name: "Vercel"})
SET vercel.category = "platforms",
    vercel.description = "Deployment platform for frontend applications",
    vercel.ring = "adopt",
    vercel.quadrant = "platforms",
    vercel.featured = true,
    vercel.tags = ["Hosting", "Deployment", "Frontend"],
    vercel.updatedAt = datetime(); 