export interface MetaAdRaw {
  [key: string]: unknown
  id: string
  ad_creation_time?: string
  ad_creative_bodies?: string[]
  ad_creative_link_captions?: string[]
  ad_creative_link_descriptions?: string[]
  ad_creative_link_titles?: string[]
  ad_delivery_start_time?: string
  ad_delivery_stop_time?: string
  ad_snapshot_url?: string
  ad_status?: 'ACTIVE' | 'INACTIVE'
  bylines?: string
  currency?: string
  funding_entity?: string
  impressions?: { lower_bound: string; upper_bound: string }
  spend?: { lower_bound: string; upper_bound: string }
  page_id?: string
  page_name?: string
  publisher_platforms?: string[]
  region_distribution?: Array<{ region: string; percentage: number }>
  demographic_distribution?: Array<{ age: string; gender: string; percentage: number }>
  languages?: string[]
  estimated_audience_size?: { lower_bound: string; upper_bound: string }
}

export interface MetaApiResponse {
  data: MetaAdRaw[]
  paging?: {
    cursors: { before: string; after: string }
    next?: string
  }
  error?: {
    message: string
    type: string
    code: number
    error_subcode?: number
    fbtrace_id: string
  }
}

export interface MetaSearchParams {
  searchTerm?: string
  pageIds?: string[]
  adType?: 'ALL' | 'POLITICAL_AND_ISSUE_ADS' | 'HOUSING_ADS' | 'EMPLOYMENT_ADS' | 'CREDIT_ADS'
  adActiveStatus?: 'ALL' | 'ACTIVE' | 'INACTIVE'
  countries?: string[]
  deliveryDateMin?: string
  deliveryDateMax?: string
  limit?: number
  after?: string
}

export interface MetaAdTransformed {
  externalId: string
  platform: 'meta'
  advertiser: string
  advertiserId: string
  adText: string | null
  adTitle: string | null
  adDescription: string | null
  ctaText: string | null
  snapshotUrl: string | null
  status: 'ACTIVE' | 'INACTIVE'
  publisherPlatforms: string[]
  startDate: Date | null
  endDate: Date | null
  spend: string | null
  impressions: string | null
  estimatedAudienceSize: string | null
  regions: Array<{ region: string; percentage: number }>
  languages: string[]
  rawData: MetaAdRaw
}
