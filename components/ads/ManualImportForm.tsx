'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ManualImportFormProps {
  researchId: string
  onSuccess?: () => void
}

export function ManualImportForm({ researchId, onSuccess }: ManualImportFormProps) {
  const [loading, setLoading] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [form, setForm] = useState({
    platform: '',
    advertiser: '',
    adTitle: '',
    adText: '',
    ctaText: '',
    mediaUrl: '',
    mediaType: '',
    targetUrl: '',
    startDate: '',
    endDate: '',
    region: '',
    notes: '',
  })

  function setField(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleParsePaste() {
    if (!pasteText.trim()) return
    setParsing(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          researchId,
          type: 'custom',
          customPrompt: `Parse this raw ad text and extract the following fields as a JSON object:
platform (one of: meta, tiktok, google, youtube, twitter, linkedin, other),
advertiser, adTitle, adText, ctaText, mediaUrl, targetUrl, startDate (YYYY-MM-DD), endDate (YYYY-MM-DD), region.
Return ONLY a valid JSON object with these exact keys, no other text.

Raw ad text:
${pasteText}`,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const text = data.analysis?.content || ''
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        setForm((f) => ({ ...f, ...parsed }))
        toast.success('Fields auto-filled from paste')
      }
    } catch {
      toast.error('Could not parse the pasted text')
    } finally {
      setParsing(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.platform || !form.advertiser) {
      toast.error('Platform and Advertiser are required')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, researchId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save ad')
      toast.success('Ad added successfully')
      setForm({
        platform: '', advertiser: '', adTitle: '', adText: '', ctaText: '',
        mediaUrl: '', mediaType: '', targetUrl: '', startDate: '', endDate: '',
        region: '', notes: '',
      })
      onSuccess?.()
    } catch (err: any) {
      toast.error(err.message || 'Failed to save ad')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Tabs defaultValue="form">
      <TabsList className="mb-4">
        <TabsTrigger value="form">Fill Form</TabsTrigger>
        <TabsTrigger value="paste">Paste & Parse</TabsTrigger>
      </TabsList>

      <TabsContent value="paste" className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Paste raw text from a TikTok, Google, or any other ad. Claude will auto-fill the form fields.
        </p>
        <Textarea
          rows={8}
          placeholder="Paste the ad copy, metadata, or any descriptive text here..."
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
        />
        <Button onClick={handleParsePaste} disabled={parsing || !pasteText.trim()}>
          {parsing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Parse with Claude
        </Button>
        {form.advertiser && (
          <p className="text-xs text-green-600">
            Fields filled — switch to "Fill Form" tab to review and submit.
          </p>
        )}
      </TabsContent>

      <TabsContent value="form">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Platform *</Label>
              <Select value={form.platform} onValueChange={(v) => v && setField('platform', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="twitter">X / Twitter</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="meta">Meta</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Advertiser *</Label>
              <Input
                placeholder="Brand or person running the ad"
                value={form.advertiser}
                onChange={(e) => setField('advertiser', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Ad Title</Label>
              <Input
                placeholder="Headline"
                value={form.adTitle}
                onChange={(e) => setField('adTitle', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Call to Action</Label>
              <Input
                placeholder="e.g. Shop Now, Learn More"
                value={form.ctaText}
                onChange={(e) => setField('ctaText', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Ad Body Text</Label>
            <Textarea
              rows={4}
              placeholder="Main copy of the ad"
              value={form.adText}
              onChange={(e) => setField('adText', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Media URL</Label>
              <Input
                placeholder="Link to image or video"
                value={form.mediaUrl}
                onChange={(e) => setField('mediaUrl', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Media Type</Label>
              <Select value={form.mediaType} onValueChange={(v) => v && setField('mediaType', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="carousel">Carousel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Destination URL</Label>
              <Input
                placeholder="Where the ad links to"
                value={form.targetUrl}
                onChange={(e) => setField('targetUrl', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Region / Country</Label>
              <Input
                placeholder="e.g. Kenya, US, Global"
                value={form.region}
                onChange={(e) => setField('region', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => setField('startDate', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>End Date</Label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => setField('endDate', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea
              rows={2}
              placeholder="Personal notes about this ad"
              value={form.notes}
              onChange={(e) => setField('notes', e.target.value)}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Ad
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  )
}
