"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Progress } from "~/components/ui/progress"
import { api } from "~/trpc/react"

export default function SkillGaps() {
  const { data: employees, isLoading } = api.employees.getAll.useQuery()
  const [selectedEmployeeEmail, setSelectedEmployeeEmail] = useState<string>("")

  const selectedEmployee = employees?.find(e => e.email === selectedEmployeeEmail)

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!employees || employees.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Skill Gaps and Learning Paths</h1>
        <p>No employees found.</p>
      </div>
    )
  }

  // Set initial selected employee if none selected
  if (!selectedEmployeeEmail && employees.length > 0) {
    setSelectedEmployeeEmail(employees[0].email)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Skill Gaps and Learning Paths</h1>
      <Select value={selectedEmployeeEmail} onValueChange={setSelectedEmployeeEmail}>
        <SelectTrigger className="w-[280px] mb-6">
          <SelectValue placeholder="Select an employee" />
        </SelectTrigger>
        <SelectContent>
          {employees.map((employee) => (
            <SelectItem key={employee.email} value={employee.email}>
              {employee.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedEmployee && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedEmployee.name}&apos;s Skill Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedEmployee.skills.map((skill) => {
              const targetLevel = skill.ring === 'adopt' ? 90 :
                                skill.ring === 'trial' ? 70 :
                                skill.ring === 'assess' ? 50 : 30
              const gap = targetLevel - skill.level
              return (
                <div key={skill.name} className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span>{skill.name}</span>
                    <span>
                      {skill.level}% / {targetLevel}%
                    </span>
                  </div>
                  <Progress value={skill.level} max={targetLevel} className="w-full" />
                  {gap > 0 && (
                    <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
                      Gap: {gap}% - {gap > 20 ? 'High priority' : 'Low priority'} for learning
                    </p>
                  )}
                </div>
              )
            })}
            {selectedEmployee.skills.length === 0 && (
              <p className="text-sm text-gray-500">No skills assigned yet.</p>
            )}
          </CardContent>
        </Card>
      )}
      <div className="mt-8 p-4 bg-gray-50 rounded-md">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> In future updates, this page will be enhanced to compare individual skills with project requirements. 
          The top section shows individual skill gaps, while the bottom section will display aggregated skill gaps per project.
        </p>
      </div>
    </div>
  )
}

