import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ResearchDetailClient } from './ResearchDetailClient'

export default async function ResearchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)
  const { id } = await params

  const research = await prisma.research.findFirst({
    where: { id, userId: session!.user.id },
    include: {
      ads: { orderBy: { importedAt: 'desc' } },
      analyses: { orderBy: { createdAt: 'desc' } },
      _count: { select: { ads: true, analyses: true } },
    },
  })

  if (!research) notFound()

  return <ResearchDetailClient research={research as any} />
}
