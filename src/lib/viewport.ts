/**
 * Pure math for the zoomable grid. A `View` maps content coordinates to
 * viewport (screen) coordinates: `screen = content * scale + offset`.
 */

export interface View {
  scale: number
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface Bounds {
  viewport: Size
  content: Size
  minScale: number
  maxScale: number
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

/** The scale at which the whole content fits inside the viewport. */
export function fitScale(viewport: Size, content: Size): number {
  if (!viewport.width || !viewport.height || !content.width || !content.height)
    return 1
  return Math.min(
    viewport.width / content.width,
    viewport.height / content.height,
  )
}

export function scaleBounds(viewport: Size, content: Size) {
  const minScale = fitScale(viewport, content)
  // Allow zooming until a week cell is a comfortable tap target, and at least 8x.
  return { minScale, maxScale: Math.max(minScale * 8, 3) }
}

/** Centers content that is smaller than the viewport, otherwise keeps it covering the viewport. */
function clampAxis(offset: number, viewportSize: number, scaledSize: number) {
  if (scaledSize <= viewportSize) return (viewportSize - scaledSize) / 2
  return clamp(offset, viewportSize - scaledSize, 0)
}

export function clampView(
  view: View,
  { viewport, content, minScale, maxScale }: Bounds,
): View {
  const scale = clamp(view.scale, minScale, maxScale)
  return {
    scale,
    x: clampAxis(view.x, viewport.width, content.width * scale),
    y: clampAxis(view.y, viewport.height, content.height * scale),
  }
}

export function fitView(bounds: Bounds): View {
  return clampView({ scale: bounds.minScale, x: 0, y: 0 }, bounds)
}

/** Zooms to `scale` while keeping the viewport point (px, py) fixed on screen. */
export function zoomAt(
  view: View,
  scale: number,
  px: number,
  py: number,
): View {
  const ratio = scale / view.scale
  return {
    scale,
    x: px - (px - view.x) * ratio,
    y: py - (py - view.y) * ratio,
  }
}

export function panBy(view: View, dx: number, dy: number): View {
  return { ...view, x: view.x + dx, y: view.y + dy }
}

/** Converts a viewport point into content coordinates. */
export function toContent(view: View, px: number, py: number) {
  return { x: (px - view.x) / view.scale, y: (py - view.y) / view.scale }
}

export function isZoomed(view: View, bounds: Bounds) {
  return view.scale > bounds.minScale * 1.001
}
