import { describe, expect, it } from 'vitest'
import {
  clampView,
  fitView,
  isZoomed,
  scaleBounds,
  toContent,
  zoomAt,
  type Bounds,
} from './viewport'

const viewport = { width: 400, height: 800 }
const content = { width: 1000, height: 1000 }
const bounds: Bounds = { viewport, content, ...scaleBounds(viewport, content) }

describe('viewport math', () => {
  it('fits the content inside the viewport, centered', () => {
    expect(bounds.minScale).toBe(0.4)
    expect(fitView(bounds)).toEqual({ scale: 0.4, x: 0, y: 200 })
    expect(isZoomed(fitView(bounds), bounds)).toBe(false)
  })

  it('keeps the point under the cursor fixed while zooming', () => {
    const start = fitView(bounds)
    const before = toContent(start, 100, 300)
    const zoomed = zoomAt(start, 2, 100, 300)
    expect(toContent(zoomed, 100, 300)).toEqual(before)
    expect(isZoomed(zoomed, bounds)).toBe(true)
  })

  it('clamps scale and never lets the content leave the viewport', () => {
    expect(clampView({ scale: 0.01, x: 50, y: 50 }, bounds)).toEqual(
      fitView(bounds),
    )
    expect(clampView({ scale: 100, x: 0, y: 0 }, bounds).scale).toBe(
      bounds.maxScale,
    )
    // Zoomed to 1x the content is 1000x1000, so offsets are limited to [-600, 0] and [-200, 0]
    expect(clampView({ scale: 1, x: 300, y: -5000 }, bounds)).toEqual({
      scale: 1,
      x: 0,
      y: -200,
    })
  })
})
