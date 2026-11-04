import { useEffect, useState } from 'react'
import { WEEKS_PER_YEAR, lifePosition } from '../lib/life'
import type { Settings } from '../lib/storage'
import { formatNumber } from '../lib/format'
import { LifeGrid } from './LifeGrid'

interface Props {
  birth: Date
  settings: Settings
  onChange: (patch: Partial<Settings>) => void
}

const EXPECTANCY_OPTIONS = [70, 80, 90, 100]

/** Re-renders at the next local midnight so an open tab never goes stale. */
function useToday() {
  const [today, setToday] = useState(() => new Date())
  useEffect(() => {
    const next = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    )
    const id = window.setTimeout(
      () => setToday(new Date()),
      next.getTime() - Date.now() + 1000,
    )
    return () => window.clearTimeout(id)
  }, [today])
  return today
}

export function Calendar({ birth, settings, onChange }: Props) {
  const today = useToday()
  const position = lifePosition(birth, today)
  const { lifeExpectancy, showStageColors } = settings

  // Never cut the grid off before the current week
  const years = Math.max(lifeExpectancy, position.age + 1)
  const totalWeeks = years * WEEKS_PER_YEAR
  const weeksLived = position.index
  const weeksLeft = Math.max(
    0,
    lifeExpectancy * WEEKS_PER_YEAR - weeksLived - 1,
  )
  const percent = Math.min(
    100,
    (weeksLived / (lifeExpectancy * WEEKS_PER_YEAR)) * 100,
  )

  return (
    <div className="calendar-page">
      <header className="header">
        <h1 className="title">Calendar of Your Life</h1>
        <p className="tagline">
          Time is limited and precious. How do you want to spend it?
        </p>

        <dl className="stats">
          <div>
            <dt>Weeks lived</dt>
            <dd>{formatNumber(weeksLived)}</dd>
          </div>
          <div>
            <dt>Weeks left</dt>
            <dd>{formatNumber(weeksLeft)}</dd>
          </div>
          <div>
            <dt>Life lived</dt>
            <dd>{percent.toFixed(1)}%</dd>
          </div>
          <div>
            <dt>Days lived</dt>
            <dd>{formatNumber(position.daysLived)}</dd>
          </div>
        </dl>
        {position.age >= lifeExpectancy && (
          <p className="bonus">
            You've outlived this calendar. Every week from here is a bonus.
          </p>
        )}

        <div className="controls">
          <label className="control">
            <span>Live to</span>
            <select
              value={lifeExpectancy}
              onChange={(e) =>
                onChange({ lifeExpectancy: Number(e.target.value) })
              }
            >
              {EXPECTANCY_OPTIONS.map((years) => (
                <option key={years} value={years}>
                  {years} years
                </option>
              ))}
            </select>
          </label>
          <label className="control checkbox">
            <input
              type="checkbox"
              checked={showStageColors}
              onChange={(e) => onChange({ showStageColors: e.target.checked })}
            />
            <span>Stage colors</span>
          </label>
          <button
            type="button"
            className="button ghost"
            onClick={() => onChange({ birthday: null })}
          >
            Change birthdate
          </button>
        </div>
      </header>

      <main>
        <LifeGrid
          birth={birth}
          years={years}
          current={position}
          showStageColors={showStageColors}
          ariaLabel={`A grid of ${formatNumber(totalWeeks)} weeks, one row per year. ${formatNumber(weeksLived)} weeks are filled in.`}
        />
      </main>

      <footer className="footer">
        <p>
          Inspired by Kurzgesagt's Calendar of Your Life poster. If you enjoy
          their work, consider{' '}
          <a
            href="https://kurzgesagt.org/patreon-2/"
            target="_blank"
            rel="noreferrer"
          >
            supporting them on Patreon
          </a>
          .
        </p>
      </footer>
    </div>
  )
}
