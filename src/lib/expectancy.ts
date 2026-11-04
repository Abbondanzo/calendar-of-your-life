/**
 * Personal life expectancy from UN period life tables: given where someone
 * lives, their sex and how old they already are, the age they can expect to
 * reach. Surviving to an age raises the expected total, so a 70-year-old can
 * expect to live longer than a newborn in the same country.
 */

export type Sex = 'female' | 'male' | 'any'

export const SEXES: readonly { id: Sex; label: string; noun: string }[] = [
  { id: 'female', label: 'Female', noun: 'women' },
  { id: 'male', label: 'Male', noun: 'men' },
  { id: 'any', label: 'Prefer not to say', noun: 'people' },
]

export interface EstimateInput {
  /** ISO 3166-1 alpha-2 code */
  country: string
  sex: Sex
}

export interface LifeTables {
  source: string
  /** The year the period life tables describe */
  year: number
  /** e_x in tenths of a year for ages 0–100, by country code and sex */
  tables: Record<string, Record<Sex, number[]>>
}

let cached: Promise<LifeTables> | null = null

/** The tables are ~45 KB gzipped, so they load only when someone asks. */
export function loadLifeTables(): Promise<LifeTables> {
  cached ??= import('../data/life-tables.json').then(
    (module) => module.default as LifeTables,
  )
  return cached
}

/**
 * The age someone of `age` can expect to reach, or null without a table for
 * the country. Ages past 100 use the 100+ row.
 */
export function expectedAge(
  tables: LifeTables,
  { country, sex }: EstimateInput,
  age: number,
): number | null {
  const remaining = tables.tables[country]?.[sex]
  if (!remaining) return null
  const row = Math.max(0, Math.min(remaining.length - 1, Math.floor(age)))
  return age + remaining[row] / 10
}

/** Whole years for the grid: never fewer than the years already lived. */
export function estimatedYears(expected: number, age: number): number {
  return Math.max(age + 1, Math.round(expected))
}

/** A best guess at the reader's country from their browser languages. */
export function guessCountry(
  languages: readonly string[],
  known: (code: string) => boolean,
): string | null {
  for (const language of languages) {
    try {
      const region = new Intl.Locale(language).maximize().region
      if (region && known(region)) return region
    } catch {
      // Not a valid language tag; try the next one
    }
  }
  return null
}

export function normalizeEstimate(value: unknown): EstimateInput | null {
  if (!value || typeof value !== 'object') return null
  const { country, sex } = value as Record<string, unknown>
  if (typeof country !== 'string' || !/^[A-Z]{2}$/.test(country)) return null
  return {
    country,
    sex: SEXES.some((s) => s.id === sex) ? (sex as Sex) : 'any',
  }
}
