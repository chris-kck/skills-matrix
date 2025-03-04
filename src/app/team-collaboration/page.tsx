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
              nodeVal={8}
              linkWidth={link => (link.strength as number) / 20}
              linkDirectionalParticleWidth={link => (link.strength as number) / 20}
            />
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h3 className="text-sm font-semibold mb-2">Legend</h3>
              <div className="flex gap-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm">Team Members</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

