'use client'

import { ResearchCard } from './ResearchCard'
import type { ResearchWithCounts } from '@/types'

export function ResearchGrid({ research }: { research: ResearchWithCounts[] }) {
  if (research.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
        <p className="text-lg font-medium">No research topics yet</p>
        <p className="text-sm mt-1">Create your first topic to start tracking ads.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {research.map((r) => (
        <ResearchCard key={r.id} research={r} />
      ))}
    </div>
  )
}
