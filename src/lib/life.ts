/**
 * Pure date/stage logic for the calendar. Every row is one year of life that
 * starts on a birthday, and every row has 52 weeks (the extra day or two at
 * the end of each year is folded into week 52), matching the poster.
 */

export const WEEKS_PER_YEAR = 52
const MS_PER_DAY = 24 * 60 * 60 * 1000

export interface Stage {
  name: string
  /** First age (inclusive) */
  start: number
  /** Last age (inclusive) */
  end: number
  color: string
}

export const STAGES: readonly Stage[] = [
  { name: 'Childhood', start: 0, end: 12, color: '#e8b98a' },
  { name: 'Adolescence', start: 13, end: 19, color: '#ee9f9d' },
  { name: 'Early Adulthood', start: 20, end: 34, color: '#e08abd' },
  { name: 'Middle Adulthood', start: 35, end: 49, color: '#d97fd0' },
  { name: 'Mature Adulthood', start: 50, end: 79, color: '#5fc6ea' },
  { name: 'Late Adulthood', start: 80, end: 100, color: '#5fcf74' },
]

export const NEUTRAL_COLOR = '#1e1f1c'

/** Parses a `YYYY-MM-DD` string (as produced by `<input type="date">`) as a local date. */
export function parseISODate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const [, y, m, d] = match.map(Number)
  const date = new Date(y, m - 1, d)
  // Reject overflow such as 2023-02-31
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null
  }
  return date
}

export function toISODate(date: Date): string {
  const y = String(date.getFullYear()).padStart(4, '0')
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Whole calendar days between two local dates, immune to DST shifts. */
export function daysBetween(from: Date, to: Date): number {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate())
  return Math.round((b - a) / MS_PER_DAY)
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

/**
 * The date of the `age`-th birthday. A Feb 29 birthday is celebrated on
 * Feb 28 in non-leap years.
 */
export function birthdayAt(birth: Date, age: number): Date {
  const year = birth.getFullYear() + age
  const month = birth.getMonth()
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate()
  return new Date(year, month, Math.min(birth.getDate(), lastDayOfMonth))
}

export function ageOn(birth: Date, on: Date): number {
  let age = on.getFullYear() - birth.getFullYear()
  if (birthdayAt(birth, age) > on) age -= 1
  return age
}

export interface LifePosition {
  /** Completed years, i.e. the current row */
  age: number
  /** Zero-based week within the current year, i.e. the current column (0–51) */
  week: number
  /** Index of the current week in the whole grid (`age * 52 + week`) */
  index: number
  daysLived: number
}

export function lifePosition(birth: Date, now: Date): LifePosition {
  const age = ageOn(birth, now)
  const sinceBirthday = daysBetween(birthdayAt(birth, age), now)
  const week = Math.min(WEEKS_PER_YEAR - 1, Math.floor(sinceBirthday / 7))
  return {
    age,
    week,
    index: age * WEEKS_PER_YEAR + week,
    daysLived: daysBetween(birth, now),
  }
}

/** Inclusive date range covered by a single cell of the grid. */
export function weekRange(
  birth: Date,
  age: number,
  week: number,
): [Date, Date] {
  const yearStart = birthdayAt(birth, age)
  const start = addDays(yearStart, week * 7)
  const end =
    week === WEEKS_PER_YEAR - 1
      ? addDays(birthdayAt(birth, age + 1), -1)
      : addDays(start, 6)
  return [start, end]
}

export function stageForAge(age: number): Stage | undefined {
  return STAGES.find((stage) => age >= stage.start && age <= stage.end)
}

/** Stages that are visible in a grid of `years` rows, clipped to fit. */
export function visibleStages(years: number): Stage[] {
  return STAGES.filter((stage) => stage.start < years).map((stage) => ({
    ...stage,
    end: Math.min(stage.end, years - 1),
  }))
}

export interface LifeStats {
  position: LifePosition
  /** Rows in the grid; never cuts off before the current week */
  years: number
  totalWeeks: number
  weeksLived: number
  weeksLeft: number
  /** Share of the expected lifespan lived, 0–100 */
  percent: number
}

export function lifeStats(
  birth: Date,
  today: Date,
  lifeExpectancy: number,
): LifeStats {
  const position = lifePosition(birth, today)
  const years = Math.max(lifeExpectancy, position.age + 1)
  const expectedWeeks = lifeExpectancy * WEEKS_PER_YEAR
  const weeksLived = position.index
  return {
    position,
    years,
    totalWeeks: years * WEEKS_PER_YEAR,
    weeksLived,
    weeksLeft: Math.max(0, expectedWeeks - weeksLived - 1),
    percent: Math.min(100, (weeksLived / expectedWeeks) * 100),
  }
}

export interface StageProgress extends Stage {
  totalWeeks: number
  weeksLived: number
}

/** How many weeks of each stage (clipped to the grid) have been lived. */
export function stageProgress(
  years: number,
  currentIndex: number,
): StageProgress[] {
  return visibleStages(years).map((stage) => {
    const totalWeeks = (stage.end - stage.start + 1) * WEEKS_PER_YEAR
    const lived = currentIndex - stage.start * WEEKS_PER_YEAR
    return {
      ...stage,
      totalWeeks,
      weeksLived: Math.min(totalWeeks, Math.max(0, lived)),
    }
  })
}
