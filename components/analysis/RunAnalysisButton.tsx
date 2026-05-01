'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ChevronDown, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import type { Analysis } from '@/types'

const ANALYSIS_TYPES = [
  { value: 'summary', label: 'Summary' },
  { value: 'sentiment', label: 'Sentiment Analysis' },
  { value: 'trend', label: 'Trend Analysis' },
  { value: 'competitive', label: 'Competitive Intel' },
  { value: 'custom', label: 'Custom Prompt…' },
]

interface RunAnalysisButtonProps {
  researchId: string
  onComplete?: (analysis: Analysis) => void
}

export function RunAnalysisButton({ researchId, onComplete }: RunAnalysisButtonProps) {
  const [loading, setLoading] = useState(false)
  const [customOpen, setCustomOpen] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')

  async function runAnalysis(type: string, prompt?: string) {
    setLoading(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          researchId,
          type,
          ...(prompt ? { customPrompt: prompt } : {}),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      toast.success('Analysis complete')
      onComplete?.(data.analysis)
    } catch (err: any) {
      toast.error(err.message || 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleCustomSubmit() {
    if (!customPrompt.trim()) return
    setCustomOpen(false)
    await runAnalysis('custom', customPrompt)
    setCustomPrompt('')
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger disabled={loading} className="group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-primary text-primary-foreground bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none h-8 gap-1.5 px-2.5 disabled:pointer-events-none disabled:opacity-50">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Run Analysis
          <ChevronDown className="h-3.5 w-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {ANALYSIS_TYPES.map((t) => (
            <DropdownMenuItem
              key={t.value}
              onClick={() => {
                if (t.value === 'custom') {
                  setCustomOpen(true)
                } else {
                  runAnalysis(t.value)
                }
              }}
            >
              {t.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={customOpen} onOpenChange={setCustomOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Custom Analysis Prompt</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>What would you like Claude to analyze?</Label>
            <Textarea
              rows={5}
              placeholder="e.g. Identify which ads use urgency tactics and suggest 3 headlines we could test..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
            />
            <Button onClick={handleCustomSubmit} disabled={!customPrompt.trim()} className="w-full">
              Run Custom Analysis
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
