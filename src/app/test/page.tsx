'use client'

import { useState, useEffect, Suspense } from 'react'
import { api } from "~/trpc/react"
import dynamic from "next/dynamic"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"

// Import ForceGraph2D dynamically to avoid SSR issues
const ForceGraph2D = dynamic(() => import("react-force-graph-2d").catch(err => {
  console.error("Failed to load ForceGraph2D:", err);
  // Create a named component to fix the display name error
  const FallbackComponent = () => <div>Failed to load graph visualization</div>;
  FallbackComponent.displayName = "ForceGraphFallback";
  return { default: FallbackComponent };
}), { 
  ssr: false,
  loading: () => {
    const LoadingComponent = () => (
      <div className="flex items-center justify-center h-[600px] bg-gray-100 rounded-md">
        Loading graph visualization...
      </div>
    );
    LoadingComponent.displayName = "ForceGraphLoading";
    return <LoadingComponent />;
  }
})

// Define types for the graph data
interface GraphNode {
  id: string
  name: string
  group?: string
}

interface GraphLink {
  source: string
  target: string
  value: number
  label?: string
}

interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

type FormSkill = {
  name: string
  category: string
  description: string
}

type FormEmployee = {
  name: string
  role: string
  email: string
  department: string
}

type SkillAssignment = {
  employeeId: string
  skillId: string
  level: number
}

export default function TestPage() {
  // Form states
  const [newSkill, setNewSkill] = useState<FormSkill>({ name: '', category: '', description: '' })
  const [newEmployee, setNewEmployee] = useState<FormEmployee>({ name: '', role: '', email: '', department: '' })
  const [skillAssignment, setSkillAssignment] = useState<SkillAssignment>({ employeeId: '', skillId: '', level: 0 })
  const [graphDataState, setGraphDataState] = useState<GraphData>({ nodes: [], links: [] })

  // Queries
  const { data: skills, refetch: refetchSkills } = api.skills.getAll.useQuery()
  const { data: employees, refetch: refetchEmployees } = api.employees.getAll.useQuery()

  // Mutations
  const createSkill = api.skills.create.useMutation({
    onSuccess: () => refetchSkills()
  })
  const createEmployee = api.employees.create.useMutation({
    onSuccess: () => refetchEmployees()
  })
  const addSkillToEmployee = api.employees.addSkill.useMutation({
    onSuccess: () => refetchEmployees()
  })

  // Update graph data when skills or employees change
  useEffect(() => {
    if (skills && employees) {
      // Create nodes for employees and skills
      const nodes: GraphNode[] = [
        ...employees.map(emp => ({
          id: emp.email,
          name: emp.name,
          group: 'employee'
        })),
        ...skills.map(skill => ({
          id: skill.name,
          name: skill.name,
          group: 'skill'
        }))
      ]

      // Create links between employees and their skills
      const links: GraphLink[] = employees.flatMap(emp => 
        emp.skills.map(skill => ({
          source: emp.email,
          target: skill.name,
          value: skill.level,
          label: `${skill.level}%`
        }))
      )

      setGraphDataState({ nodes, links })
    }
  }, [skills, employees])

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Skills Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add Skill</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault()
              createSkill.mutate(newSkill)
              setNewSkill({ name: '', category: '', description: '' })
            }}>
              <div>
                <Label>Name</Label>
                <Input 
                  value={newSkill.name} 
                  onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Category</Label>
                <Input 
                  value={newSkill.category} 
                  onChange={(e) => setNewSkill(prev => ({ ...prev, category: e.target.value }))}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input 
                  value={newSkill.description} 
                  onChange={(e) => setNewSkill(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <Button type="submit">Add Skill</Button>
            </form>
          </CardContent>
        </Card>

        {/* Employee Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add Employee</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault()
              createEmployee.mutate(newEmployee)
              setNewEmployee({ name: '', role: '', email: '', department: '' })
            }}>
              <div>
                <Label>Name</Label>
                <Input 
                  value={newEmployee.name} 
                  onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Role</Label>
                <Input 
                  value={newEmployee.role} 
                  onChange={(e) => setNewEmployee(prev => ({ ...prev, role: e.target.value }))}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input 
                  type="email"
                  value={newEmployee.email} 
                  onChange={(e) => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label>Department</Label>
                <Input 
                  value={newEmployee.department} 
                  onChange={(e) => setNewEmployee(prev => ({ ...prev, department: e.target.value }))}
                />
              </div>
              <Button type="submit">Add Employee</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Skill Assignment Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Assign Skill to Employee</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex gap-4 items-end" onSubmit={(e) => {
            e.preventDefault()
            if (skillAssignment.employeeId && skillAssignment.skillId) {
              addSkillToEmployee.mutate(skillAssignment)
              setSkillAssignment({ employeeId: '', skillId: '', level: 0 })
            }
          }}>
            <div className="flex-1">
              <Label>Employee</Label>
              <Select 
                value={skillAssignment.employeeId}
                onValueChange={(value) => setSkillAssignment(prev => ({ ...prev, employeeId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees?.map((emp) => (
                    <SelectItem key={emp.email} value={emp.email}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>Skill</Label>
              <Select
                value={skillAssignment.skillId}
                onValueChange={(value) => setSkillAssignment(prev => ({ ...prev, skillId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select skill" />
                </SelectTrigger>
                <SelectContent>
                  {skills?.map((skill) => (
                    <SelectItem key={skill.name} value={skill.name}>
                      {skill.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>Level (0-100)</Label>
              <Input 
                type="number"
                min={0}
                max={100}
                value={skillAssignment.level} 
                onChange={(e) => setSkillAssignment(prev => ({ ...prev, level: parseInt(e.target.value) }))}
              />
            </div>
            <Button type="submit">Assign Skill</Button>
          </form>
        </CardContent>
      </Card>

      {/* Data Tables */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {skills?.map((skill) => (
                  <TableRow key={skill.name}>
                    <TableCell>{skill.name}</TableCell>
                    <TableCell>{skill.category}</TableCell>
                    <TableCell>{skill.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Skills</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees?.map((emp) => (
                  <TableRow key={emp.email}>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>{emp.role}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>
                      {emp.skills.map(skill => 
                        `${skill.name} (${skill.level}%)`
                      ).join(', ')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Skills Graph */}
      <Card>
        <CardHeader>
          <CardTitle>Skills Graph</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height: '600px' }}>
            <Suspense fallback={<div className="flex items-center justify-center h-full bg-gray-100 rounded-md">Loading graph...</div>}>
              {graphDataState.nodes.length > 0 ? (
                <ForceGraph2D 
                  graphData={graphDataState}
                  nodeLabel="name"
                  nodeAutoColorBy="group"
                  linkDirectionalParticles={2}
                  linkLabel="label"
                  linkWidth={link => (link.value as number) / 20}
                  linkDirectionalParticleWidth={link => (link.value as number) / 20}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100 rounded-md">
                  No data available for visualization
                </div>
              )}
            </Suspense>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 