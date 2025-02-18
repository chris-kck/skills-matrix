"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false })

export default function TeamCollaboration() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] })

  useEffect(() => {
    // In a real application, you would fetch this data from your Neo4j database
    const fetchGraphData = async () => {
      // Simulated API call
      const response = await fetch("/api/team-collaboration")
      const data = await response.json()
      setGraphData(data)
    }

    fetchGraphData()
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Team Collaboration Network</h1>
      <Card>
        <CardHeader>
          <CardTitle>Collaboration Graph</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height: "600px" }}>
            <ForceGraph2D
              graphData={graphData}
              nodeLabel="name"
              nodeAutoColorBy="team"
              linkDirectionalParticles={2}
              linkLabel="sharedSkills"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

