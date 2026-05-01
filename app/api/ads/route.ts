import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const ManualAdSchema = z.object({
  researchId: z.string(),
  platform: z.enum(['meta', 'tiktok', 'google', 'youtube', 'twitter', 'linkedin', 'other']),
  advertiser: z.string().min(1).max(200),
  adTitle: z.string().max(300).optional(),
  adText: z.string().max(5000).optional(),
  ctaText: z.string().max(100).optional(),
  mediaUrl: z.string().url().optional().or(z.literal('')),
  mediaType: z.enum(['image', 'video', 'carousel']).optional(),
  targetUrl: z.string().url().optional().or(z.literal('')),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  region: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = ManualAdSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const research = await prisma.research.findFirst({
    where: { id: parsed.data.researchId, userId: session.user.id },
  })
  if (!research) {
    return NextResponse.json({ error: 'Research not found' }, { status: 404 })
  }

  const ad = await prisma.ad.create({
    data: {
      researchId: parsed.data.researchId,
      platform: parsed.data.platform,
      advertiser: parsed.data.advertiser,
      adTitle: parsed.data.adTitle || null,
      adText: parsed.data.adText || null,
      ctaText: parsed.data.ctaText || null,
      mediaUrl: parsed.data.mediaUrl || null,
      mediaType: parsed.data.mediaType || null,
      targetUrl: parsed.data.targetUrl || null,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      region: parsed.data.region || null,
      source: 'manual',
      rawData: { notes: parsed.data.notes },
    },
  })

  return NextResponse.json({ ad }, { status: 201 })
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const researchId = searchParams.get('researchId')
  const platform = searchParams.get('platform')
  const source = searchParams.get('source')
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')

  const where: any = { research: { userId: session.user.id } }
  if (researchId) where.researchId = researchId
  if (platform) where.platform = platform
  if (source) where.source = source

  const [ads, total] = await Promise.all([
    prisma.ad.findMany({
      where,
      orderBy: { importedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.ad.count({ where }),
  ])

  return NextResponse.json({ ads, total, page, pageSize })
}
