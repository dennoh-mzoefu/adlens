import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AdCard } from '@/components/ads/AdCard'
import { AdTrendChart } from '@/components/charts/AdTrendChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function TrackerPage() {
  const session = await getServerSession(authOptions)

  const ads = await prisma.ad.findMany({
    where: { research: { userId: session!.user.id } },
    orderBy: { importedAt: 'desc' },
    take: 100,
    include: { research: { select: { title: true } } },
  })

  return (
    <div className="space-y-6 max-w-6xl">
      <h1 className="text-2xl font-bold">Ad Tracker</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Ads Imported — Last 30 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <AdTrendChart ads={ads as any} />
        </CardContent>
      </Card>

      <div>
        <h2 className="text-base font-semibold mb-4">All Ads ({ads.length})</h2>
        {ads.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>No ads tracked yet. Start by searching Meta Ads or adding one manually.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {ads.map((ad) => (
              <div key={ad.id}>
                <p className="text-xs text-muted-foreground mb-1.5">
                  Research: {(ad as any).research.title}
                </p>
                <AdCard ad={ad as any} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
