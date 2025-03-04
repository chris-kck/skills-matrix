'use client'

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Progress } from "~/components/ui/progress"
import { api } from "~/trpc/react"

export default function IndividualSkills() {
  const { data: employees, isLoading } = api.employees.getAll.useQuery()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!employees || employees.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Individual Skills Report</h1>
        <p>No employees found.</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Individual Skills Report</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {employees.map((employee) => (
          <Card key={employee.email}>
            <CardHeader>
              <CardTitle>{employee.name}</CardTitle>
              <p className="text-sm text-gray-500">{employee.role}</p>
            </CardHeader>
            <CardContent>
              {employee.skills.map((skill) => (
                <div key={skill.name} className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span>{skill.name}</span>
                    <span>{skill.level}%</span>
                  </div>
                  <Progress value={skill.level} className="w-full" />
                </div>
              ))}
              {employee.skills.length === 0 && (
                <p className="text-sm text-gray-500">No skills assigned yet.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

