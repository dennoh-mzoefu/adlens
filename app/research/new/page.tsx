import { ResearchForm } from '@/components/research/ResearchForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function NewResearchPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/research" className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold">New Research Topic</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Topic Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ResearchForm />
        </CardContent>
      </Card>
    </div>
  )
}
