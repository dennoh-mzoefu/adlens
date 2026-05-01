import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { searchMetaAds, searchMetaAdsAllPages, MetaApiError } from '@/lib/meta/api'
import { transformMetaAds, metaAdToPrismaInput } from '@/lib/meta/transform'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const Schema = z.object({
  searchTerm: z.string().min(1).max(200).optional(),
  pageIds: z.array(z.string()).optional(),
  adType: z
    .enum(['ALL', 'POLITICAL_AND_ISSUE_ADS', 'HOUSING_ADS', 'EMPLOYMENT_ADS', 'CREDIT_ADS'])
    .default('ALL'),
  adActiveStatus: z.enum(['ALL', 'ACTIVE', 'INACTIVE']).default('ALL'),
  countries: z.array(z.string().length(2)).default(['US', 'KE', 'GB']),
  deliveryDateMin: z.string().optional(),
  deliveryDateMax: z.string().optional(),
  limit: z.number().min(1).max(1000).default(25),
  after: z.string().optional(),
  fetchAllPages: z.boolean().default(false),
  maxAds: z.number().min(1).max(500).default(100),
  researchId: z.string().optional(),
  autoSave: z.boolean().default(false),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = Schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const {
      searchTerm, pageIds, adType, adActiveStatus, countries,
      deliveryDateMin, deliveryDateMax, limit, after,
      fetchAllPages, maxAds, researchId, autoSave,
    } = parsed.data

    if (!searchTerm && (!pageIds || pageIds.length === 0)) {
      return NextResponse.json(
        { error: 'Provide searchTerm or at least one pageId' },
        { status: 400 }
      )
    }

    let rawAds
    if (fetchAllPages) {
      rawAds = await searchMetaAdsAllPages(
        { searchTerm, pageIds, adType, adActiveStatus, countries, deliveryDateMin, deliveryDateMax },
        maxAds
      )
    } else {
      const res = await searchMetaAds({
        searchTerm, pageIds, adType, adActiveStatus, countries,
        deliveryDateMin, deliveryDateMax, limit, after,
      })
      rawAds = res.data
    }

    const transformed = transformMetaAds(rawAds)

    let savedCount = 0
    if (researchId && autoSave) {
      const research = await prisma.research.findFirst({
        where: { id: researchId, userId: session.user.id },
      })
      if (!research) {
        return NextResponse.json({ error: 'Research not found' }, { status: 404 })
      }

      for (const ad of transformed) {
        await prisma.ad.upsert({
          where: { externalId_researchId: { externalId: ad.externalId, researchId } },
          create: metaAdToPrismaInput(ad, researchId),
          update: {
            adText: ad.adText,
            adTitle: ad.adTitle,
            endDate: ad.endDate,
            spend: ad.spend,
            impressions: ad.impressions,
            rawData: ad.rawData as any,
          },
        })
        savedCount++
      }
    }

    return NextResponse.json({
      ads: transformed,
      total: transformed.length,
      savedCount,
      hasMore: !fetchAllPages && rawAds.length === limit,
    })
  } catch (err: any) {
    if (err instanceof MetaApiError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 502 })
    }
    console.error('[meta/search]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
