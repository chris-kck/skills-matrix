import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Progress } from "~/components/ui/progress"

const teams = [
  { name: "Frontend", skills: { React: 90, TypeScript: 85, CSS: 80 } },
  { name: "Backend", skills: { Node: 95, Python: 85, SQL: 90 } },
  { name: "DevOps", skills: { Docker: 85, Kubernetes: 80, AWS: 75 } },
  { name: "Design", skills: { Figma: 90, Photoshop: 85, Illustrator: 80 } },
]

export default function TeamComparison() {
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
              {Object.entries(team.skills).map(([skill, level]) => (
                <div key={skill} className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span>{skill}</span>
                    <span>{level}%</span>
                  </div>
                  <Progress value={level} className="w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

