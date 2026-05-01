'use client'

import { useState } from 'react'
import { AdCard } from './AdCard'
import { Button } from '@/components/ui/button'
import type { Ad, Platform } from '@/types'

const PLATFORMS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'meta', label: 'Meta' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'google', label: 'Google' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'twitter', label: 'X/Twitter' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'other', label: 'Other' },
]

interface AdGridProps {
  ads: Ad[]
  onDelete?: (id: string) => void
  showFilters?: boolean
}

export function AdGrid({ ads, onDelete, showFilters = true }: AdGridProps) {
  const [platformFilter, setPlatformFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')

  const filtered = ads.filter((ad) => {
    if (platformFilter !== 'all' && ad.platform !== platformFilter) return false
    if (sourceFilter !== 'all' && ad.source !== sourceFilter) return false
    return true
  })

  function handleDelete(id: string) {
    onDelete?.(id)
  }

  if (ads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
        <p className="text-lg font-medium">No ads yet</p>
        <p className="text-sm mt-1">Search Meta Ads or add one manually to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="flex flex-wrap gap-2">
          <div className="flex flex-wrap gap-1">
            {PLATFORMS.map((p) => (
              <Button
                key={p.value}
                variant={platformFilter === p.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPlatformFilter(p.value)}
                className="h-7 text-xs"
              >
                {p.label}
              </Button>
            ))}
          </div>
          <div className="flex gap-1 ml-auto">
            {['all', 'api', 'manual'].map((s) => (
              <Button
                key={s}
                variant={sourceFilter === s ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSourceFilter(s)}
                className="h-7 text-xs capitalize"
              >
                {s === 'all' ? 'All Sources' : s === 'api' ? 'Meta API' : 'Manual'}
              </Button>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-8 text-sm">
          No ads match the current filters.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((ad) => (
            <AdCard key={ad.id} ad={ad} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
