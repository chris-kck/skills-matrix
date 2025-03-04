'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Progress } from "~/components/ui/progress"
import { api } from "~/trpc/react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"

export default function Home() {
  const [selectedRing, setSelectedRing] = useState<string>("adopt")
  const { data: projects, isLoading: projectsLoading } = api.projects.getAll.useQuery()
  const { data: adoptedSkills } = api.skills.getByRing.useQuery({ ring: "adopt" })
  const { data: topSkills } = api.skills.getTopSkills.useQuery()
  const { data: lackingSkills } = api.skills.getLackingSkills.useQuery()

  if (projectsLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Skills Matrix Dashboard</h1>
      
      {/* Projects Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {projects?.map((project) => (
          <Card key={project.name}>
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <p className="text-sm text-gray-500">Aggregate Skills</p>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{project.skillLevel}%</div>
              <Progress value={project.skillLevel} className="w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Adopted Skills */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Adopted Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {adoptedSkills?.map((skill) => (
              <span
                key={skill.name}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top 10 Skills */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Top 10 Skills</CardTitle>
            <Select value={selectedRing} onValueChange={setSelectedRing}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select ring" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="adopt">Adopt</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="assess">Assess</SelectItem>
                <SelectItem value="hold">Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Skill</TableHead>
                <TableHead>Ring</TableHead>
                <TableHead>Top 3 People</TableHead>
                <TableHead>Average Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topSkills
                ?.filter(skill => skill.ring === selectedRing)
                .slice(0, 10)
                .map((skill) => (
                  <TableRow key={skill.name}>
                    <TableCell className="font-medium">{skill.name}</TableCell>
                    <TableCell>{skill.ring}</TableCell>
                    <TableCell>
                      <ul className="list-disc list-inside">
                        {skill.topPeople.map(person => (
                          <li key={person.email}>
                            {person.name} ({person.level}%)
                          </li>
                        ))}
                      </ul>
                    </TableCell>
                    <TableCell>{skill.averageLevel}%</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Lacking Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Skills We Need to Develop</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Skill</TableHead>
                <TableHead>Ring</TableHead>
                <TableHead>Current Coverage</TableHead>
                <TableHead>Required Level</TableHead>
                <TableHead>Gap</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lackingSkills?.slice(0, 10).map((skill) => (
                <TableRow key={skill.name}>
                  <TableCell className="font-medium">{skill.name}</TableCell>
                  <TableCell>{skill.ring}</TableCell>
                  <TableCell>{skill.currentCoverage}%</TableCell>
                  <TableCell>{skill.requiredLevel}%</TableCell>
                  <TableCell className="text-red-600">
                    {skill.requiredLevel - skill.currentCoverage}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

