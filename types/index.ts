import type { Ad, Analysis, Research, ResearchType, Platform, AdSource, AnalysisType } from '@prisma/client'

export type { Ad, Analysis, Research, ResearchType, Platform, AdSource, AnalysisType }

export interface ResearchWithCounts {
  id: string
  userId: string
  title: string
  type: ResearchType
  description: string | null
  tags: string[]
  notes: string | null
  status: string
  createdAt: Date
  updatedAt: Date
  _count: { ads: number; analyses: number }
  ads: Array<{ platform: Platform }>
  analyses?: Analysis[]
}

export interface AdWithResearch extends Ad {
  research: { title: string }
}

export interface AnalysisWithResearch extends Analysis {
  research: { title: string }
}

// NextAuth session extension
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
