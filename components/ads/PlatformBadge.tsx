'use client'

import { Badge } from '@/components/ui/badge'

const PLATFORM_CONFIG: Record<string, { label: string; className: string }> = {
  meta: { label: 'Meta', className: 'bg-blue-600 text-white hover:bg-blue-700' },
  tiktok: { label: 'TikTok', className: 'bg-black text-white hover:bg-gray-900' },
  google: { label: 'Google', className: 'bg-green-600 text-white hover:bg-green-700' },
  youtube: { label: 'YouTube', className: 'bg-red-600 text-white hover:bg-red-700' },
  twitter: { label: 'X / Twitter', className: 'bg-sky-500 text-white hover:bg-sky-600' },
  linkedin: { label: 'LinkedIn', className: 'bg-blue-800 text-white hover:bg-blue-900' },
  other: { label: 'Other', className: 'bg-gray-500 text-white hover:bg-gray-600' },
}

export function PlatformBadge({ platform }: { platform: string }) {
  const config = PLATFORM_CONFIG[platform] ?? PLATFORM_CONFIG.other
  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  )
}
