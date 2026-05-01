'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { Ad } from '@/types'

const COLORS = ['#2563eb', '#000000', '#16a34a', '#dc2626', '#0ea5e9', '#1e40af', '#6b7280']
const PLATFORM_LABELS: Record<string, string> = {
  meta: 'Meta',
  tiktok: 'TikTok',
  google: 'Google',
  youtube: 'YouTube',
  twitter: 'X/Twitter',
  linkedin: 'LinkedIn',
  other: 'Other',
}

export function PlatformBreakdownChart({ ads }: { ads: Ad[] }) {
  const counts: Record<string, number> = {}
  for (const ad of ads) {
    counts[ad.platform] = (counts[ad.platform] || 0) + 1
  }

  const data = Object.entries(counts).map(([platform, count]) => ({
    name: PLATFORM_LABELS[platform] || platform,
    value: count,
  }))

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
        No data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
            fontSize: '12px',
          }}
        />
        <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
