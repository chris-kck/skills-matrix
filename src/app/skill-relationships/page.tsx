"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import dynamic from "next/dynamic"
import { api } from "~/trpc/react"

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false })

interface GraphNode {
  id: string
  name: string
  group: string
  level?: number
  x?: number
  y?: number
}

interface GraphLink {
  source: string
  target: string
  value: number
  label?: string
}

interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

interface ApiNode {
  id: string
  name: string
  group?: string
}

interface ApiLink {
  source: string
  target: string
  strength: number
}

interface ApiGraphData {
  nodes: ApiNode[]
  links: ApiLink[]
}

interface ForceGraphNode extends GraphNode {
  x: number
  y: number
}

export default function SkillRelationships() {
  const { data: graphData, isLoading } = api.skills.getRelationships.useQuery<ApiGraphData>()
  const [graphDataState, setGraphDataState] = useState<GraphData>({ nodes: [], links: [] })

  useEffect(() => {
    if (graphData) {
      // Transform the data to ensure it matches the GraphData interface
      const transformedData: GraphData = {
        nodes: graphData.nodes.map(node => ({
          id: node.id,
          name: node.name,
          group: node.group || 'default'
        })),
        links: graphData.links.map(link => ({
          source: link.source,
          target: link.target,
          value: link.strength
        }))
      }
      setGraphDataState(transformedData)
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
            <ForceGraph2D 
              graphData={graphDataState} 
              nodeLabel="name" 
              nodeAutoColorBy="group" 
              linkDirectionalParticles={2}
              linkLabel="label"
              nodeVal={5}
              linkWidth={link => (link.value as number) / 20}
              linkDirectionalParticleWidth={link => (link.value as number) / 20}
            />
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h3 className="text-sm font-semibold mb-2">Legend</h3>
              <div className="flex gap-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm">Skills</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

