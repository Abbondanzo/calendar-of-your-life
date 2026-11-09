import { memo, useState, type PointerEvent } from 'react'
import {
  NEUTRAL_COLOR,
  WEEKS_PER_YEAR,
  stageForAge,
  visibleStages,
  weekRange,
  type LifePosition,
} from '../lib/life'
import { formatDate } from '../lib/format'
import { toContent } from '../lib/viewport'
import { useZoomPan } from '../hooks/useZoomPan'

// Geometry, in SVG user units. The SVG scales to its container via viewBox.
const STEP = 20
const RADIUS = 7
const STROKE = 1.6
const LEFT = 64
const TOP = 64
const RIGHT = 64
const BOTTOM = 16
// The axis arrows sit the same distance from the grid on both axes, with the
// same gap between each arrow and its title.
const ARROW_GAP = 36
const TITLE_GAP = 10
const ARROW_LENGTH = 260

interface Props {
  birth: Date
  years: number
  current: LifePosition
  showStageColors: boolean
  ariaLabel: string
}

const cx = (week: number) => LEFT + week * STEP + STEP / 2
const cy = (age: number) => TOP + age * STEP + STEP / 2

function colorFor(age: number, showStageColors: boolean) {
  return (showStageColors && stageForAge(age)?.color) || NEUTRAL_COLOR
}

/** A full circle as path data: two half-circle arcs. */
function circlePath(x: number, y: number, r: number) {
  return `M${x - r},${y}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0`
}

/** Arrow from (x1,y1) to (x2,y2) with an open head. */
function Arrow({
  x1,
  y1,
  x2,
  y2,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
}) {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const head = 7
  const a1 = angle - Math.PI / 6
  const a2 = angle + Math.PI / 6
  return (
    <path
      className="arrow"
      d={`M${x1},${y1} L${x2},${y2} M${x2 - head * Math.cos(a1)},${y2 - head * Math.sin(a1)} L${x2},${y2} L${x2 - head * Math.cos(a2)},${y2 - head * Math.sin(a2)}`}
    />
  )
}

/** All the static parts of the poster. Memoized so hovering doesn't re-render 5,000 circles. */
export const Poster = memo(function Poster({
  years,
  currentIndex,
  showStageColors,
}: {
  years: number
  currentIndex: number
  showStageColors: boolean
}) {
  const gridRight = LEFT + WEEKS_PER_YEAR * STEP
  const gridBottom = TOP + years * STEP

  // One path per row (split where the row turns from lived to ahead) rather
  // than one <circle> per week: ~100 elements instead of thousands keeps
  // rendering, painting and compositing cheap, while rows that are scrolled
  // out of view when zoomed in can still be skipped. The circles never
  // overlap, so it looks the same.
  const groups = new Map<
    string,
    { color: string; past: boolean; d: string[] }
  >()
  for (let age = 0; age < years; age++) {
    const color = colorFor(age, showStageColors)
    for (let week = 0; week < WEEKS_PER_YEAR; week++) {
      const index = age * WEEKS_PER_YEAR + week
      if (index === currentIndex) continue // drawn separately, on top
      const past = index < currentIndex
      const key = `${age} ${past}`
      let group = groups.get(key)
      if (!group) groups.set(key, (group = { color, past, d: [] }))
      group.d.push(circlePath(cx(week), cy(age), RADIUS))
    }
  }
  const cells = [...groups.entries()].map(([key, { color, past, d }]) => (
    <path
      key={key}
      d={d.join('')}
      stroke={color}
      fill={past ? color : 'none'}
      className={past ? 'cell past' : 'cell'}
    />
  ))

  const weekLabels = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
  const yearLabels = []
  for (let age = 0; age < years; age += 5) yearLabels.push(age)

  return (
    <>
      {/* Top: weeks. The title sits above the arrow, its baseline TITLE_GAP away. */}
      <text className="axis-title" x={LEFT + 2} y={TOP - ARROW_GAP - TITLE_GAP}>
        Weeks of your life
      </text>
      <Arrow
        x1={LEFT + 2}
        y1={TOP - ARROW_GAP}
        x2={LEFT + ARROW_LENGTH}
        y2={TOP - ARROW_GAP}
      />
      {weekLabels.map((w) => (
        <text
          key={w}
          className="axis-label"
          x={cx(w - 1)}
          y={TOP - 10}
          textAnchor="middle"
        >
          {w}
        </text>
      ))}

      {/* Left: years. Rotated 90°, so local +y points away from the grid and the
          title hangs TITLE_GAP outside the arrow, mirroring the top axis. */}
      <g transform={`translate(${LEFT - ARROW_GAP} ${TOP}) rotate(90)`}>
        <Arrow x1={2} y1={0} x2={ARROW_LENGTH} y2={0} />
        <text
          className="axis-title"
          x={2}
          y={TITLE_GAP}
          dominantBaseline="hanging"
        >
          Years of your life
        </text>
      </g>
      {yearLabels.map((age) => (
        <text
          key={age}
          className="axis-label"
          x={LEFT - 8}
          y={cy(age)}
          textAnchor="end"
          dominantBaseline="central"
        >
          {age}
        </text>
      ))}

      {/* Right: stages */}
      {visibleStages(years).map((stage) => {
        const color = showStageColors ? stage.color : NEUTRAL_COLOR
        const y1 = TOP + stage.start * STEP + 3
        const y2 = TOP + (stage.end + 1) * STEP - 3
        const x = gridRight + 8
        const mid = (y1 + y2) / 2
        const range =
          stage.start === stage.end
            ? `${stage.start}`
            : `${stage.start}–${stage.end}`
        return (
          <g key={stage.name} className="stage">
            <path
              className="bracket"
              stroke={color}
              d={`M${x},${y1} h4 V${y2} h-4`}
            />
            <g transform={`translate(${x + 18} ${mid}) rotate(90)`}>
              <text className="stage-name" fill={color} textAnchor="middle">
                {stage.name}
              </text>
              <text
                className="stage-range"
                fill={color}
                textAnchor="middle"
                y={-14}
              >
                Age {range}
              </text>
            </g>
          </g>
        )
      })}

      <g className="cells">{cells}</g>
      <rect
        className="hit-area"
        x={LEFT}
        y={TOP}
        width={gridRight - LEFT}
        height={gridBottom - TOP}
      />
    </>
  )
})

/** Size of the whole poster in SVG user units. */
export function posterSize(years: number) {
  return {
    width: LEFT + WEEKS_PER_YEAR * STEP + RIGHT,
    height: TOP + years * STEP + BOTTOM,
  }
}

/** The current week, drawn above the rest of the grid. */
function CurrentWeek({ current }: { current: LifePosition }) {
  return (
    <g className="current">
      <circle
        className="current-cell"
        cx={cx(current.week)}
        cy={cy(current.age)}
        r={RADIUS}
        fill="var(--accent)"
        stroke="var(--accent)"
        strokeWidth={STROKE}
      />
    </g>
  )
}

/** A non-interactive grid that scales to fit its box, used for print. */
export function StaticLifeGrid({
  years,
  current,
  showStageColors,
  ariaLabel,
}: {
  years: number
  current: LifePosition
  showStageColors: boolean
  ariaLabel?: string
}) {
  const { width, height } = posterSize(years)
  return (
    <svg
      className="life-grid static"
      viewBox={`0 0 ${width} ${height}`}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      <Poster
        years={years}
        currentIndex={current.index}
        showStageColors={showStageColors}
      />
      {current.age < years && <CurrentWeek current={current} />}
    </svg>
  )
}

interface Cell {
  age: number
  week: number
}

export function LifeGrid({
  birth,
  years,
  current,
  showStageColors,
  ariaLabel,
}: Props) {
  const [selected, setSelected] = useState<Cell | null>(null)

  const { width, height } = posterSize(years)

  const cellAt = (px: number, py: number): Cell | null => {
    const point = toContent(zoom.view, px, py)
    const week = Math.floor((point.x - LEFT) / STEP)
    const age = Math.floor((point.y - TOP) / STEP)
    if (week < 0 || week >= WEEKS_PER_YEAR || age < 0 || age >= years)
      return null
    return { age, week }
  }

  const zoom = useZoomPan<HTMLDivElement>({
    content: { width, height },
    // Touch has no hover, so a tap selects a week (and a tap elsewhere clears it)
    onTap: (x, y) => setSelected(cellAt(x, y)),
  })
  const { view } = zoom
  const transform = `translate(${view.x} ${view.y}) scale(${view.scale})`

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    zoom.handlers.onPointerMove(event)
    if (event.pointerType !== 'mouse') return
    if (event.buttons) {
      setSelected(null) // hide while dragging
      return
    }
    const rect = event.currentTarget.getBoundingClientRect()
    setSelected(cellAt(event.clientX - rect.left, event.clientY - rect.top))
  }

  const handlePointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') setSelected(null)
  }

  let tooltip = null
  if (selected && selected.age < years) {
    const [start, end] = weekRange(birth, selected.age, selected.week)
    const index = selected.age * WEEKS_PER_YEAR + selected.week
    const status =
      index < current.index
        ? 'Lived'
        : index === current.index
          ? 'This week'
          : 'Ahead of you'
    // Anchor to the cell, flipping so the tooltip stays inside the viewport
    const sx = view.x + cx(selected.week) * view.scale
    const sy = view.y + cy(selected.age) * view.scale
    const gap = RADIUS * view.scale + 8
    const viewportWidth = zoom.ref.current?.clientWidth ?? 0
    const align =
      sx < viewportWidth * 0.3
        ? 'start'
        : sx > viewportWidth * 0.7
          ? 'end'
          : 'center'
    const below = sy < 90
    tooltip = (
      <div
        className={`tooltip align-${align} ${below ? 'below' : 'above'}`}
        style={{ left: sx, top: below ? sy + gap : sy - gap }}
        role="status"
      >
        <strong>
          Age {selected.age}, week {selected.week + 1}
        </strong>
        <span>
          {formatDate(start)} – {formatDate(end)}
        </span>
        <em>{status}</em>
      </div>
    )
  }

  return (
    <div className="grid-shell">
      <div
        ref={zoom.ref}
        className={`grid-viewport${zoom.zoomed ? ' is-zoomed' : ''}${zoom.dragging ? ' is-dragging' : ''}`}
        style={{ aspectRatio: `${width} / ${height}` }}
        tabIndex={0}
        role="group"
        aria-roledescription="zoomable calendar"
        aria-label="Calendar of your life. Use plus and minus to zoom, arrow keys to pan, 0 to reset."
        {...zoom.handlers}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <svg className="life-grid" role="img" aria-label={ariaLabel}>
          <g transform={transform}>
            <Poster
              years={years}
              currentIndex={current.index}
              showStageColors={showStageColors}
            />
            {current.age < years && <CurrentWeek current={current} />}
          </g>
        </svg>
        {/* The pulse and hover ring live in their own small SVG on top, so
            the animation and hovering don't invalidate the grid below. */}
        <svg className="life-grid-overlay" aria-hidden="true">
          <g transform={transform}>
            {current.age < years && (
              <circle
                className="current-pulse"
                cx={cx(current.week)}
                cy={cy(current.age)}
                r={RADIUS}
              />
            )}
            {selected && (
              <circle
                className="selected-ring"
                cx={cx(selected.week)}
                cy={cy(selected.age)}
                r={RADIUS + 3}
              />
            )}
          </g>
        </svg>
        {tooltip}

        <div
          className="zoom-controls"
          onPointerDown={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={zoom.zoomIn}
            disabled={!zoom.canZoomIn}
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={zoom.zoomOut}
            disabled={!zoom.zoomed}
            aria-label="Zoom out"
          >
            −
          </button>
          <button
            type="button"
            onClick={zoom.reset}
            disabled={!zoom.zoomed}
            aria-label="Fit whole calendar"
            title="Fit whole calendar"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" />
            </svg>
          </button>
        </div>
      </div>
      <p className="zoom-hint">
        <span className="hint-pointer">
          Ctrl/⌘ + scroll or double-click to zoom · drag to pan
        </span>
        <span className="hint-touch">
          Pinch or double-tap to zoom · tap a week for details
        </span>
      </p>
    </div>
  )
}
