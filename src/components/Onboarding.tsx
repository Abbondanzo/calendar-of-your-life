import { useId, useState, type FormEvent } from 'react'
import { ageOn, parseISODate, toISODate } from '../lib/life'

interface Props {
  initialValue: string
  onSubmit: (birthday: string) => void
}

const MAX_AGE = 120

function validate(value: string): string | null {
  if (!value) return 'Please enter your birthdate.'
  const date = parseISODate(value)
  if (!date) return "That doesn't look like a real date."
  const today = new Date()
  if (date > today) return "You've been born already. Use a real birthdate!"
  if (ageOn(date, today) >= MAX_AGE)
    return `Pick a date within the last ${MAX_AGE} years.`
  return null
}

export function Onboarding({ initialValue, onSubmit }: Props) {
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState<string | null>(null)
  const inputId = useId()
  const errorId = useId()

  const today = new Date()
  const max = toISODate(today)
  const min = toISODate(
    new Date(today.getFullYear() - MAX_AGE, today.getMonth(), today.getDate()),
  )

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const problem = validate(value)
    setError(problem)
    if (!problem) onSubmit(value)
  }

  return (
    <main className="onboarding">
      <h1 className="title">Calendar of Your Life</h1>
      <p className="tagline">Let's find out how much time is left.</p>
      <form className="onboarding-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor={inputId} className="label">
          Enter your birthdate
        </label>
        <input
          id={inputId}
          type="date"
          className="date-input"
          value={value}
          min={min}
          max={max}
          onChange={(e) => {
            setValue(e.target.value)
            if (error) setError(null)
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          autoFocus
          required
        />
        <p id={errorId} className="error" role="alert">
          {error}
        </p>
        <button type="submit" className="button primary">
          Show my weeks
        </button>
        <p className="fine-print">
          Your birthdate is stored only in this browser.
        </p>
      </form>
    </main>
  )
}
