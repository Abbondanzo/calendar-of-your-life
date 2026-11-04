import { describe, expect, it } from 'vitest'
import { parseISODate } from './life'
import {
  companionSpan,
  normalizeCompanion,
  theirWeekOn,
  togetherStats,
  validateCompanion,
} from './companion'

const d = (s: string) => parseISODate(s)!
const birth = d('2000-01-01')

describe('companionSpan', () => {
  it('starts at their birth week when they are younger', () => {
    const span = companionSpan(birth, 90, {
      name: 'Kid',
      birthday: '2030-01-01',
      lifeExpectancy: 80,
    })!
    expect(span.start).toBe(30 * 52)
    expect(span.birthIndex).toBe(30 * 52)
    // Their 80 years run past the end of a 90-row grid
    expect(span.end).toBe(90 * 52)
  })

  it('starts at your birth when they are older, and ends with them', () => {
    const span = companionSpan(birth, 90, {
      name: 'Parent',
      birthday: '1970-01-01',
      lifeExpectancy: 80,
    })!
    expect(span).toEqual({ start: 0, end: 50 * 52, birthIndex: null })
  })

  it('is null when their life ends before yours begins', () => {
    expect(
      companionSpan(birth, 90, {
        name: 'Ancestor',
        birthday: '1900-01-01',
        lifeExpectancy: 70,
      }),
    ).toBeNull()
  })
})

describe('togetherStats', () => {
  it('splits shared weeks into lived and ahead, within your lifespan', () => {
    const companion = {
      name: 'Sam',
      birthday: '2001-01-01',
      lifeExpectancy: 100,
    }
    const span = companionSpan(birth, 80, companion)!
    const today = d('2026-01-01')
    const current = 26 * 52
    const together = togetherStats(span, current, 80, companion, today)
    expect(together.lived).toBe(current - span.start)
    expect(together.ahead).toBe(80 * 52 - current)
    expect(together.theirAge).toBe(25)
  })
})

describe('theirWeekOn', () => {
  it('gives their age and week, or null outside their life', () => {
    const sam = { name: 'Sam', birthday: '2001-01-01', lifeExpectancy: 80 }
    expect(theirWeekOn(sam, d('2001-01-15'))).toMatchObject({
      age: 0,
      week: 2,
    })
    expect(theirWeekOn(sam, d('2000-06-01'))).toBeNull()
    expect(theirWeekOn(sam, d('2090-01-01'))).toBeNull()
  })
})

describe('validation', () => {
  it('needs a name and a birthdate', () => {
    expect(validateCompanion('', '2000-01-01')).toMatch(/name/)
    expect(validateCompanion('Sam', '')).toMatch(/birthdate/)
    expect(validateCompanion('Sam', '2030-05-01')).toBeNull()
  })

  it('normalizes saved values', () => {
    expect(normalizeCompanion(null)).toBeNull()
    expect(normalizeCompanion({ name: 'Sam', birthday: 'nope' })).toBeNull()
    expect(
      normalizeCompanion({ name: ' Sam ', birthday: '2001-01-01' }),
    ).toEqual({ name: 'Sam', birthday: '2001-01-01', lifeExpectancy: 90 })
  })
})
