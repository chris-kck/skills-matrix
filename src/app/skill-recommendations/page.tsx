import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"

const recommendations = [
  { employee: "Alice Johnson", currentSkill: "React", recommendedSkill: "Vue.js" },
  { employee: "Bob Smith", currentSkill: "Python", recommendedSkill: "Go" },
  { employee: "Charlie Brown", currentSkill: "Docker", recommendedSkill: "Terraform" },
  { employee: "Diana Lee", currentSkill: "Figma", recommendedSkill: "Sketch" },
]

export default function SkillRecommendations() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Skill Recommendations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map((rec, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{rec.employee}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Current Skill: {rec.currentSkill}</p>
              <p>Recommended Skill: {rec.recommendedSkill}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

