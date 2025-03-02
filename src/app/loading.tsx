import { Card, CardContent } from "~/components/ui/card"

export default function Loading() {
  return (
    <div className="container flex items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    </div>
  )
} 