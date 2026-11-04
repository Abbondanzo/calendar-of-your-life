import { memo, useRef, useState, type PointerEvent } from 'react'
import {
  NEUTRAL_COLOR,
  WEEKS_PER_YEAR,
  stageForAge,
  visibleStages,
  weekRange,
  type LifePosition,
} from '../lib/life'
import { formatDate } from '../lib/format'

// Geometry, in SVG user units. The SVG scales to its container via viewBox.
const STEP = 20
const RADIUS = 7
const STROKE = 1.6
const LEFT = 64
const TOP = 64
const RIGHT = 64
const BOTTOM = 16

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
const Poster = memo(function Poster({
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

  const circles = []
  for (let age = 0; age < years; age++) {
    const color = colorFor(age, showStageColors)
    for (let week = 0; week < WEEKS_PER_YEAR; week++) {
      const index = age * WEEKS_PER_YEAR + week
      if (index === currentIndex) continue // drawn separately, on top
      const past = index < currentIndex
      circles.push(
        <circle
          key={index}
          cx={cx(week)}
          cy={cy(age)}
          r={RADIUS}
          stroke={color}
          fill={past ? color : 'none'}
          className={past ? 'cell past' : 'cell'}
        />,
      )
    }
  }

  const weekLabels = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
  const yearLabels = []
  for (let age = 0; age < years; age += 5) yearLabels.push(age)

  return (
    <>
      {/* Top: weeks */}
      <text className="axis-title" x={LEFT + STEP / 2 - 4} y={18}>
        Weeks of your life
      </text>
      <Arrow x1={LEFT + 2} y1={28} x2={LEFT + 260} y2={28} />
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

      {/* Left: years */}
      <g transform={`translate(18 ${TOP + 2}) rotate(90)`}>
        <text className="axis-title" x={0} y={-4}>
          Years of your life
        </text>
        <Arrow x1={0} y1={-14} x2={260} y2={-14} />
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

      <g className="cells">{circles}</g>
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

export function LifeGrid({
  birth,
  years,
  current,
  showStageColors,
  ariaLabel,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hover, setHover] = useState<{
    age: number
    week: number
    x: number
    y: number
  } | null>(null)

  const width = LEFT + WEEKS_PER_YEAR * STEP + RIGHT
  const height = TOP + years * STEP + BOTTOM

  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current
    const matrix = svg?.getScreenCTM()
    if (!svg || !matrix) return
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      matrix.inverse(),
    )
    const week = Math.floor((point.x - LEFT) / STEP)
    const age = Math.floor((point.y - TOP) / STEP)
    if (week < 0 || week >= WEEKS_PER_YEAR || age < 0 || age >= years) {
      setHover(null)
      return
    }
    const rect = svg.getBoundingClientRect()
    setHover({
      age,
      week,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    })
  }

  let tooltip = null
  if (hover) {
    const [start, end] = weekRange(birth, hover.age, hover.week)
    const index = hover.age * WEEKS_PER_YEAR + hover.week
    const status =
      index < current.index
        ? 'Lived'
        : index === current.index
          ? 'This week'
          : 'Ahead of you'
    tooltip = (
      <div
        className="tooltip"
        style={{ left: hover.x, top: hover.y }}
        role="status"
      >
        <strong>
          Age {hover.age}, week {hover.week + 1}
        </strong>
        <span>
          {formatDate(start)} – {formatDate(end)}
        </span>
        <em>{status}</em>
      </div>
    )
  }

  return (
    <div className="grid-wrapper">
      <svg
        ref={svgRef}
        className="life-grid"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={ariaLabel}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHover(null)}
      >
        <Poster
          years={years}
          currentIndex={current.index}
          showStageColors={showStageColors}
        />
        {current.age < years && (
          <g className="current">
            <circle
              className="current-pulse"
              cx={cx(current.week)}
              cy={cy(current.age)}
              r={RADIUS}
            />
            <circle
              cx={cx(current.week)}
              cy={cy(current.age)}
              r={RADIUS}
              fill="var(--accent)"
              stroke="var(--accent)"
              strokeWidth={STROKE}
            />
          </g>
        )}
      </svg>
      {tooltip}
    </div>
  )
}
