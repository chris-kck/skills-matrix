export type RoleType = 'technical' | 'management' | 'design' | 'product'

export interface Skill {
  name: string
  category: string
  description?: string
  ring?: string
  quadrant?: string
  featured?: boolean
  tags?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface Employee {
  name: string
  role: string
  email: string
  department?: string
  roleType: RoleType
  createdAt?: string
  updatedAt?: string
  skills: EmployeeSkill[]
}

export interface EmployeeSkill extends Skill {
  level: number
}

export interface Project {
  name: string
  description: string
  startDate: string
  endDate?: string
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD'
  createdAt?: string
  updatedAt?: string
  team: ProjectMember[]
  requiredSkills: RequiredSkill[]
}

export interface ProjectMember {
  employee: Employee
  role: string
  joinedAt: string
}

export interface RequiredSkill extends Skill {
  requiredLevel: number
} 