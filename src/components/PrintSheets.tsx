import {
  NEUTRAL_COLOR,
  WEEKS_PER_YEAR,
  birthdayAt,
  stageForAge,
  stageProgress,
  type LifeStats,
} from '../lib/life'
import { formatDate, formatNumber } from '../lib/format'
import type { PrintOptions } from '../lib/print'
import { StaticLifeGrid } from './LifeGrid'

interface Props {
  birth: Date
  today: Date
  stats: LifeStats
  lifeExpectancy: number
  showStageColors: boolean
  options: PrintOptions
  /** Previews skip the accessible labels, since the real page has them. */
  preview?: boolean
}

function Heading() {
  return (
    <header className="sheet-header">
      <h1 className="sheet-title">Calendar of Your Life</h1>
      <p className="sheet-tagline">
        Time is limited and precious. How do you want to spend it?
      </p>
    </header>
  )
}

function StatList({ stats }: { stats: LifeStats }) {
  return (
    <dl className="sheet-stats">
      <div>
        <dt>Weeks lived</dt>
        <dd>{formatNumber(stats.weeksLived)}</dd>
      </div>
      <div>
        <dt>Weeks left</dt>
        <dd>{formatNumber(stats.weeksLeft)}</dd>
      </div>
      <div>
        <dt>Life lived</dt>
        <dd>{stats.percent.toFixed(1)}%</dd>
      </div>
      <div>
        <dt>Days lived</dt>
        <dd>{formatNumber(stats.position.daysLived)}</dd>
      </div>
    </dl>
  )
}

function Caption({
  birth,
  today,
  lifeExpectancy,
}: {
  birth: Date
  today: Date
  lifeExpectancy: number
}) {
  return (
    <p className="sheet-caption">
      Born {formatDate(birth)} · As of {formatDate(today)} · Living to{' '}
      {lifeExpectancy}
    </p>
  )
}

function StatsPage({
  birth,
  today,
  stats,
  lifeExpectancy,
  showStageColors,
}: Omit<Props, 'options' | 'preview'>) {
  const { position } = stats
  const stage = stageForAge(position.age)
  const stages = stageProgress(stats.years, position.index)
  const birthdaysAhead = Math.max(0, lifeExpectancy - position.age - 1)

  const facts: [string, string][] = [
    ['Born', formatDate(birth)],
    ['Age', `${position.age} years, ${position.week} weeks`],
    ['Life stage', stage?.name ?? 'Bonus time'],
    ['Birthdays ahead', formatNumber(birthdaysAhead)],
    ['Calendar ends', formatDate(birthdayAt(birth, lifeExpectancy))],
    ['Total weeks', formatNumber(lifeExpectancy * WEEKS_PER_YEAR)],
  ]

  return (
    <>
      <Heading />
      <StatList stats={stats} />
      <dl className="sheet-facts">
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <section className="sheet-stages">
        <h2>Weeks by life stage</h2>
        <ul>
          {stages.map((s) => {
            const color = showStageColors ? s.color : NEUTRAL_COLOR
            const share = (s.weeksLived / s.totalWeeks) * 100
            return (
              <li key={s.name}>
                <span className="stage-label">
                  {s.name}
                  <small>
                    Age {s.start === s.end ? s.start : `${s.start}–${s.end}`}
                  </small>
                </span>
                <span className="stage-bar" style={{ borderColor: color }}>
                  <span
                    style={{ width: `${share}%`, background: color }}
                    aria-hidden="true"
                  />
                </span>
                <span className="stage-count">
                  {formatNumber(s.weeksLived)} / {formatNumber(s.totalWeeks)}
                </span>
              </li>
            )
          })}
        </ul>
      </section>
      <Caption birth={birth} today={today} lifeExpectancy={lifeExpectancy} />
    </>
  )
}

/**
 * The printed pages. Each `.sheet` is exactly one page: its size comes from
 * CSS variables, and all type inside is sized in container units so the
 * design holds from a letter page up to a wall poster.
 */
export function PrintSheets(props: Props) {
  const { birth, today, stats, lifeExpectancy, showStageColors, options } =
    props
  const grid = (
    <div className="sheet-grid">
      <StaticLifeGrid
        years={stats.years}
        current={stats.position}
        showStageColors={showStageColors}
        ariaLabel={
          props.preview
            ? undefined
            : `A grid of ${formatNumber(stats.totalWeeks)} weeks, one row per year. ${formatNumber(stats.weeksLived)} weeks are filled in.`
        }
      />
    </div>
  )
  const sheetClass = `sheet sheet-${options.layout} is-${options.orientation}`

  if (options.layout === 'grid') {
    return <section className={sheetClass}>{grid}</section>
  }

  if (options.layout === 'split') {
    return (
      <>
        <section className={sheetClass}>
          <Heading />
          {grid}
          <Caption
            birth={birth}
            today={today}
            lifeExpectancy={lifeExpectancy}
          />
        </section>
        <section className={`sheet sheet-stats-page is-${options.orientation}`}>
          <StatsPage
            birth={birth}
            today={today}
            stats={stats}
            lifeExpectancy={lifeExpectancy}
            showStageColors={showStageColors}
          />
        </section>
      </>
    )
  }

  return (
    <section className={sheetClass}>
      <div className="sheet-side">
        <Heading />
        <StatList stats={stats} />
        <Caption birth={birth} today={today} lifeExpectancy={lifeExpectancy} />
      </div>
      {grid}
    </section>
  )
}
