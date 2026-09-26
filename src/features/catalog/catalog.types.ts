export type ContentStatus = 'draft' | 'published' | 'retired'

export type CareerLevel = 'university-student' | 'recent-graduate' | 'early-career'

export const CAREER_LEVELS: { id: CareerLevel; label: string; blurb: string }[] = [
  { id: 'university-student', label: 'University student', blurb: 'Currently studying and exploring options' },
  { id: 'recent-graduate', label: 'Recent graduate', blurb: 'Finished studies within the last couple of years' },
  { id: 'early-career', label: 'Early-career professional', blurb: 'A few years into work and looking ahead' },
]

export interface StatMeta {
  id: string
  source: string
  period: string
  geography: string
  meaning: string
}

export type PayPeriod = 'year' | 'month' | 'hour'
export type ExperienceScope = 'entry-level' | 'mid-career' | 'senior'
export type PayBasis = 'gross' | 'net' | 'unspecified'

interface SalaryMeta extends StatMeta {
  currency: string
  payPeriod: PayPeriod
  experienceLevel?: ExperienceScope
  basis: PayBasis
}

export interface SalaryMedianStat extends SalaryMeta {
  kind: 'salary-median'
  value: number | null
}

export interface SalaryRangeStat extends SalaryMeta {
  kind: 'salary-range'
  low: { label: string; value: number | null }
  high: { label: string; value: number | null }
}

export interface ProjectionStat extends StatMeta {
  kind: 'employment-projection'
  value: number | null
  series?: { label: string; value: number }[]
  seriesUnit?: string
}

export interface DemandStat extends StatMeta {
  kind: 'demand'
  value: 'Low' | 'Moderate' | 'High' | 'Very high' | null
}

export type SalaryStat = SalaryMedianStat | SalaryRangeStat
export type OutlookStat = ProjectionStat | DemandStat
export type Statistic = SalaryStat | OutlookStat

export interface EntryConsideration {
  label: string
  detail: string
}

export interface Career {
  id: string
  status: ContentStatus
  title: string
  description: string
  levels: CareerLevel[]
  tags: string[]
  roleSummary: string
  workActivities: string[]
  entryConsiderations: EntryConsideration[]
  roadmapId: string | null
  stats: Statistic[]
}

export interface SessionProfile {
  level: CareerLevel | null
  education: { degree: string; field: string }
  experience: { years: string; internships: string }
  skills: string[]
  interests: string[]
}