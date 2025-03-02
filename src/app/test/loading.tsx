import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"

export default function TestLoading() {
  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Skeleton for Skills Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add Skill</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
              <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
              <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
              <div className="h-10 w-24 bg-gray-200 animate-pulse rounded-md"></div>
            </div>
          </CardContent>
        </Card>

        {/* Skeleton for Employee Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add Employee</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
              <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
              <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
              <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
              <div className="h-10 w-24 bg-gray-200 animate-pulse rounded-md"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skeleton for Skill Assignment Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Assign Skill to Employee</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1 h-10 bg-gray-200 animate-pulse rounded-md"></div>
            <div className="flex-1 h-10 bg-gray-200 animate-pulse rounded-md"></div>
            <div className="flex-1 h-10 bg-gray-200 animate-pulse rounded-md"></div>
            <div className="h-10 w-24 bg-gray-200 animate-pulse rounded-md"></div>
          </div>
        </CardContent>
      </Card>

      {/* Skeleton for Data Tables */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
              <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
              <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
              <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
              <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skeleton for Skills Graph */}
      <Card>
        <CardHeader>
          <CardTitle>Skills Graph</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] bg-gray-200 animate-pulse rounded-md flex items-center justify-center">
            <div className="text-gray-500">Loading graph visualization...</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 