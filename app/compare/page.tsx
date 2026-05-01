import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CompareClient } from './CompareClient'

export default async function ComparePage() {
  const session = await getServerSession(authOptions)

  const research = await prisma.research.findMany({
    where: { userId: session!.user.id, status: 'active' },
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: { select: { ads: true, analyses: true } },
      ads: { distinct: ['platform'], select: { platform: true } },
    },
  })

  return (
    <div className="space-y-6 max-w-6xl">
      <h1 className="text-2xl font-bold">Compare Research Topics</h1>
      <CompareClient research={research as any} />
    </div>
  )
}
