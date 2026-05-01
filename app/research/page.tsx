import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ResearchGrid } from '@/components/research/ResearchGrid'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

const TYPES = ['product', 'service', 'brand', 'person', 'trend', 'event', 'other']

interface SearchParams {
  type?: string
  q?: string
  status?: string
}

export default async function ResearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const session = await getServerSession(authOptions)
  const sp = await searchParams

  const where: any = {
    userId: session!.user.id,
    status: sp.status || 'active',
  }
  if (sp.type) where.type = sp.type
  if (sp.q) where.title = { contains: sp.q, mode: 'insensitive' }

  const research = await prisma.research.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: { select: { ads: true, analyses: true } },
      ads: { distinct: ['platform'], select: { platform: true } },
    },
  })

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Research Topics</h1>
        <Link href="/research/new">
          <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Research</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <form method="get" className="flex gap-2 w-full md:w-auto">
          <input
            name="q"
            defaultValue={sp.q || ''}
            placeholder="Search..."
            className="border rounded-md px-3 py-1.5 text-sm flex-1 md:w-48 bg-background"
          />
          <Button type="submit" size="sm" variant="outline">Search</Button>
        </form>

        <div className="flex flex-wrap gap-1">
          <Link href="/research">
            <Button variant={!sp.type ? 'default' : 'outline'} size="sm" className="h-8 text-xs">
              All
            </Button>
          </Link>
          {TYPES.map((t) => (
            <Link key={t} href={`/research?type=${t}`}>
              <Button
                variant={sp.type === t ? 'default' : 'outline'}
                size="sm"
                className="h-8 text-xs capitalize"
              >
                {t}
              </Button>
            </Link>
          ))}
        </div>

        <div className="flex gap-1 ml-auto">
          <Link href="/research?status=active">
            <Button variant={sp.status !== 'archived' ? 'default' : 'outline'} size="sm" className="h-8 text-xs">
              Active
            </Button>
          </Link>
          <Link href="/research?status=archived">
            <Button variant={sp.status === 'archived' ? 'default' : 'outline'} size="sm" className="h-8 text-xs">
              Archived
            </Button>
          </Link>
        </div>
      </div>

      <ResearchGrid research={research as any} />
    </div>
  )
}
