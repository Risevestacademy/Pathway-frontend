import { describe, expect, it } from 'vitest'
import { careers } from './catalog.mock'
import { filterPublished, filterByTags, isLevelFit } from './catalog.utils'

describe('filterPublished', () => {
  it('excludes draft and retired careers', () => {
    const result = filterPublished(careers)
    expect(result.every((c) => c.status === 'published')).toBe(true)
  })
})

describe('filterByTags', () => {
  it('returns all careers when no terms are given', () => {
    expect(filterByTags(careers, [])).toEqual(careers)
  })

  it('matches tags case-insensitively', () => {
    const result = filterByTags(careers, ['JAVASCRIPT'])
    expect(result.some((c) => c.id === 'frontend-developer')).toBe(true)
  })

  it('returns nothing when no career matches', () => {
    expect(filterByTags(careers, ['marine biology'])).toEqual([])
  })
})

describe('isLevelFit', () => {
  const career = careers.find((c) => c.id === 'frontend-developer')!

  it('returns true when the career includes the level', () => {
    expect(isLevelFit(career, 'university-student')).toBe(true)
  })

  it('returns false when level is null', () => {
    expect(isLevelFit(career, null)).toBe(false)
  })
})