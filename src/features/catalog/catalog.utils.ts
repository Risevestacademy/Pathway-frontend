import type { Career, CareerLevel } from './catalog.types'

export function filterPublished(careers: Career[]): Career[] {
  return careers.filter((c) => c.status === 'published')
}

export function filterByTags(careers: Career[], terms: string[]): Career[] {
  if (terms.length === 0) return careers
  const lowerTerms = terms.map((t) => t.toLowerCase())
  return careers.filter((c) =>
    c.tags.some((tag) => lowerTerms.includes(tag.toLowerCase())),
  )
}

export function isLevelFit(career: Career, level: CareerLevel | null): boolean {
  return level ? career.levels.includes(level) : false
}