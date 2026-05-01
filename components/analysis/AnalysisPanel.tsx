'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import type { Analysis } from '@/types'

const TYPE_LABELS: Record<string, string> = {
  summary: 'Summary',
  comparison: 'Comparison',
  sentiment: 'Sentiment',
  trend: 'Trend',
  competitive: 'Competitive',
  custom: 'Custom',
}

export function AnalysisPanel({ analysis }: { analysis: Analysis }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline">{TYPE_LABELS[analysis.type] || analysis.type}</Badge>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(analysis.createdAt), { addSuffix: true })}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {analysis.content}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  )
}
