'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { AdGrid } from '@/components/ads/AdGrid'
import { MetaSearchModal } from '@/components/ads/MetaSearchModal'
import { ManualImportForm } from '@/components/ads/ManualImportForm'
import { AnalysisPanel } from '@/components/analysis/AnalysisPanel'
import { RunAnalysisButton } from '@/components/analysis/RunAnalysisButton'
import { ResearchForm } from '@/components/research/ResearchForm'
import { PlatformBadge } from '@/components/ads/PlatformBadge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Search, Plus, Loader2, ChevronLeft, Archive, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import type { Ad, Analysis, Research } from '@/types'

interface ResearchFull extends Research {
  ads: Ad[]
  analyses: Analysis[]
  _count: { ads: number; analyses: number }
}

export function ResearchDetailClient({ research }: { research: ResearchFull }) {
  const router = useRouter()
  const [ads, setAds] = useState<Ad[]>(research.ads)
  const [analyses, setAnalyses] = useState<Analysis[]>(research.analyses)
  const [notes, setNotes] = useState(research.notes || '')
  const [savingNotes, setSavingNotes] = useState(false)
  const [metaModalOpen, setMetaModalOpen] = useState(false)
  const [manualModalOpen, setManualModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [archiving, setArchiving] = useState(false)

  async function saveNotes() {
    setSavingNotes(true)
    try {
      await fetch(`/api/research/${research.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })
      toast.success('Notes saved')
    } catch {
      toast.error('Failed to save notes')
    } finally {
      setSavingNotes(false)
    }
  }

  async function handleRefreshAds() {
    const res = await fetch(`/api/ads?researchId=${research.id}`)
    const data = await res.json()
    setAds(data.ads || [])
  }

  async function handleArchive() {
    if (!confirm('Archive this research topic?')) return
    setArchiving(true)
    try {
      await fetch(`/api/research/${research.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: research.status === 'archived' ? 'active' : 'archived' }),
      })
      toast.success(research.status === 'archived' ? 'Research restored' : 'Research archived')
      router.push('/research')
    } catch {
      toast.error('Failed to update research')
      setArchiving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this research topic and all its ads? This cannot be undone.')) return
    setDeleting(true)
    try {
      await fetch(`/api/research/${research.id}`, { method: 'DELETE' })
      toast.success('Research deleted')
      router.push('/research')
    } catch {
      toast.error('Failed to delete research')
      setDeleting(false)
    }
  }

  function handleDeleteAd(id: string) {
    setAds((prev) => prev.filter((a) => a.id !== id))
  }

  function handleAnalysisComplete(analysis: Analysis) {
    setAnalyses((prev) => [analysis, ...prev])
  }

  const uniquePlatforms = [...new Set(ads.map((a) => a.platform))]

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link href="/research" className="text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{research.title}</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                {research.type}
              </span>
            </div>
            <div className="flex gap-1 mt-1">
              {uniquePlatforms.map((p) => (
                <PlatformBadge key={p} platform={p} />
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={handleArchive} disabled={archiving}>
            <Archive className="h-4 w-4 mr-1" />
            {research.status === 'archived' ? 'Restore' : 'Archive'}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete} disabled={deleting}
            className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      <Tabs defaultValue="ads">
        <TabsList>
          <TabsTrigger value="ads">Ads ({ads.length})</TabsTrigger>
          <TabsTrigger value="analysis">Analysis ({analyses.length})</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="ads" className="space-y-4 mt-4">
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setMetaModalOpen(true)}>
              <Search className="h-4 w-4 mr-1" /> Search Meta Ads
            </Button>
            <Button size="sm" variant="outline" onClick={() => setManualModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Manual Ad
            </Button>
          </div>
          <AdGrid ads={ads} onDelete={handleDeleteAd} />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <RunAnalysisButton researchId={research.id} onComplete={handleAnalysisComplete} />
          </div>
          {analyses.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p>No analyses yet. Run your first analysis above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {analyses.map((a) => (
                <AnalysisPanel key={a.id} analysis={a} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Research Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                rows={12}
                placeholder="Add notes about this research topic..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <Button onClick={saveNotes} disabled={savingNotes} size="sm">
                {savingNotes && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                Save Notes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Edit Research</CardTitle>
            </CardHeader>
            <CardContent>
              <ResearchForm
                existing={research}
                onSuccess={() => router.refresh()}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <MetaSearchModal
        open={metaModalOpen}
        onClose={() => setMetaModalOpen(false)}
        researchId={research.id}
        onSaved={handleRefreshAds}
      />

      <Dialog open={manualModalOpen} onOpenChange={setManualModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Manual Ad</DialogTitle>
          </DialogHeader>
          <ManualImportForm
            researchId={research.id}
            onSuccess={() => {
              setManualModalOpen(false)
              handleRefreshAds()
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
