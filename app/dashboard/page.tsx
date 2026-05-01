import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ResearchCard } from '@/components/research/ResearchCard'
import { PlatformBreakdownChart } from '@/components/charts/PlatformBreakdownChart'
import { TokenWarning } from './TokenWarning'
import { Plus, Search, Upload, Database, TrendingUp, BarChart2, Layers } from 'lucide-react'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  const [researchList, allAds] = await Promise.all([
    prisma.research.findMany({
      where: { userId: session!.user.id, status: 'active' },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: {
        _count: { select: { ads: true, analyses: true } },
        ads: { distinct: ['platform'], select: { platform: true } },
      },
    }),
    prisma.ad.findMany({
      where: { research: { userId: session!.user.id } },
      select: { platform: true, source: true },
    }),
  ])

  const totalResearch = await prisma.research.count({
    where: { userId: session!.user.id },
  })
  const totalAds = allAds.length
  const metaAds = allAds.filter((a) => a.source === 'api').length
  const manualAds = allAds.filter((a) => a.source === 'manual').length

  const adsForChart = allAds.map((a) => ({ platform: a.platform })) as any

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/research/new">
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Research</Button>
          </Link>
        </div>
      </div>

      <TokenWarning />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Research Topics', value: totalResearch, icon: Database },
          { label: 'Total Ads', value: totalAds, icon: Layers },
          { label: 'Meta API Ads', value: metaAds, icon: TrendingUp },
          { label: 'Manual Imports', value: manualAds, icon: Upload },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-2xl font-bold">{value}</p>
                </div>
                <Icon className="h-8 w-8 text-muted-foreground/30" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-base font-semibold">Recent Research</h2>
          {researchList.length === 0 ? (
            <div className="border rounded-lg p-8 text-center text-muted-foreground">
              <p>No research yet.</p>
              <Link href="/research/new">
                <Button size="sm" className="mt-3">Create your first topic</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {researchList.map((r) => (
                <ResearchCard key={r.id} research={r as any} />
              ))}
            </div>
          )}
          <Link href="/research" className="text-sm text-primary hover:underline">
            View all research →
          </Link>
        </div>

        <div className="space-y-4">
          <h2 className="text-base font-semibold">Ads by Platform</h2>
          <Card>
            <CardContent className="pt-4">
              <PlatformBreakdownChart ads={adsForChart} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/research/new" className="block">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" /> New Research Topic
                </Button>
              </Link>
              <Link href="/research" className="block">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Search className="h-4 w-4 mr-2" /> Search Meta Ads
                </Button>
              </Link>
              <Link href="/tracker" className="block">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <BarChart2 className="h-4 w-4 mr-2" /> View Tracker
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
