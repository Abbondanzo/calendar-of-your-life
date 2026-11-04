import { useCallback, useEffect, useMemo, useState } from 'react'
import { flushSync } from 'react-dom'
import { lifeStats } from '../lib/life'
import { THEMES, type Settings, type Theme } from '../lib/storage'
import { formatNumber } from '../lib/format'
import { printCss, type PrintOptions } from '../lib/print'
import { LifeGrid } from './LifeGrid'
import { PrintDialog } from './PrintDialog'
import { PrintSheets } from './PrintSheets'
import { Milestones } from './Milestones'
import { milestonesByWeek } from '../lib/milestones'

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

export function Calendar({ birth, settings, onChange }: Props) {
  const today = useToday()
  const stats = lifeStats(birth, today, settings.lifeExpectancy)
  const { position, years, totalWeeks, weeksLived, weeksLeft, percent } = stats
  const { lifeExpectancy, showStageColors, print: printOptions } = settings
  const [printing, print] = usePrinting()
  const [dialogOpen, setDialogOpen] = useState(false)
  const openDialog = useCallback(() => setDialogOpen(true), [])
  usePrintShortcut(openDialog, dialogOpen)

  const { milestones } = settings
  const marks = useMemo(
    () => milestonesByWeek(birth, milestones, years),
    [birth, milestones, years],
  )

  const sheetProps = {
    birth,
    today,
    stats,
    lifeExpectancy,
    showStageColors,
    milestones,
  }
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
        </header>

        <main>
          <LifeGrid
            birth={birth}
            years={years}
            current={position}
            showStageColors={showStageColors}
            milestones={marks}
            ariaLabel={`A grid of ${formatNumber(totalWeeks)} weeks, one row per year. ${formatNumber(weeksLived)} weeks are filled in.`}
          />
          <Milestones
            birth={birth}
            today={today}
            years={years}
            currentIndex={position.index}
            milestones={milestones}
            onChange={(next) => onChange({ milestones: next })}
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
