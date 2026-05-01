'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { format, eachDayOfInterval, subDays, startOfDay } from 'date-fns'
import type { Ad } from '@/types'

export function AdTrendChart({ ads }: { ads: Ad[] }) {
  const days = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() })

  const data = days.map((day) => {
    const dayStr = format(day, 'MMM d')
    const count = ads.filter((ad) => {
      const imported = startOfDay(new Date(ad.importedAt))
      return imported.getTime() === startOfDay(day).getTime()
    }).length
    return { date: dayStr, count }
  })

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          tickLine={false}
          interval={4}
          className="text-muted-foreground"
        />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} className="text-muted-foreground" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
            fontSize: '12px',
          }}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
          name="Ads Imported"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
