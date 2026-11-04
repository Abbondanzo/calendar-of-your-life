import { useId, useState, type FormEvent } from 'react'
import { parseISODate } from '../lib/life'
import { formatDate, formatNumber } from '../lib/format'
import {
  MAX_NAME_LENGTH,
  validateCompanion,
  type Companion,
  type Together,
} from '../lib/companion'

interface Props {
  companion: Companion | null
  together: Together | null
  /** Whether their lifetime overlaps your calendar at all */
  onGrid: boolean
  defaultExpectancy: number
  expectancyOptions: readonly number[]
  onChange: (companion: Companion | null) => void
}

export function CompanionPanel({
  companion,
  together,
  onGrid,
  defaultExpectancy,
  expectancyOptions,
  onChange,
}: Props) {
  const [editing, setEditing] = useState(false)
  const titleId = useId()

  return (
    <section className="companion-panel" aria-labelledby={titleId}>
      <h2 id={titleId} className="section-title">
        Two lives, one grid
      </h2>
      <p className="section-lede">
        Add a partner, parent, child or friend to see how your weeks overlap.
      </p>

      {companion && !editing ? (
        <div className="companion-card">
          <div className="companion-legend">
            <span className="together-swatch" aria-hidden="true" />
            <span>
              <strong>{companion.name}</strong>
              <small>
                Born {formatDate(parseISODate(companion.birthday)!)} · Living to{' '}
                {companion.lifeExpectancy}
              </small>
            </span>
          </div>
          {together && onGrid ? (
            <dl className="companion-stats">
              <div>
                <dt>Weeks together</dt>
                <dd>{formatNumber(together.lived)}</dd>
              </div>
              <div>
                <dt>Weeks ahead together</dt>
                <dd>{formatNumber(together.ahead)}</dd>
              </div>
              <div>
                <dt>{companion.name}'s age</dt>
                <dd>{together.theirAge ?? 'Not born yet'}</dd>
              </div>
            </dl>
          ) : (
            <p className="companion-note">
              {companion.name}'s life doesn't overlap this calendar.
            </p>
          )}
          <div className="companion-actions">
            <button
              type="button"
              className="button ghost"
              onClick={() => setEditing(true)}
            >
              Edit
            </button>
            <button
              type="button"
              className="button ghost"
              onClick={() => onChange(null)}
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <CompanionForm
          initial={companion}
          defaultExpectancy={defaultExpectancy}
          expectancyOptions={expectancyOptions}
          onCancel={companion ? () => setEditing(false) : undefined}
          onSave={(next) => {
            onChange(next)
            setEditing(false)
          }}
        />
      )}
    </section>
  )
}

function CompanionForm({
  initial,
  defaultExpectancy,
  expectancyOptions,
  onSave,
  onCancel,
}: {
  initial: Companion | null
  defaultExpectancy: number
  expectancyOptions: readonly number[]
  onSave: (companion: Companion) => void
  onCancel?: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [birthday, setBirthday] = useState(initial?.birthday ?? '')
  const [lifeExpectancy, setLifeExpectancy] = useState(
    initial?.lifeExpectancy ?? defaultExpectancy,
  )
  const [error, setError] = useState<string | null>(null)
  const nameId = useId()
  const dateId = useId()
  const errorId = useId()

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const problem = validateCompanion(name, birthday)
    setError(problem)
    if (!problem) onSave({ name: name.trim(), birthday, lifeExpectancy })
  }

  const invalid = error
    ? { 'aria-invalid': true, 'aria-describedby': errorId }
    : {}

  return (
    <form className="companion-form" onSubmit={handleSubmit} noValidate>
      <label className="field grow" htmlFor={nameId}>
        <span>Name</span>
        <input
          id={nameId}
          type="text"
          value={name}
          maxLength={MAX_NAME_LENGTH}
          placeholder="Sam"
          onChange={(e) => {
            setName(e.target.value)
            setError(null)
          }}
          {...invalid}
        />
      </label>
      <label className="field" htmlFor={dateId}>
        <span>Birthdate</span>
        <input
          id={dateId}
          type="date"
          value={birthday}
          onChange={(e) => {
            setBirthday(e.target.value)
            setError(null)
          }}
          {...invalid}
        />
      </label>
      <label className="field">
        <span>Living to</span>
        <select
          value={lifeExpectancy}
          onChange={(e) => setLifeExpectancy(Number(e.target.value))}
        >
          {expectancyOptions.map((years) => (
            <option key={years} value={years}>
              {years} years
            </option>
          ))}
        </select>
      </label>
      <div className="companion-form-actions">
        {onCancel && (
          <button
            type="button"
            className="button ghost small"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
        <button type="submit" className="button primary small">
          {initial ? 'Save' : 'Add'}
        </button>
      </div>
      <p id={errorId} className="error" role="alert">
        {error}
      </p>
    </form>
  )
}
