import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Progress } from "~/components/ui/progress"

const employees = [
  { name: "Alice Johnson", role: "Frontend Developer", skills: { React: 95, TypeScript: 90, CSS: 85 } },
  { name: "Bob Smith", role: "Backend Developer", skills: { Node: 90, Python: 85, SQL: 95 } },
  { name: "Charlie Brown", role: "DevOps Engineer", skills: { Docker: 90, Kubernetes: 85, AWS: 80 } },
  { name: "Diana Lee", role: "UI/UX Designer", skills: { Figma: 95, Photoshop: 90, Illustrator: 85 } },
]

export default function IndividualSkills() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Individual Skills Report</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {employees.map((employee) => (
          <Card key={employee.name}>
            <CardHeader>
              <CardTitle>{employee.name}</CardTitle>
              <p className="text-sm text-gray-500">{employee.role}</p>
            </CardHeader>
            <CardContent>
              {Object.entries(employee.skills).map(([skill, level]) => (
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

