import { describe, expect, it } from 'vitest'
import {
  ageOn,
  birthdayAt,
  lifePosition,
  parseISODate,
  stageForAge,
  toISODate,
  visibleStages,
  weekRange,
} from './life'

const d = (s: string) => parseISODate(s)!

describe('parseISODate', () => {
  it('parses valid dates as local dates', () => {
    const date = d('1998-05-21')
    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([
      1998, 4, 21,
    ])
    expect(toISODate(date)).toBe('1998-05-21')
  })

  it('rejects malformed or overflowing dates', () => {
    expect(parseISODate('')).toBeNull()
    expect(parseISODate('1998-5-21')).toBeNull()
    expect(parseISODate('2023-02-31')).toBeNull()
  })
})

describe('ageOn', () => {
  it('increments on the birthday, not before', () => {
    const birth = d('1998-05-21')
    expect(ageOn(birth, d('2026-05-20'))).toBe(27)
    expect(ageOn(birth, d('2026-05-21'))).toBe(28)
  })

  it('celebrates leap-day birthdays on Feb 28', () => {
    const birth = d('2000-02-29')
    expect(toISODate(birthdayAt(birth, 1))).toBe('2001-02-28')
    expect(ageOn(birth, d('2001-02-27'))).toBe(0)
    expect(ageOn(birth, d('2001-02-28'))).toBe(1)
    expect(toISODate(birthdayAt(birth, 4))).toBe('2004-02-29')
  })
})

describe('lifePosition', () => {
  const birth = d('1998-05-21')

  it('is the first cell on the day of birth', () => {
    expect(lifePosition(birth, birth)).toMatchObject({
      age: 0,
      week: 0,
      index: 0,
      daysLived: 0,
    })
  })

  it('advances one column every 7 days', () => {
    expect(lifePosition(birth, d('1998-05-27')).week).toBe(0)
    expect(lifePosition(birth, d('1998-05-28')).week).toBe(1)
  })

  it('folds the leftover days into the 52nd week', () => {
    // 364 days after the birthday is still before the next one
    expect(lifePosition(birth, d('1999-05-20'))).toMatchObject({
      age: 0,
      week: 51,
    })
    expect(lifePosition(birth, d('1999-05-21'))).toMatchObject({
      age: 1,
      week: 0,
      index: 52,
    })
  })
})

describe('weekRange', () => {
  it('covers 7 days, with the last week running to the next birthday', () => {
    const birth = d('1998-05-21')
    expect(weekRange(birth, 0, 0).map(toISODate)).toEqual([
      '1998-05-21',
      '1998-05-27',
    ])
    expect(weekRange(birth, 0, 51).map(toISODate)).toEqual([
      '1999-05-13',
      '1999-05-20',
    ])
  })
})

describe('stages', () => {
  it('maps every age from 0 to 100 to exactly one stage', () => {
    for (let age = 0; age <= 100; age++) {
      expect(stageForAge(age)).toBeDefined()
    }
    expect(stageForAge(12)?.name).toBe('Childhood')
    expect(stageForAge(13)?.name).toBe('Adolescence')
  })

  it('clips stages to the visible number of years', () => {
    const stages = visibleStages(90)
    expect(stages.at(-1)).toMatchObject({
      name: 'Late Adulthood',
      start: 80,
      end: 89,
    })
    expect(visibleStages(70).map((s) => s.name)).not.toContain('Late Adulthood')
  })
})
