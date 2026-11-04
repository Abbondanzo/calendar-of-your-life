import { describe, expect, it } from 'vitest'
import {
  estimatedYears,
  expectedAge,
  guessCountry,
  normalizeEstimate,
  type LifeTables,
} from './expectancy'
import data from '../data/life-tables.json'

const ramp = Array.from({ length: 101 }, (_, age) => (100 - age) * 8)
const fixture: LifeTables = {
  source: 'test',
  year: 2023,
  tables: { PT: { female: ramp, male: ramp, any: ramp } },
}

describe('expectedAge', () => {
  it('adds the remaining years at the current age', () => {
    expect(expectedAge(fixture, { country: 'PT', sex: 'female' }, 0)).toBe(80)
    expect(expectedAge(fixture, { country: 'PT', sex: 'female' }, 50)).toBe(90)
    // Past 100 the open-ended 100+ row applies
    expect(expectedAge(fixture, { country: 'PT', sex: 'any' }, 104)).toBe(104)
  })

  it('is null for a country without a table', () => {
    expect(expectedAge(fixture, { country: 'ZZ', sex: 'any' }, 30)).toBeNull()
  })
})

describe('estimatedYears', () => {
  it('rounds, but never below the years already lived', () => {
    expect(estimatedYears(83.4, 28)).toBe(83)
    expect(estimatedYears(83.5, 28)).toBe(84)
    expect(estimatedYears(100.2, 100)).toBe(101)
  })
})

describe('guessCountry', () => {
  const known = (code: string) => ['US', 'PT', 'BR'].includes(code)
  it('uses the first language with a known region', () => {
    expect(guessCountry(['pt-BR', 'en-US'], known)).toBe('BR')
    expect(guessCountry(['xx-ZZ', 'en-US'], known)).toBe('US')
    // A bare language maximizes to its most likely region
    expect(guessCountry(['pt'], known)).toBe('BR')
    expect(guessCountry(['not a tag!'], known)).toBeNull()
  })
})

describe('normalizeEstimate', () => {
  it('keeps valid input only', () => {
    expect(normalizeEstimate(null)).toBeNull()
    expect(normalizeEstimate({ country: 'usa', sex: 'male' })).toBeNull()
    expect(normalizeEstimate({ country: 'US', sex: 'robot' })).toEqual({
      country: 'US',
      sex: 'any',
    })
  })
})

describe('bundled life tables', () => {
  const tables = data as LifeTables
  it('covers countries with full single-age tables', () => {
    expect(Object.keys(tables.tables).length).toBeGreaterThan(200)
    for (const table of Object.values(tables.tables)) {
      for (const sex of ['female', 'male', 'any'] as const) {
        expect(table[sex]).toHaveLength(101)
      }
    }
  })

  it('matches published UN figures', () => {
    // WPP 2022: Japan 2023 life expectancy at birth, about 88 and 82
    const jp = tables.tables.JP
    expect(jp.female[0] / 10).toBeCloseTo(88, 0)
    expect(jp.male[0] / 10).toBeCloseTo(81.9, 0)
    // Surviving raises the expected total
    expect(
      expectedAge(tables, { country: 'JP', sex: 'male' }, 70)!,
    ).toBeGreaterThan(jp.male[0] / 10)
  })
})
