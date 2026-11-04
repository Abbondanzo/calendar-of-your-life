/**
 * Print options and the page geometry they produce. The printed calendar is
 * laid out on fixed-size sheets so the same design works on a letter page or
 * a wall poster; everything inside a sheet scales with the sheet itself.
 */

export type PrintLayout = 'poster' | 'split' | 'grid'
export type Orientation = 'portrait' | 'landscape'

export interface PrintOptions {
  layout: PrintLayout
  /** An id from `PAPER_SIZES`, or `auto` to let the browser/printer decide. */
  paper: string
  orientation: Orientation
}

export const DEFAULT_PRINT_OPTIONS: PrintOptions = {
  layout: 'poster',
  paper: 'letter',
  orientation: 'portrait',
}

export const LAYOUTS: readonly {
  id: PrintLayout
  label: string
  description: string
}[] = [
  {
    id: 'poster',
    label: 'Poster',
    description: 'Calendar and stats together on one sheet',
  },
  {
    id: 'split',
    label: 'Calendar + stats',
    description: 'The calendar on one page, a stats sheet on the next',
  },
  {
    id: 'grid',
    label: 'Calendar only',
    description: 'Just the grid, as large as the paper allows',
  },
]

export interface PaperSize {
  id: string
  label: string
  /** Portrait width and height, in `unit` */
  width: number
  height: number
  unit: 'in' | 'mm'
}

export const PAPER_SIZES: readonly PaperSize[] = [
  {
    id: 'letter',
    label: 'Letter (8.5 × 11 in)',
    width: 8.5,
    height: 11,
    unit: 'in',
  },
  {
    id: 'legal',
    label: 'Legal (8.5 × 14 in)',
    width: 8.5,
    height: 14,
    unit: 'in',
  },
  {
    id: 'tabloid',
    label: 'Tabloid (11 × 17 in)',
    width: 11,
    height: 17,
    unit: 'in',
  },
  {
    id: 'poster-18x24',
    label: 'Poster (18 × 24 in)',
    width: 18,
    height: 24,
    unit: 'in',
  },
  {
    id: 'poster-24x36',
    label: 'Poster (24 × 36 in)',
    width: 24,
    height: 36,
    unit: 'in',
  },
  { id: 'a4', label: 'A4 (210 × 297 mm)', width: 210, height: 297, unit: 'mm' },
  { id: 'a3', label: 'A3 (297 × 420 mm)', width: 297, height: 420, unit: 'mm' },
  { id: 'a2', label: 'A2 (420 × 594 mm)', width: 420, height: 594, unit: 'mm' },
  { id: 'a1', label: 'A1 (594 × 841 mm)', width: 594, height: 841, unit: 'mm' },
]

/** Paper used for previews when the printer picks the size. */
const FALLBACK_PAPER = PAPER_SIZES[0]

export function findPaper(id: string): PaperSize | undefined {
  return PAPER_SIZES.find((paper) => paper.id === id)
}

export interface PageGeometry {
  /** Sheet size including margins, oriented */
  width: number
  height: number
  /** Margin on every side */
  margin: number
  unit: 'in' | 'mm'
}

/** Oriented page size and a margin that grows with the paper. */
export function pageGeometry(
  paper: PaperSize,
  orientation: Orientation,
): PageGeometry {
  const [width, height] =
    orientation === 'portrait'
      ? [paper.width, paper.height]
      : [paper.height, paper.width]
  // About 4.5% of the short side: ~0.4in on letter, ~1in on a 24×36 poster
  const margin = Math.round(Math.min(width, height) * 0.045 * 100) / 100
  return { width, height, margin, unit: paper.unit }
}

/** Width / height of the printable area, for on-screen previews. */
export function contentAspect(options: PrintOptions): number {
  const g = pageGeometry(
    findPaper(options.paper) ?? FALLBACK_PAPER,
    options.orientation,
  )
  return (g.width - 2 * g.margin) / (g.height - 2 * g.margin)
}

/**
 * The `@page` rule plus the size of each printed sheet. With a known paper
 * size the sheet fills the page exactly; otherwise it fills the viewport the
 * browser prints into, which is the page area.
 */
export function printCss(options: PrintOptions): string {
  const paper = findPaper(options.paper)
  if (!paper) {
    return `@page { size: ${options.orientation}; margin: 0.4in; }
.print-root { --sheet-width: 100vw; --sheet-height: 100vh; }`
  }
  const { width, height, margin, unit } = pageGeometry(
    paper,
    options.orientation,
  )
  const n = (value: number) => `${Math.round(value * 100) / 100}${unit}`
  return `@page { size: ${n(width)} ${n(height)}; margin: ${n(margin)}; }
.print-root { --sheet-width: ${n(width - 2 * margin)}; --sheet-height: ${n(height - 2 * margin)}; }`
}

/** Fills in anything missing or invalid from older saved settings. */
export function normalizePrintOptions(
  value: Partial<PrintOptions> | undefined,
): PrintOptions {
  const merged = { ...DEFAULT_PRINT_OPTIONS, ...value }
  return {
    layout: LAYOUTS.some((l) => l.id === merged.layout)
      ? merged.layout
      : DEFAULT_PRINT_OPTIONS.layout,
    paper:
      merged.paper === 'auto' || findPaper(merged.paper)
        ? merged.paper
        : DEFAULT_PRINT_OPTIONS.paper,
    orientation: merged.orientation === 'landscape' ? 'landscape' : 'portrait',
  }
}
