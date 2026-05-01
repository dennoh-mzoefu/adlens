import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const ResearchSchema = z.object({
  title: z.string().min(1).max(200),
  type: z.enum(['product', 'service', 'brand', 'person', 'trend', 'event', 'other']),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || 'active'
  const type = searchParams.get('type')
  const q = searchParams.get('q')

  const where: any = { userId: session.user.id, status }
  if (type) where.type = type
  if (q) where.title = { contains: q, mode: 'insensitive' }

  const research = await prisma.research.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: { select: { ads: true, analyses: true } },
      ads: { distinct: ['platform'], select: { platform: true } },
    },
  })

  return NextResponse.json({ research })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = ResearchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const research = await prisma.research.create({
    data: { ...parsed.data, userId: session.user.id },
  })

  return NextResponse.json({ research }, { status: 201 })
}
