import { MetaSearchParams, MetaApiResponse, MetaAdRaw } from './types'

const BASE_URL = `https://graph.facebook.com/${process.env.META_API_VERSION}`

const ALL_FIELDS = [
  'id',
  'ad_creation_time',
  'ad_creative_bodies',
  'ad_creative_link_captions',
  'ad_creative_link_descriptions',
  'ad_creative_link_titles',
  'ad_delivery_start_time',
  'ad_delivery_stop_time',
  'ad_snapshot_url',
  'ad_status',
  'bylines',
  'currency',
  'funding_entity',
  'impressions',
  'spend',
  'page_id',
  'page_name',
  'publisher_platforms',
  'region_distribution',
  'demographic_distribution',
  'languages',
  'estimated_audience_size',
].join(',')

export async function searchMetaAds(params: MetaSearchParams): Promise<MetaApiResponse> {
  const url = new URL(`${BASE_URL}/ads_archive`)

  url.searchParams.set('access_token', process.env.META_ACCESS_TOKEN!)
  url.searchParams.set('fields', ALL_FIELDS)
  url.searchParams.set('ad_type', params.adType || 'ALL')
  url.searchParams.set('ad_active_status', params.adActiveStatus || 'ALL')

  if (params.searchTerm) url.searchParams.set('search_terms', params.searchTerm)
  if (params.pageIds?.length) url.searchParams.set('search_page_ids', JSON.stringify(params.pageIds))

  const countries = params.countries?.length ? params.countries : ['US', 'KE', 'GB']
  url.searchParams.set('ad_reached_countries', JSON.stringify(countries))

  if (params.deliveryDateMin) url.searchParams.set('ad_delivery_date_min', params.deliveryDateMin)
  if (params.deliveryDateMax) url.searchParams.set('ad_delivery_date_max', params.deliveryDateMax)

  url.searchParams.set('limit', String(Math.min(params.limit || 25, 1000)))

  if (params.after) url.searchParams.set('after', params.after)

  const response = await fetch(url.toString(), { next: { revalidate: 0 } })
  const data: MetaApiResponse = await response.json()

  if (data.error) {
    throw new MetaApiError(data.error.message, data.error.code, data.error.error_subcode)
  }

  return data
}

export async function searchMetaAdsAllPages(
  params: MetaSearchParams,
  maxAds = 200
): Promise<MetaAdRaw[]> {
  const allAds: MetaAdRaw[] = []
  let cursor: string | undefined
  let fetched = 0

  do {
    const response = await searchMetaAds({
      ...params,
      after: cursor,
      limit: Math.min(100, maxAds - fetched),
    })

    allAds.push(...response.data)
    fetched += response.data.length

    cursor = response.paging?.cursors?.after
    const hasMore = !!response.paging?.next

    if (!hasMore || fetched >= maxAds) break

    await new Promise((r) => setTimeout(r, 500))
  } while (cursor)

  return allAds.slice(0, maxAds)
}

export async function getMetaAdById(adId: string): Promise<MetaAdRaw> {
  const url = new URL(`${BASE_URL}/${adId}`)
  url.searchParams.set('access_token', process.env.META_ACCESS_TOKEN!)
  url.searchParams.set('fields', ALL_FIELDS)

  const response = await fetch(url.toString())
  const data = await response.json()

  if (data.error) throw new MetaApiError(data.error.message, data.error.code)

  return data
}

export async function validateMetaToken(): Promise<{
  valid: boolean
  expiresAt: number | null
  daysUntilExpiry: number | null
  scopes: string[]
  error?: string
}> {
  const url = new URL(`${BASE_URL}/debug_token`)
  url.searchParams.set('input_token', process.env.META_ACCESS_TOKEN!)
  url.searchParams.set('access_token', `${process.env.META_APP_ID}|${process.env.META_APP_SECRET}`)

  const response = await fetch(url.toString())
  const data = await response.json()

  if (data.error || !data.data?.is_valid) {
    return {
      valid: false,
      expiresAt: null,
      daysUntilExpiry: null,
      scopes: [],
      error: data.error?.message || 'Token is invalid',
    }
  }

  const expiresAt = data.data.expires_at || null
  const daysUntilExpiry = expiresAt
    ? Math.floor((expiresAt * 1000 - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return { valid: true, expiresAt, daysUntilExpiry, scopes: data.data.scopes || [] }
}

export class MetaApiError extends Error {
  constructor(
    message: string,
    public code: number,
    public subcode?: number
  ) {
    super(message)
    this.name = 'MetaApiError'
  }
}
