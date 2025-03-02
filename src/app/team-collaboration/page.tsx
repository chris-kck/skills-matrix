"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { api } from "~/trpc/react"

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false })

// Define types for the graph data
interface GraphNode {
  id: string
  name: string
}

interface GraphLink {
  source: string
  target: string
  sharedSkills: string
  strength: number
}

interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

export default function TeamCollaboration() {
  const { data: graphData, isLoading } = api.employees.getTeamCollaboration.useQuery()
  const [graphDataState, setGraphDataState] = useState<GraphData>({ nodes: [], links: [] })

  useEffect(() => {
    if (graphData) {
      setGraphDataState(graphData)
    }
  }, [graphData])

  if (isLoading) {
    return <div>Loading...</div>
  }

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
              graphData={graphDataState}
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

