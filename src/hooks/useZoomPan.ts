import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import {
  clampView,
  fitView,
  isZoomed,
  panBy,
  scaleBounds,
  zoomAt,
  type Bounds,
  type Size,
  type View,
} from '../lib/viewport'

const TAP_SLOP = 8 // px a pointer may move and still count as a tap
const DOUBLE_TAP_MS = 300
const BUTTON_ZOOM = 1.6

interface Options {
  content: Size
  /** A tap or click that wasn't a drag, in viewport coordinates. */
  onTap?: (x: number, y: number) => void
}

interface PinchStart {
  view: View
  distance: number
  center: { x: number; y: number }
}

// Safari's non-standard trackpad pinch events
interface GestureEvent extends UIEvent {
  scale: number
  clientX: number
  clientY: number
}

const distance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y)
const midpoint = (
  a: { x: number; y: number },
  b: { x: number; y: number },
) => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
})

/**
 * Zoom and pan for a fixed-size viewport element:
 * - mouse: drag to pan, ctrl/⌘ + wheel (or trackpad pinch) to zoom, double-click to zoom in
 * - touch: pinch to zoom, drag to pan once zoomed, double-tap to zoom in
 * - keyboard: + / - to zoom, arrows to pan, 0 to reset
 */
export function useZoomPan<T extends HTMLElement>({ content, onTap }: Options) {
  const ref = useRef<T>(null)
  const [viewport, setViewport] = useState<Size>({ width: 0, height: 0 })
  const [view, setView] = useState<View>({ scale: 1, x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)

  const bounds: Bounds = {
    viewport,
    content,
    ...scaleBounds(viewport, content),
  }
  const zoomed = isZoomed(view, bounds)

  // Latest values for native event listeners and gesture handlers
  const latest = useRef({ view, bounds, onTap })
  latest.current = { view, bounds, onTap }

  // Whether the whole calendar is in view. Starts true so the first layout fits.
  const fitted = useRef(true)

  const apply = useCallback((next: View) => {
    const clamped = clampView(next, latest.current.bounds)
    latest.current.view = clamped
    fitted.current = !isZoomed(clamped, latest.current.bounds)
    setView(clamped)
    return clamped
  }, [])

  // Track the viewport size
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () =>
      setViewport({ width: el.clientWidth, height: el.clientHeight })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Refit when the viewport or content changes. Stay fitted if we were fitted,
  // otherwise keep the current zoom but make sure it's still in bounds.
  useLayoutEffect(() => {
    if (!viewport.width) return
    apply(fitted.current ? fitView(latest.current.bounds) : latest.current.view)
  }, [viewport.width, viewport.height, content.width, content.height, apply])

  const zoomBy = useCallback(
    (factor: number, px?: number, py?: number) => {
      const { view, bounds } = latest.current
      const x = px ?? bounds.viewport.width / 2
      const y = py ?? bounds.viewport.height / 2
      apply(zoomAt(view, view.scale * factor, x, y))
    },
    [apply],
  )
  const reset = useCallback(
    () => apply(fitView(latest.current.bounds)),
    [apply],
  )

  /** Double-tap / double-click: zoom in, or back out once fully zoomed. */
  const toggleZoomAt = useCallback(
    (px: number, py: number) => {
      const { view, bounds } = latest.current
      if (view.scale >= bounds.maxScale * 0.999) reset()
      else zoomBy(2.5, px, py)
    },
    [reset, zoomBy],
  )

  // Wheel and Safari gesture events need non-passive native listeners
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const local = (e: { clientX: number; clientY: number }) => {
      const rect = el.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }

    const onWheel = (e: WheelEvent) => {
      const { view, bounds } = latest.current
      const unit =
        e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? bounds.viewport.height : 1
      const dx = e.deltaX * unit
      const dy = e.deltaY * unit
      if (e.ctrlKey || e.metaKey) {
        // Trackpad pinches arrive as ctrl + wheel with small deltas
        e.preventDefault()
        const p = local(e)
        const factor = Math.exp(-Math.max(-50, Math.min(50, dy)) * 0.01)
        apply(zoomAt(view, view.scale * factor, p.x, p.y))
        return
      }
      if (!isZoomed(view, bounds)) return // let the page scroll
      const next = clampView(panBy(view, -dx, -dy), bounds)
      // At the edge, hand the scroll back to the page instead of trapping it
      if (next.x === view.x && next.y === view.y) return
      e.preventDefault()
      apply(next)
    }

    let gestureStart = 1
    const onGestureStart = (e: Event) => {
      e.preventDefault()
      gestureStart = latest.current.view.scale
    }
    const onGestureChange = (e: Event) => {
      e.preventDefault()
      const g = e as GestureEvent
      const p = local(g)
      apply(zoomAt(latest.current.view, gestureStart * g.scale, p.x, p.y))
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('gesturestart', onGestureStart)
    el.addEventListener('gesturechange', onGestureChange)
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('gesturestart', onGestureStart)
      el.removeEventListener('gesturechange', onGestureChange)
    }
  }, [apply])

  // Pointer gestures
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const pinch = useRef<PinchStart | null>(null)
  const tap = useRef<{
    id: number
    x: number
    y: number
    moved: boolean
  } | null>(null)
  const lastTap = useRef<{ time: number; x: number; y: number } | null>(null)

  const localPoint = (e: React.PointerEvent) => {
    const rect = ref.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const startPinch = () => {
    const [a, b] = [...pointers.current.values()]
    pinch.current = {
      view: latest.current.view,
      distance: distance(a, b),
      center: midpoint(a, b),
    }
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const p = localPoint(e)
    pointers.current.set(e.pointerId, p)
    e.currentTarget.setPointerCapture(e.pointerId)
    if (pointers.current.size === 1) {
      tap.current = { id: e.pointerId, ...p, moved: false }
    } else {
      tap.current = null
      startPinch()
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const previous = pointers.current.get(e.pointerId)
    if (!previous) return
    const p = localPoint(e)
    pointers.current.set(e.pointerId, p)

    if (
      tap.current?.id === e.pointerId &&
      distance(tap.current, p) > TAP_SLOP
    ) {
      tap.current.moved = true
    }

    if (pointers.current.size >= 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()]
      const start = pinch.current
      const center = midpoint(a, b)
      const scale = start.view.scale * (distance(a, b) / start.distance)
      const zoomedView = zoomAt(
        start.view,
        scale,
        start.center.x,
        start.center.y,
      )
      apply(
        panBy(zoomedView, center.x - start.center.x, center.y - start.center.y),
      )
      return
    }

    if (tap.current?.moved || !tap.current) {
      setDragging(true)
      apply(panBy(latest.current.view, p.x - previous.x, p.y - previous.y))
    }
  }

  const onPointerEnd = (e: React.PointerEvent) => {
    if (!pointers.current.delete(e.pointerId)) return
    if (pointers.current.size === 1) {
      // Lifting one finger of a pinch continues as a pan from where it is
      pinch.current = null
    } else if (pointers.current.size === 0) {
      pinch.current = null
      setDragging(false)
    }

    const t = tap.current
    if (e.type !== 'pointerup' || !t || t.id !== e.pointerId || t.moved) return
    tap.current = null
    latest.current.onTap?.(t.x, t.y)

    if (e.pointerType !== 'mouse') {
      const last = lastTap.current
      const now = performance.now()
      if (last && now - last.time < DOUBLE_TAP_MS && distance(last, t) < 30) {
        lastTap.current = null
        toggleZoomAt(t.x, t.y)
      } else {
        lastTap.current = { time: now, x: t.x, y: t.y }
      }
    }
  }

  const onDoubleClick = (e: React.MouseEvent) => {
    const rect = ref.current!.getBoundingClientRect()
    toggleZoomAt(e.clientX - rect.left, e.clientY - rect.top)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = 60
    const actions: Record<string, () => void> = {
      '+': () => zoomBy(BUTTON_ZOOM),
      '=': () => zoomBy(BUTTON_ZOOM),
      '-': () => zoomBy(1 / BUTTON_ZOOM),
      _: () => zoomBy(1 / BUTTON_ZOOM),
      '0': reset,
      ArrowLeft: () => apply(panBy(latest.current.view, step, 0)),
      ArrowRight: () => apply(panBy(latest.current.view, -step, 0)),
      ArrowUp: () => apply(panBy(latest.current.view, 0, step)),
      ArrowDown: () => apply(panBy(latest.current.view, 0, -step)),
    }
    const action = actions[e.key]
    // Arrow keys only pan when zoomed, otherwise they scroll the page as usual
    if (
      !action ||
      (e.key.startsWith('Arrow') &&
        !isZoomed(latest.current.view, latest.current.bounds))
    ) {
      return
    }
    e.preventDefault()
    action()
  }

  return {
    ref,
    view,
    zoomed,
    dragging,
    canZoomIn: view.scale < bounds.maxScale * 0.999,
    zoomIn: () => zoomBy(BUTTON_ZOOM),
    zoomOut: () => zoomBy(1 / BUTTON_ZOOM),
    reset,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: onPointerEnd,
      onPointerCancel: onPointerEnd,
      onDoubleClick,
      onKeyDown,
    },
  }
}
