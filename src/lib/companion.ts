import {
  WEEKS_PER_YEAR,
  ageOn,
  birthdayAt,
  lifePosition,
  parseISODate,
} from './life'

/** Someone whose life is lined up against yours on the same grid. */
export interface Companion {
  name: string
  /** `YYYY-MM-DD` */
  birthday: string
  lifeExpectancy: number
}

export const MAX_NAME_LENGTH = 30

/**
 * The span of the companion's life on *your* grid, as `[start, end)` grid
 * indices. Your grid starts at your birth, so someone older starts at 0.
 */
export interface CompanionSpan {
  start: number
  end: number
  /** Index of the week they were born, if it's on your grid */
  birthIndex: number | null
}

/** Grid index of the week containing `date`, or a negative/early value clamp. */
function indexOn(birth: Date, date: Date): number {
  if (date < birth) return 0
  return lifePosition(birth, date).index
}

export function companionSpan(
  birth: Date,
  years: number,
  companion: Companion,
): CompanionSpan | null {
  const theirBirth = parseISODate(companion.birthday)
  if (!theirBirth) return null
  const gridEnd = years * WEEKS_PER_YEAR
  const theirEnd = birthdayAt(theirBirth, companion.lifeExpectancy)
  if (theirEnd <= birth) return null
  const start = indexOn(birth, theirBirth)
  if (start >= gridEnd) return null
  const end = Math.min(gridEnd, indexOn(birth, theirEnd))
  return {
    start,
    end,
    birthIndex: theirBirth >= birth ? start : null,
  }
}

export interface Together {
  /** Weeks you've both been alive, up to (not including) this week */
  lived: number
  /** Weeks you can still expect to share, this one included */
  ahead: number
  /** Their age today, or null if they aren't born yet */
  theirAge: number | null
}

/**
 * Weeks shared with the companion, measured on your grid and limited to your
 * own expected lifespan.
 */
export function togetherStats(
  span: CompanionSpan,
  currentIndex: number,
  lifeExpectancy: number,
  companion: Companion,
  today: Date,
): Together {
  const yourEnd = lifeExpectancy * WEEKS_PER_YEAR
  const end = Math.min(span.end, yourEnd)
  const lived = Math.max(0, Math.min(currentIndex, end) - span.start)
  const ahead = Math.max(0, end - Math.max(currentIndex, span.start))
  const theirBirth = parseISODate(companion.birthday)!
  return {
    lived,
    ahead,
    theirAge: theirBirth <= today ? ageOn(theirBirth, today) : null,
  }
}

/** The companion's age and week on a given date, if they're alive then. */
export function theirWeekOn(companion: Companion, date: Date) {
  const theirBirth = parseISODate(companion.birthday)
  if (!theirBirth || date < theirBirth) return null
  const position = lifePosition(theirBirth, date)
  if (position.age >= companion.lifeExpectancy) return null
  return position
}

/** Why a companion can't be saved, or `null` if it can. */
export function validateCompanion(
  name: string,
  birthday: string,
): string | null {
  if (!name.trim()) return 'Add their name.'
  const date = parseISODate(birthday)
  if (!date) return 'Pick their birthdate.'
  if (ageOn(date, new Date()) >= 120)
    return 'Pick a birthdate within the last 120 years.'
  return null
}

export function normalizeCompanion(value: unknown): Companion | null {
  if (!value || typeof value !== 'object') return null
  const { name, birthday, lifeExpectancy } = value as Record<string, unknown>
  if (typeof name !== 'string' || !name.trim()) return null
  if (typeof birthday !== 'string' || !parseISODate(birthday)) return null
  const years = Number(lifeExpectancy)
  return {
    name: name.trim().slice(0, MAX_NAME_LENGTH),
    birthday,
    lifeExpectancy:
      Number.isFinite(years) && years >= 1 && years <= 120
        ? Math.round(years)
        : 90,
  }
}
