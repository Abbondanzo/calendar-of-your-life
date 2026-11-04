import { WEEKS_PER_YEAR, lifePosition, parseISODate } from './life'

/** A week worth remembering, or one to look forward to. */
export interface Milestone {
  id: string
  /** `YYYY-MM-DD`, any day within the week */
  date: string
  label: string
}

export const MAX_LABEL_LENGTH = 60

/** Grid index (`age * 52 + week`) of the week a date falls in. */
export function weekIndexOf(birth: Date, date: Date): number | null {
  if (date < birth) return null
  return lifePosition(birth, date).index
}

/**
 * Milestones grouped by the grid cell they land on, skipping any outside a
 * grid of `years` rows. Each group is sorted by date.
 */
export function milestonesByWeek(
  birth: Date,
  milestones: readonly Milestone[],
  years: number,
): Map<number, Milestone[]> {
  const cells = new Map<number, Milestone[]>()
  for (const milestone of sortMilestones(milestones)) {
    const date = parseISODate(milestone.date)
    if (!date) continue
    const index = weekIndexOf(birth, date)
    if (index === null || index >= years * WEEKS_PER_YEAR) continue
    const group = cells.get(index)
    if (group) group.push(milestone)
    else cells.set(index, [milestone])
  }
  return cells
}

export function sortMilestones(milestones: readonly Milestone[]): Milestone[] {
  return [...milestones].sort(
    (a, b) => a.date.localeCompare(b.date) || a.label.localeCompare(b.label),
  )
}

/** Why a new milestone can't be added, or `null` if it can. */
export function validateMilestone(
  birth: Date,
  years: number,
  date: string,
  label: string,
): string | null {
  if (!label.trim()) return 'Give it a name.'
  const parsed = parseISODate(date)
  if (!parsed) return 'Pick a date.'
  const index = weekIndexOf(birth, parsed)
  if (index === null) return 'That was before you were born.'
  if (index >= years * WEEKS_PER_YEAR)
    return "That's past the end of the calendar."
  return null
}

export function newMilestoneId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/** Drops anything malformed from saved settings. */
export function normalizeMilestones(value: unknown): Milestone[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const { id, date, label } = item as Record<string, unknown>
    if (typeof date !== 'string' || !parseISODate(date)) return []
    if (typeof label !== 'string' || !label.trim()) return []
    return [
      {
        id: typeof id === 'string' && id ? id : newMilestoneId(),
        date,
        label: label.trim().slice(0, MAX_LABEL_LENGTH),
      },
    ]
  })
}
