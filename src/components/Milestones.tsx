import { useId, useState, type FormEvent } from 'react'
import {
  WEEKS_PER_YEAR,
  birthdayAt,
  parseISODate,
  toISODate,
} from '../lib/life'
import { formatDate } from '../lib/format'
import {
  MAX_LABEL_LENGTH,
  newMilestoneId,
  sortMilestones,
  validateMilestone,
  weekIndexOf,
  type Milestone,
} from '../lib/milestones'

interface Props {
  birth: Date
  today: Date
  years: number
  currentIndex: number
  milestones: readonly Milestone[]
  onChange: (milestones: Milestone[]) => void
}

export function Milestones({
  birth,
  today,
  years,
  currentIndex,
  milestones,
  onChange,
}: Props) {
  const [date, setDate] = useState(() => toISODate(today))
  const [label, setLabel] = useState('')
  const [error, setError] = useState<string | null>(null)
  const titleId = useId()
  const dateId = useId()
  const labelId = useId()
  const errorId = useId()

  const min = toISODate(birth)
  const max = toISODate(
    new Date(birthdayAt(birth, years).getTime() - 24 * 60 * 60 * 1000),
  )

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const problem = validateMilestone(birth, years, date, label)
    setError(problem)
    if (problem) return
    onChange([
      ...milestones,
      { id: newMilestoneId(), date, label: label.trim() },
    ])
    setLabel('')
  }

  const sorted = sortMilestones(milestones)

  return (
    <section className="milestones-panel" aria-labelledby={titleId}>
      <h2 id={titleId} className="section-title">
        Milestones
      </h2>
      <p className="section-lede">
        Star the weeks that mattered, or the ones you're looking forward to.
      </p>

      <form className="milestone-form" onSubmit={handleSubmit} noValidate>
        <label className="field" htmlFor={dateId}>
          <span>Date</span>
          <input
            id={dateId}
            type="date"
            value={date}
            min={min}
            max={max}
            onChange={(e) => {
              setDate(e.target.value)
              setError(null)
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
          />
        </label>
        <label className="field grow" htmlFor={labelId}>
          <span>What happened</span>
          <input
            id={labelId}
            type="text"
            value={label}
            maxLength={MAX_LABEL_LENGTH}
            placeholder="Graduated, moved to Lisbon, met Sam…"
            onChange={(e) => {
              setLabel(e.target.value)
              setError(null)
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
          />
        </label>
        <button type="submit" className="button primary small">
          Add
        </button>
      </form>
      <p id={errorId} className="error" role="alert">
        {error}
      </p>

      {sorted.length > 0 && (
        <ol className="milestone-list">
          {sorted.map((m) => {
            const parsed = parseISODate(m.date)!
            const index = weekIndexOf(birth, parsed) ?? 0
            const age = Math.floor(index / WEEKS_PER_YEAR)
            const week = (index % WEEKS_PER_YEAR) + 1
            const ahead = index > currentIndex
            const offGrid = index >= years * WEEKS_PER_YEAR
            return (
              <li key={m.id} className={ahead ? 'ahead' : undefined}>
                <span className="milestone-star" aria-hidden="true">
                  {ahead ? '☆' : '★'}
                </span>
                <span className="milestone-text">
                  <strong>{m.label}</strong>
                  <small>
                    {formatDate(parsed)} · Age {age}, week {week}
                    {ahead && ' · Ahead'}
                    {offGrid && ' · Past the end of the calendar'}
                  </small>
                </span>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() =>
                    onChange(milestones.filter((other) => other.id !== m.id))
                  }
                  aria-label={`Remove ${m.label}`}
                  title="Remove"
                >
                  ×
                </button>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
