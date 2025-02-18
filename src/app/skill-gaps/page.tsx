"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Progress } from "~/components/ui/progress"

const employees = [
  {
    name: "Alice Johnson",
    currentSkills: { React: 90, TypeScript: 85, GraphQL: 70 },
    targetSkills: { React: 95, TypeScript: 90, GraphQL: 85, NextJS: 80 },
  },
  {
    name: "Bob Smith",
    currentSkills: { Python: 85, SQL: 90, Docker: 75 },
    targetSkills: { Python: 90, SQL: 95, Docker: 85, Kubernetes: 80 },
  },
]

export default function SkillGaps() {
  const [selectedEmployee, setSelectedEmployee] = useState(employees[0])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Skill Gaps and Learning Paths</h1>
      <Select onValueChange={(value) => setSelectedEmployee(employees.find((e) => e.name === value)!)}>
        <SelectTrigger className="w-[280px] mb-6">
          <SelectValue placeholder="Select an employee" />
        </SelectTrigger>
        <SelectContent>
          {employees.map((employee) => (
            <SelectItem key={employee.name} value={employee.name}>
              {employee.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Card>
        <CardHeader>
          <CardTitle>{selectedEmployee.name}'s Skill Gaps</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.entries(selectedEmployee.targetSkills).map(([skill, targetLevel]) => {
            const currentLevel = selectedEmployee.currentSkills[skill] || 0
            const gap = targetLevel - currentLevel
            return (
              <div key={skill} className="mb-4">
                <div className="flex justify-between mb-1">
                  <span>{skill}</span>
                  <span>
                    {currentLevel}% / {targetLevel}%
                  </span>
                </div>
                <Progress value={currentLevel} max={targetLevel} className="w-full" />
                {gap > 0 && (
                  <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">Gap: {gap}% - Recommended for learning</p>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

