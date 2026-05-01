'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PlatformBadge } from './PlatformBadge'
import { ExternalLink, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import type { Ad } from '@/types'

interface AdCardProps {
  ad: Ad
  onDelete?: (id: string) => void
}

export function AdCard({ ad, onDelete }: AdCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this ad?')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/ads/${ad.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Ad deleted')
      onDelete?.(ad.id)
    } catch {
      toast.error('Failed to delete ad')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card className="flex flex-col gap-0">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5 items-center">
            <PlatformBadge platform={ad.platform} />
            {ad.source === 'api' ? (
              <Badge variant="outline" className="text-xs">API</Badge>
            ) : (
              <Badge variant="outline" className="text-xs">Manual</Badge>
            )}
          </div>
          <div className="flex gap-1 shrink-0">
            {ad.snapshotUrl && (
              <a href={ad.snapshotUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
        <p className="font-semibold text-sm mt-1">{ad.advertiser}</p>
        {ad.adTitle && (
          <p className="text-sm text-muted-foreground">{ad.adTitle}</p>
        )}
      </CardHeader>

      <CardContent className="pt-0 flex flex-col gap-3">
        {ad.adText && (
          <div>
            <p className={`text-sm text-muted-foreground ${!expanded ? 'line-clamp-3' : ''}`}>
              {ad.adText}
            </p>
            {ad.adText.length > 150 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-primary mt-1 flex items-center gap-0.5"
              >
                {expanded ? <><ChevronUp className="h-3 w-3" /> Show less</> : <><ChevronDown className="h-3 w-3" /> Show more</>}
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {ad.ctaText && <div><span className="font-medium text-foreground">CTA:</span> {ad.ctaText}</div>}
          {ad.region && <div><span className="font-medium text-foreground">Region:</span> {ad.region}</div>}
          {ad.spend && <div><span className="font-medium text-foreground">Spend:</span> {ad.spend}</div>}
          {ad.impressions && <div><span className="font-medium text-foreground">Impressions:</span> {ad.impressions}</div>}
          {ad.startDate && (
            <div className="col-span-2">
              <span className="font-medium text-foreground">Running:</span>{' '}
              {new Date(ad.startDate).toLocaleDateString()} →{' '}
              {ad.endDate ? new Date(ad.endDate).toLocaleDateString() : 'Active'}
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-auto">
          Imported {formatDistanceToNow(new Date(ad.importedAt), { addSuffix: true })}
        </p>
      </CardContent>
    </Card>
  )
}
