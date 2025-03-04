'use client'

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { api } from "~/trpc/react"

export default function SkillRecommendations() {
  const { data: recommendations, isLoading } = api.skills.getRecommendations.useQuery()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Skill Recommendations</h1>
        <p>No recommendations available.</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Skill Recommendations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map((rec) => (
          <Card key={`${rec.employee}-${rec.currentSkill}`}>
            <CardHeader>
              <CardTitle>{rec.employee}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Current Skills</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {rec.currentSkills.map(skill => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Recommended Skills</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {rec.recommendedSkills.map(skill => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Skills to Upskill</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {rec.upskillSkills.map(skill => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

