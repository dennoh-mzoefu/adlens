'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Loader2, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { Research } from '@/types'

const RESEARCH_TYPES = ['product', 'service', 'brand', 'person', 'trend', 'event', 'other']

interface ResearchFormProps {
  existing?: Research
  onSuccess?: (research: Research) => void
}

export function ResearchForm({ existing, onSuccess }: ResearchFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [form, setForm] = useState({
    title: existing?.title || '',
    type: existing?.type || '',
    description: existing?.description || '',
    notes: existing?.notes || '',
    tags: existing?.tags || [] as string[],
  })

  function setField(key: keyof typeof form, value: any) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function addTag() {
    const tag = tagInput.trim()
    if (!tag || form.tags.includes(tag)) return
    setField('tags', [...form.tags, tag])
    setTagInput('')
  }

  function removeTag(tag: string) {
    setField('tags', form.tags.filter((t) => t !== tag))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.type) {
      toast.error('Title and type are required')
      return
    }
    setLoading(true)
    try {
      const url = existing ? `/api/research/${existing.id}` : '/api/research'
      const method = existing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')

      toast.success(existing ? 'Research updated' : 'Research created')
      if (onSuccess) {
        onSuccess(data.research)
      } else {
        router.push(`/research/${data.research.id}`)
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Title *</Label>
          <Input
            placeholder="e.g. Nike Air Max, ChatGPT, Bolt Kenya"
            value={form.title}
            onChange={(e) => setField('title', e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Type *</Label>
          <Select value={form.type} onValueChange={(v) => setField('type', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {RESEARCH_TYPES.map((t) => (
                <SelectItem key={t} value={t} className="capitalize">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea
          rows={3}
          placeholder="What is this research about?"
          value={form.description}
          onChange={(e) => setField('description', e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add tag and press Enter"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); addTag() }
            }}
          />
          <Button type="button" variant="outline" onClick={addTag}>Add</Button>
        </div>
        {form.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {form.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button type="button" onClick={() => removeTag(tag)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Notes</Label>
        <Textarea
          rows={3}
          placeholder="Internal notes about this research topic"
          value={form.notes}
          onChange={(e) => setField('notes', e.target.value)}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {existing ? 'Update Research' : 'Create Research'}
      </Button>
    </form>
  )
}
