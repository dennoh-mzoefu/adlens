'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PlatformBadge } from '@/components/ads/PlatformBadge'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import type { ResearchWithCounts } from '@/types'

const TYPE_COLORS: Record<string, string> = {
  product: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  service: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  brand: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  person: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  trend: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  event: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
}

export function ResearchCard({ research }: { research: ResearchWithCounts }) {
  return (
    <Link href={`/research/${research.id}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-tight">{research.title}</h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize shrink-0 ${TYPE_COLORS[research.type] || TYPE_COLORS.other}`}
            >
              {research.type}
            </span>
          </div>
          {research.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{research.description}</p>
          )}
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="flex flex-wrap gap-1">
            {research.ads.map((a, i) => (
              <PlatformBadge key={i} platform={a.platform} />
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{research._count.ads} ads · {research._count.analyses} analyses</span>
            <span>{formatDistanceToNow(new Date(research.updatedAt), { addSuffix: true })}</span>
          </div>
          {research.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {research.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
