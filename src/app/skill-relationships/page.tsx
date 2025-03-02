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
  strength: number
}

interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

export default function SkillRelationships() {
  const { data: graphData, isLoading } = api.skills.getRelationships.useQuery()
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
      <h1 className="text-3xl font-bold mb-6">Skill Relationships</h1>
      <Card>
        <CardHeader>
          <CardTitle>Skills Graph</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height: "600px" }}>
            <ForceGraph2D graphData={graphDataState} nodeLabel="name" nodeAutoColorBy="group" linkDirectionalParticles={2} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

