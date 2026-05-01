import { MetaAdRaw, MetaAdTransformed } from './types'

export function transformMetaAd(raw: MetaAdRaw): MetaAdTransformed {
  const adText = raw.ad_creative_bodies?.join('\n\n---\n\n') || null
  const adTitle = raw.ad_creative_link_titles?.[0] || null
  const adDescription = raw.ad_creative_link_descriptions?.[0] || null
  const ctaText = raw.ad_creative_link_captions?.[0] || null

  const spend = raw.spend
    ? `${raw.currency || 'USD'} ${raw.spend.lower_bound}–${raw.spend.upper_bound}`
    : null

  const impressions = raw.impressions
    ? `${raw.impressions.lower_bound}–${raw.impressions.upper_bound}`
    : null

  const estimatedAudienceSize = raw.estimated_audience_size
    ? `${raw.estimated_audience_size.lower_bound}–${raw.estimated_audience_size.upper_bound}`
    : null

  return {
    externalId: raw.id,
    platform: 'meta',
    advertiser: raw.page_name || 'Unknown Advertiser',
    advertiserId: raw.page_id || '',
    adText,
    adTitle,
    adDescription,
    ctaText,
    snapshotUrl: raw.ad_snapshot_url || null,
    status: raw.ad_status || 'ACTIVE',
    publisherPlatforms: raw.publisher_platforms || [],
    startDate: raw.ad_delivery_start_time ? new Date(raw.ad_delivery_start_time) : null,
    endDate: raw.ad_delivery_stop_time ? new Date(raw.ad_delivery_stop_time) : null,
    spend,
    impressions,
    estimatedAudienceSize,
    regions: raw.region_distribution || [],
    languages: raw.languages || [],
    rawData: raw,
  }
}

export function transformMetaAds(raws: MetaAdRaw[]): MetaAdTransformed[] {
  return raws.map(transformMetaAd)
}

export function metaAdToPrismaInput(ad: MetaAdTransformed, researchId: string) {
  return {
    researchId,
    platform: 'meta' as const,
    advertiser: ad.advertiser,
    adTitle: ad.adTitle,
    adText: ad.adText,
    ctaText: ad.ctaText,
    mediaUrl: ad.snapshotUrl,
    startDate: ad.startDate,
    endDate: ad.endDate,
    spend: ad.spend,
    impressions: ad.impressions,
    audienceSize: ad.estimatedAudienceSize,
    externalId: ad.externalId,
    snapshotUrl: ad.snapshotUrl,
    publisherPlatforms: ad.publisherPlatforms,
    source: 'api' as const,
    rawData: ad.rawData as any,
  }
}
