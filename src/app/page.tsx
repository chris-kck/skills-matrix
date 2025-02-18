import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Progress } from "~/components/ui/progress"

const teams = [
  { name: "Frontend", skillLevel: 85 },
  { name: "Backend", skillLevel: 90 },
  { name: "DevOps", skillLevel: 75 },
  { name: "Design", skillLevel: 80 },
]

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Skills Matrix Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teams.map((team) => (
          <Card key={team.name}>
            <CardHeader>
              <CardTitle>{team.name} Team</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{team.skillLevel}%</div>
              <Progress value={team.skillLevel} className="w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

