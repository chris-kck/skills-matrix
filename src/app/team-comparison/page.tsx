'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Progress } from "~/components/ui/progress"
import { api } from "~/trpc/react"

interface TeamSkill {
  name: string
  level: number
}

interface Team {
  name: string
  skills: TeamSkill[]
}

export default function TeamComparison() {
  const [teams, setTeams] = useState<Team[]>([])
  const { data: employees, isLoading } = api.employees.getAll.useQuery()

  useEffect(() => {
    if (employees) {
      // Group employees by department and calculate average skill levels
      const teamMap = new Map<string, Map<string, number[]>>()
      
      employees.forEach((employee) => {
        const department = employee.department ?? 'Unassigned'
        if (!teamMap.has(department)) {
          teamMap.set(department, new Map())
        }
        
        const skillMap = teamMap.get(department)!
        employee.skills.forEach((skill) => {
          if (!skillMap.has(skill.name)) {
            skillMap.set(skill.name, [])
          }
          skillMap.get(skill.name)!.push(skill.level)
        })
      })

      // Convert the map to the required format
      const processedTeams: Team[] = Array.from(teamMap.entries()).map(([name, skillMap]) => ({
        name,
        skills: Array.from(skillMap.entries()).map(([skillName, levels]) => ({
          name: skillName,
          level: Math.round(levels.reduce((a, b) => a + b, 0) / levels.length)
        }))
      }))

      setTeams(processedTeams)
    }
  }, [employees])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Team Comparison</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teams.map((team) => (
          <Card key={team.name}>
            <CardHeader>
              <CardTitle>{team.name} Team</CardTitle>
            </CardHeader>
            <CardContent>
              {team.skills.map((skill) => (
                <div key={skill.name} className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span>{skill.name}</span>
                    <span>{skill.level}%</span>
                  </div>
                  <Progress value={skill.level} className="w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

