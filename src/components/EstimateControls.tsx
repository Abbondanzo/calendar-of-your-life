import { useMemo } from 'react'
import {
  SEXES,
  type EstimateInput,
  type LifeTables,
  type Sex,
} from '../lib/expectancy'

interface Props {
  tables: LifeTables | null
  estimate: EstimateInput
  age: number
  /** The age the tables say to expect, or null if they don't cover it */
  expected: number | null
  onChange: (estimate: EstimateInput) => void
}

function useCountryNames(codes: readonly string[]) {
  return useMemo(() => {
    let names: Intl.DisplayNames | null = null
    try {
      // English, to match the rest of the interface
      names = new Intl.DisplayNames(['en'], { type: 'region' })
    } catch {
      // Very old browsers: fall back to the codes themselves
    }
    const collator = new Intl.Collator('en')
    return codes
      .map((code) => ({ code, name: names?.of(code) ?? code }))
      .sort((a, b) => collator.compare(a.name, b.name))
  }, [codes])
}

export function EstimateControls({
  tables,
  estimate,
  age,
  expected,
  onChange,
}: Props) {
  const codes = useMemo(
    () => (tables ? Object.keys(tables.tables) : []),
    [tables],
  )
  const countries = useCountryNames(codes)

  if (!tables) {
    return <p className="estimate-note">Loading life tables…</p>
  }

  const country = countries.find((c) => c.code === estimate.country)
  const noun = SEXES.find((s) => s.id === estimate.sex)!.noun

  return (
    <div className="estimate">
      <div className="estimate-fields">
        <label className="control">
          <span>Country</span>
          <select
            value={estimate.country}
            onChange={(e) => onChange({ ...estimate, country: e.target.value })}
          >
            {!country && <option value={estimate.country}>Choose…</option>}
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="control">
          <span>Sex</span>
          <select
            value={estimate.sex}
            onChange={(e) =>
              onChange({ ...estimate, sex: e.target.value as Sex })
            }
          >
            {SEXES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="estimate-note">
        {expected !== null && country ? (
          <>
            {country.name}: {noun} who have reached {age} live to{' '}
            <strong>{expected.toFixed(1)}</strong> on average.{' '}
          </>
        ) : (
          'Pick a country to get an estimate. '
        )}
        <span className="estimate-source">
          Period life tables for {tables.year}, {tables.source}. An average, not
          a prediction.
        </span>
      </p>
    </div>
  )
}
