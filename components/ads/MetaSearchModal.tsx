'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AdCard } from './AdCard'
import { Loader2, Search } from 'lucide-react'
import { toast } from 'sonner'

interface MetaSearchModalProps {
  open: boolean
  onClose: () => void
  researchId: string
  onSaved?: () => void
}

export function MetaSearchModal({ open, onClose, researchId, onSaved }: MetaSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch() {
    if (!searchTerm.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch('/api/meta/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchTerm: searchTerm.trim(), limit: 25 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Search failed')
      setResults(data.ads)
    } catch (err: any) {
      toast.error(err.message || 'Meta search failed')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveAll() {
    if (results.length === 0) return
    setSaving(true)
    try {
      const res = await fetch('/api/meta/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchTerm: searchTerm.trim(),
          limit: 25,
          researchId,
          autoSave: true,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      toast.success(`Saved ${data.savedCount} ads to research`)
      onSaved?.()
      onClose()
    } catch (err: any) {
      toast.error(err.message || 'Failed to save ads')
    } finally {
      setSaving(false)
    }
  }

  function handleClose() {
    setSearchTerm('')
    setResults([])
    setSearched(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Meta Ads Library</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            placeholder="Search term e.g. Nike, ChatGPT, Bolt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading || !searchTerm.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              No ads found for "{searchTerm}". Try a different keyword.
            </p>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-4 pb-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{results.length} ads found</p>
                <Button onClick={handleSaveAll} disabled={saving} size="sm">
                  {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                  Save All to Research
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((ad: any) => (
                  <AdCard key={ad.externalId} ad={{ ...ad, id: ad.externalId, importedAt: new Date() } as any} />
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
