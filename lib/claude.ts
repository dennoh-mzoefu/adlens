import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface AnalysisInput {
  type: 'summary' | 'comparison' | 'sentiment' | 'trend' | 'competitive' | 'custom'
  researchTitle: string
  researchType: string
  ads: any[]
  compareResearchTitle?: string
  compareAds?: any[]
  customPrompt?: string
}

const SYSTEM_PROMPT = `You are an expert advertising analyst and competitive intelligence specialist.
You analyze ad data pulled from Meta Ads Library and manually imported ads from TikTok, Google, and other platforms.
Always respond in clean, well-structured Markdown with clear section headers.
Be specific and insightful. Avoid generic observations. Name patterns directly. State opportunities clearly.
When data is limited, say so — do not invent conclusions.`

function formatAds(ads: any[]): string {
  return ads
    .slice(0, 30)
    .map(
      (ad, i) => `
Ad ${i + 1} [${ad.platform.toUpperCase()} — ${ad.source === 'api' ? 'Meta API' : 'Manual Import'}]
Advertiser: ${ad.advertiser}
Title: ${ad.adTitle || '—'}
Body: ${ad.adText || '—'}
CTA: ${ad.ctaText || '—'}
Running: ${ad.startDate ? new Date(ad.startDate).toLocaleDateString() : 'unknown'} → ${ad.endDate ? new Date(ad.endDate).toLocaleDateString() : 'present (active)'}
Region: ${ad.region || '—'}
Spend: ${ad.spend || '—'}
Impressions: ${ad.impressions || '—'}
Audience Size: ${ad.audienceSize || '—'}
Platforms: ${Array.isArray(ad.publisherPlatforms) ? ad.publisherPlatforms.join(', ') : ad.platform}
    `.trim()
    )
    .join('\n\n')
}

function buildPrompt(input: AnalysisInput): string {
  const adData = formatAds(input.ads)

  switch (input.type) {
    case 'summary':
      return `
Analyze these ${input.ads.length} ads for the research topic: "${input.researchTitle}" (category: ${input.researchType})

${adData}

Write a comprehensive analysis covering:

## 1. Overview
Who is advertising, what are they promoting, and on which platforms?

## 2. Key Messages & Value Propositions
What are the dominant themes and offers being pushed across these ads?

## 3. Target Audience Signals
Based on messaging, tone, and platforms chosen — who is clearly being targeted?

## 4. Creative Patterns
What formats (video, image, carousel), tones, and copywriting styles are most common?

## 5. Platform Strategy
How does the Meta strategy compare to any other platforms in this dataset?

## 6. Activity & Timeline
Any patterns in when ads were run? Bursts, campaigns, seasonality?

## 7. Key Takeaways
3–5 specific, actionable insights from this data.
      `.trim()

    case 'comparison':
      return `
Compare advertising for two research topics:

=== TOPIC A: "${input.researchTitle}" (${input.ads.length} ads) ===
${adData}

=== TOPIC B: "${input.compareResearchTitle}" (${input.compareAds?.length || 0} ads) ===
${formatAds(input.compareAds || [])}

Write a detailed comparison covering:

## 1. Overview
Brief summary of what each topic is and who is advertising.

## 2. Messaging & Positioning
How does each topic's advertising message differ? What value props are emphasized?

## 3. Platform & Channel Strategy
Where is each running ads? Any platform differences?

## 4. Creative Approach
Tone, format, and style differences.

## 5. Target Audience
Who does each appear to be targeting?

## 6. Activity Level
Which appears more active? Any spend/impression data available?

## 7. Strengths & Weaknesses
For each topic — what is working and what is missing?

## 8. Opportunities & Gaps
What could either advertiser do better based on what you see?
      `.trim()

    case 'sentiment':
      return `
Analyze the sentiment and emotional tone of these ${input.ads.length} ads for "${input.researchTitle}":

${adData}

Cover:

## 1. Overall Sentiment
Positive / Negative / Neutral / Mixed — explain your rating.

## 2. Emotional Triggers
What emotions are these ads designed to evoke? (Fear, aspiration, FOMO, humor, trust, etc.)

## 3. Tone Profile
Formal vs casual, urgent vs relaxed, aggressive vs soft — with examples from the ad copy.

## 4. Power Words & Language Patterns
Notable phrases, repeated words, and linguistic techniques used.

## 5. Sentiment by Platform
Does the tone shift between Meta, TikTok, Google, etc.?

## 6. Sentiment Score
Rate on a scale of 1–10 (1 = very negative, 10 = very positive) with reasoning.
      `.trim()

    case 'trend':
      return `
Analyze trends in these ${input.ads.length} ads for "${input.researchTitle}" over time:

${adData}

Cover:

## 1. Activity Timeline
When were ads most active? Any clear campaign periods or bursts of activity?

## 2. Message Evolution
Has the core message or offer changed across the date range shown?

## 3. Platform Shifts
Have they moved between platforms over time?

## 4. Creative Evolution
Any changes in style, format, or tone over time?

## 5. Trend Prediction
Based on the patterns observed, what would you expect to see from this advertiser next?
      `.trim()

    case 'competitive':
      return `
Provide a competitive intelligence report for "${input.researchTitle}" based on these ${input.ads.length} ads:

${adData}

Cover:

## 1. Market Positioning
How is this brand positioning itself? What space are they trying to own?

## 2. Competitive Advantages Being Promoted
What do they claim sets them apart from competitors?

## 3. Implied Target Segments
Who are they going after based on copy, platforms, and messaging?

## 4. Pricing & Offer Strategy
Any pricing signals, discounts, free trials, or promotional offers visible?

## 5. Weaknesses & Gaps
What are they NOT saying? What could a competitor exploit?

## 6. Recommendations
If you were a direct competitor, what would you do based on this intelligence?
      `.trim()

    case 'custom':
      return `
Research topic: "${input.researchTitle}" (category: ${input.researchType})
Total ads: ${input.ads.length}

Ad data:
${adData}

Task:
${input.customPrompt}
      `.trim()

    default:
      return `Analyze these ads for "${input.researchTitle}":\n\n${adData}`
  }
}

export async function runAnalysis(input: AnalysisInput): Promise<string> {
  const prompt = buildPrompt(input)

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2500,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}
