'use client'

import { AdGrid } from './AdGrid'
import type { Ad, ResearchWithCounts } from '@/types'

interface AdComparisonProps {
  topicA: ResearchWithCounts | null
  topicB: ResearchWithCounts | null
  adsA: Ad[]
  adsB: Ad[]
}

export function AdComparison({ topicA, topicB, adsA, adsB }: AdComparisonProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div>
        <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
          {topicA?.title || 'Topic A'} — {adsA.length} ads
        </h3>
        <AdGrid ads={adsA} showFilters={false} />
      </div>
      <div>
        <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
          {topicB?.title || 'Topic B'} — {adsB.length} ads
        </h3>
        <AdGrid ads={adsB} showFilters={false} />
      </div>
    </div>
  )
}
