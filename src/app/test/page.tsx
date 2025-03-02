'use client'

import { useState } from 'react'
import { api } from "~/trpc/react"
import ReactFlow, { 
  Background, 
  Controls,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
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

export default function TestPage() {
  // Form states
  const [newSkill, setNewSkill] = useState({ name: '', category: '', description: '' })
  const [newEmployee, setNewEmployee] = useState({ name: '', role: '', email: '', department: '' })
  const [skillAssignment, setSkillAssignment] = useState({ employeeId: '', skillId: '', level: 0 })

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

  // Graph data preparation
  const nodes = [
    ...(employees?.map(emp => ({
      id: emp.email,
      data: { label: emp.name },
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      type: 'default',
    })) ?? []),
    ...(skills?.map(skill => ({
      id: skill.name,
      data: { label: skill.name },
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      type: 'default',
      style: { background: '#f0f0f0' },
    })) ?? []),
  ]

  const edges = employees?.flatMap(emp => 
    emp.skills.map((skill: { name: any; level: any }) => ({
      id: `${emp.email}-${skill.name}`,
      source: emp.email,
      target: skill.name,
      label: `${skill.level}%`,
      markerEnd: { type: MarkerType.ArrowClosed },
    }))
  ) ?? []

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
                  onChange={e => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Category</Label>
                <Input 
                  value={newSkill.category} 
                  onChange={e => setNewSkill(prev => ({ ...prev, category: e.target.value }))}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input 
                  value={newSkill.description} 
                  onChange={e => setNewSkill(prev => ({ ...prev, description: e.target.value }))}
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
                  onChange={e => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Role</Label>
                <Input 
                  value={newEmployee.role} 
                  onChange={e => setNewEmployee(prev => ({ ...prev, role: e.target.value }))}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input 
                  type="email"
                  value={newEmployee.email} 
                  onChange={e => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label>Department</Label>
                <Input 
                  value={newEmployee.department} 
                  onChange={e => setNewEmployee(prev => ({ ...prev, department: e.target.value }))}
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
                onValueChange={value => setSkillAssignment(prev => ({ ...prev, employeeId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees?.map(emp => (
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
                onValueChange={value => setSkillAssignment(prev => ({ ...prev, skillId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select skill" />
                </SelectTrigger>
                <SelectContent>
                  {skills?.map(skill => (
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
                onChange={e => setSkillAssignment(prev => ({ ...prev, level: parseInt(e.target.value) }))}
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
                {skills?.map(skill => (
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
                {employees?.map(emp => (
                  <TableRow key={emp.email}>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>{emp.role}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>
                      {emp.skills.map((skill: { name: any; level: any }) =>
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
          <div style={{ height: '500px' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              fitView
            >
              <Background />
              <Controls />
            </ReactFlow>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 