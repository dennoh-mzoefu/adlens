import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { runAnalysis } from '@/lib/claude'
import { z } from 'zod'

const Schema = z.object({
  researchId: z.string(),
  type: z.enum(['summary', 'comparison', 'sentiment', 'trend', 'competitive', 'custom']),
  compareWithResearchId: z.string().optional(),
  customPrompt: z.string().max(2000).optional(),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { researchId, type, compareWithResearchId, customPrompt } = parsed.data

  const research = await prisma.research.findFirst({
    where: { id: researchId, userId: session.user.id },
    include: { ads: { orderBy: { importedAt: 'desc' }, take: 50 } },
  })
  if (!research) {
    return NextResponse.json({ error: 'Research not found' }, { status: 404 })
  }
  if (research.ads.length === 0) {
    return NextResponse.json(
      { error: 'No ads found. Import some ads before running analysis.' },
      { status: 400 }
    )
  }

  let compareResearch = null
  if (compareWithResearchId) {
    compareResearch = await prisma.research.findFirst({
      where: { id: compareWithResearchId, userId: session.user.id },
      include: { ads: { orderBy: { importedAt: 'desc' }, take: 50 } },
    })
  }

  const content = await runAnalysis({
    type,
    researchTitle: research.title,
    researchType: research.type,
    ads: research.ads,
    compareResearchTitle: compareResearch?.title,
    compareAds: compareResearch?.ads,
    customPrompt,
  })

  const analysis = await prisma.analysis.create({
    data: {
      researchId,
      type,
      content,
      metadata: compareWithResearchId ? { comparedWith: compareWithResearchId } : undefined,
    },
  })

  return NextResponse.json({ analysis })
}
