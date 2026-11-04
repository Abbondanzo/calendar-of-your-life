import { describe, expect, it } from 'vitest'
import { parseISODate } from './life'
import {
  milestonesByWeek,
  normalizeMilestones,
  validateMilestone,
  weekIndexOf,
} from './milestones'

const d = (s: string) => parseISODate(s)!
const birth = d('2000-01-01')

describe('weekIndexOf', () => {
  it('maps a date to its grid cell', () => {
    expect(weekIndexOf(birth, d('2000-01-01'))).toBe(0)
    expect(weekIndexOf(birth, d('2000-01-08'))).toBe(1)
    expect(weekIndexOf(birth, d('2010-01-15'))).toBe(10 * 52 + 2)
  })

  it('rejects dates before birth', () => {
    expect(weekIndexOf(birth, d('1999-12-31'))).toBeNull()
  })
})

describe('milestonesByWeek', () => {
  it('groups by week, sorted, and drops anything off the grid', () => {
    const cells = milestonesByWeek(
      birth,
      [
        { id: 'b', date: '2018-06-03', label: 'Moved' },
        { id: 'a', date: '2018-06-01', label: 'Graduated' },
        { id: 'c', date: '1990-01-01', label: 'Too early' },
        { id: 'd', date: '2095-01-01', label: 'Too late' },
        { id: 'e', date: 'nope', label: 'Broken' },
      ],
      80,
    )
    expect([...cells.keys()]).toEqual([18 * 52 + 21])
    expect(cells.get(18 * 52 + 21)!.map((m) => m.id)).toEqual(['a', 'b'])
  })
})

describe('validateMilestone', () => {
  it('needs a label and a date on the calendar', () => {
    expect(validateMilestone(birth, 80, '2010-01-01', '  ')).toMatch(/name/)
    expect(validateMilestone(birth, 80, '', 'Hi')).toMatch(/date/)
    expect(validateMilestone(birth, 80, '1999-01-01', 'Hi')).toMatch(/before/)
    expect(validateMilestone(birth, 80, '2080-01-01', 'Hi')).toMatch(/end/)
    expect(validateMilestone(birth, 80, '2079-12-31', 'Hi')).toBeNull()
  })
})

describe('normalizeMilestones', () => {
  it('keeps valid entries and drops the rest', () => {
    expect(normalizeMilestones(undefined)).toEqual([])
    const kept = normalizeMilestones([
      { id: 'x', date: '2010-05-05', label: '  First job  ' },
      { id: 'y', date: '2010-02-31', label: 'Bad date' },
      { id: 'z', date: '2010-05-05', label: '' },
      'junk',
      { date: '2011-01-01', label: 'No id' },
    ])
    expect(kept).toHaveLength(2)
    expect(kept[0]).toEqual({ id: 'x', date: '2010-05-05', label: 'First job' })
    expect(kept[1].id).toBeTruthy()
  })
})
