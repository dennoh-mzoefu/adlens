'use client'

import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AdComparison } from '@/components/ads/AdComparison'
import { AnalysisPanel } from '@/components/analysis/AnalysisPanel'
import { Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import type { Ad, Analysis, ResearchWithCounts } from '@/types'

export function CompareClient({ research }: { research: ResearchWithCounts[] }) {
  const [topicAId, setTopicAId] = useState('')
  const [topicBId, setTopicBId] = useState('')
  const [adsA, setAdsA] = useState<Ad[]>([])
  const [adsB, setAdsB] = useState<Ad[]>([])
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loadingAds, setLoadingAds] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  const topicA = research.find((r) => r.id === topicAId) || null
  const topicB = research.find((r) => r.id === topicBId) || null

  async function loadAds(idA: string, idB: string) {
    if (!idA || !idB) return
    setLoadingAds(true)
    try {
      const [resA, resB] = await Promise.all([
        fetch(`/api/ads?researchId=${idA}&pageSize=50`),
        fetch(`/api/ads?researchId=${idB}&pageSize=50`),
      ])
      const [dataA, dataB] = await Promise.all([resA.json(), resB.json()])
      setAdsA(dataA.ads || [])
      setAdsB(dataB.ads || [])
      setAnalysis(null)
    } catch {
      toast.error('Failed to load ads')
    } finally {
      setLoadingAds(false)
    }
  }

  function handleSelectA(id: string | null) {
    if (!id) return
    setTopicAId(id)
    if (topicBId) loadAds(id, topicBId)
  }

  function handleSelectB(id: string | null) {
    if (!id) return
    setTopicBId(id)
    if (topicAId) loadAds(topicAId, id)
  }

  async function runComparison() {
    if (!topicAId || !topicBId) return
    setAnalyzing(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          researchId: topicAId,
          type: 'comparison',
          compareWithResearchId: topicBId,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Comparison failed')
      setAnalysis(data.analysis)
      toast.success('Comparison analysis complete')
    } catch (err: any) {
      toast.error(err.message || 'Comparison failed')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Topic A</label>
              <Select value={topicAId} onValueChange={handleSelectA}>
                <SelectTrigger>
                  <SelectValue placeholder="Select first topic" />
                </SelectTrigger>
                <SelectContent>
                  {research.filter((r) => r.id !== topicBId).map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.title} ({r._count.ads} ads)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Topic B</label>
              <Select value={topicBId} onValueChange={handleSelectB}>
                <SelectTrigger>
                  <SelectValue placeholder="Select second topic" />
                </SelectTrigger>
                <SelectContent>
                  {research.filter((r) => r.id !== topicAId).map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.title} ({r._count.ads} ads)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {topicAId && topicBId && (
            <div className="mt-4 flex justify-end">
              <Button onClick={runComparison} disabled={analyzing || loadingAds}>
                {analyzing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Run Comparison Analysis
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {loadingAds && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loadingAds && (adsA.length > 0 || adsB.length > 0) && (
        <AdComparison topicA={topicA} topicB={topicB} adsA={adsA} adsB={adsB} />
      )}

      {analysis && (
        <div>
          <h2 className="text-base font-semibold mb-3">Comparison Analysis</h2>
          <AnalysisPanel analysis={analysis} />
        </div>
      )}
    </div>
  )
}
