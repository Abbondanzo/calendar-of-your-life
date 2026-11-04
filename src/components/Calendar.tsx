import { useCallback, useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { lifePosition, lifeStats } from '../lib/life'
import {
  estimatedYears,
  expectedAge,
  guessCountry,
  loadLifeTables,
  type LifeTables,
} from '../lib/expectancy'
import { EstimateControls } from './EstimateControls'
import { THEMES, type Settings, type Theme } from '../lib/storage'
import { formatNumber } from '../lib/format'
import { printCss, type PrintOptions } from '../lib/print'
import { LifeGrid } from './LifeGrid'
import { PrintDialog } from './PrintDialog'
import { PrintSheets } from './PrintSheets'

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

/**
 * Whether the print-only pages should be in the DOM. They're mounted just
 * before printing (from the print dialog or the browser's own Print menu) so the
 * extra copy of the grid costs nothing the rest of the time.
 */
function usePrinting() {
  const [printing, setPrinting] = useState(false)
  useEffect(() => {
    const before = () => flushSync(() => setPrinting(true))
    const after = () => setPrinting(false)
    window.addEventListener('beforeprint', before)
    window.addEventListener('afterprint', after)
    return () => {
      window.removeEventListener('beforeprint', before)
      window.removeEventListener('afterprint', after)
    }
  }, [])
  const print = () => {
    flushSync(() => setPrinting(true))
    window.print()
  }
  return [printing, print] as const
}

/**
 * Opens the print options dialog in place of the browser's print dialog when
 * the reader presses Ctrl/⌘+P. Printing from the browser menu skips it and
 * uses the last saved options.
 */
function usePrintShortcut(open: () => void, isOpen: boolean) {
  useEffect(() => {
    // While our dialog is open, the shortcut prints as usual with its options
    if (isOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        !event.altKey &&
        !event.shiftKey &&
        event.key.toLowerCase() === 'p'
      ) {
        event.preventDefault()
        open()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, isOpen])
}

/** Loads the UN life tables once a personal estimate is turned on. */
function useLifeTables(wanted: boolean) {
  const [tables, setTables] = useState<LifeTables | null>(null)
  useEffect(() => {
    if (!wanted || tables) return
    let live = true
    loadLifeTables().then((loaded) => live && setTables(loaded))
    return () => {
      live = false
    }
  }, [wanted, tables])
  return tables
}

export function Calendar({ birth, settings, onChange }: Props) {
  const today = useToday()
  const { estimate } = settings
  const tables = useLifeTables(estimate !== null)
  const age = lifePosition(birth, today).age
  const expected =
    estimate && tables ? expectedAge(tables, estimate, age) : null
  // With an estimate the grid follows it; until the tables load, the last
  // saved estimate keeps the grid steady
  const lifeExpectancy =
    expected !== null ? estimatedYears(expected, age) : settings.lifeExpectancy
  useEffect(() => {
    if (lifeExpectancy !== settings.lifeExpectancy) onChange({ lifeExpectancy })
  }, [lifeExpectancy, settings.lifeExpectancy, onChange])

  const stats = lifeStats(birth, today, lifeExpectancy)
  const { position, years, totalWeeks, weeksLived, weeksLeft, percent } = stats
  const { showStageColors, print: printOptions } = settings

  const chooseExpectancy = (value: string) => {
    if (value !== 'estimate') {
      onChange({ lifeExpectancy: Number(value), estimate: null })
      return
    }
    loadLifeTables().then((loaded) =>
      onChange({
        estimate: {
          country:
            guessCountry(navigator.languages, (c) => c in loaded.tables) ??
            'US',
          sex: 'any',
        },
      }),
    )
  }
  const [printing, print] = usePrinting()
  const [dialogOpen, setDialogOpen] = useState(false)
  const openDialog = useCallback(() => setDialogOpen(true), [])
  usePrintShortcut(openDialog, dialogOpen)

  const sheetProps = { birth, today, stats, lifeExpectancy, showStageColors }
  const updatePrint = (patch: Partial<PrintOptions>) =>
    onChange({ print: { ...printOptions, ...patch } })

  return (
    <>
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
                value={estimate ? 'estimate' : lifeExpectancy}
                onChange={(e) => chooseExpectancy(e.target.value)}
              >
                {!estimate && !EXPECTANCY_OPTIONS.includes(lifeExpectancy) && (
                  <option value={lifeExpectancy}>{lifeExpectancy} years</option>
                )}
                {EXPECTANCY_OPTIONS.map((years) => (
                  <option key={years} value={years}>
                    {years} years
                  </option>
                ))}
                <option value="estimate">
                  {estimate
                    ? `My estimate (${lifeExpectancy})`
                    : 'My estimate…'}
                </option>
              </select>
            </label>
            <label className="control checkbox">
              <input
                type="checkbox"
                checked={showStageColors}
                onChange={(e) =>
                  onChange({ showStageColors: e.target.checked })
                }
              />
              <span>Stage colors</span>
            </label>
            <label className="control">
              <span>Theme</span>
              <select
                value={settings.theme}
                onChange={(e) => onChange({ theme: e.target.value as Theme })}
              >
                {THEMES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="button ghost"
              onClick={() => onChange({ birthday: null })}
            >
              Change birthdate
            </button>
          </div>
          {estimate && (
            <EstimateControls
              tables={tables}
              estimate={estimate}
              age={age}
              expected={expected}
              onChange={(next) => onChange({ estimate: next })}
            />
          )}
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

      <PrintDialog
        {...sheetProps}
        open={dialogOpen}
        options={printOptions}
        onChange={updatePrint}
        onStageColorsChange={(value) => onChange({ showStageColors: value })}
        onClose={() => setDialogOpen(false)}
        onPrint={() => {
          flushSync(() => setDialogOpen(false))
          print()
        }}
      />

      {printing && (
        <div className="print-root">
          <style>{printCss(printOptions)}</style>
          <PrintSheets {...sheetProps} options={printOptions} />
        </div>
      )}
    </>
  )
}
