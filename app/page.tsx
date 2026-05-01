import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LineChart, Search, Sparkles, BarChart3 } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
            <LineChart className="h-4 w-4" />
            AdLens
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Ad Intelligence,<br />Powered by AI
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Track ads from Meta, TikTok, Google, and more. Get Claude AI analysis on messaging,
            sentiment, and competitive positioning — all in one place.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/login">
            <Button size="lg" className="w-full sm:w-auto">Get Started</Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">Go to Dashboard</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          {[
            { icon: Search, title: 'Meta Ads Library', desc: 'Pull real ads automatically via the official API' },
            { icon: BarChart3, title: 'Multi-Platform', desc: 'Import TikTok, Google, YouTube ads manually' },
            { icon: Sparkles, title: 'Claude Analysis', desc: 'AI-powered insights on messaging, tone & strategy' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-4 border rounded-lg text-left space-y-2">
              <Icon className="h-5 w-5 text-primary" />
              <p className="font-semibold text-sm">{title}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
