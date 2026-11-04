import { describe, expect, it } from 'vitest'
import {
  DEFAULT_PRINT_OPTIONS,
  PAPER_SIZES,
  contentAspect,
  findPaper,
  normalizePrintOptions,
  pageGeometry,
  printCss,
} from './print'

describe('pageGeometry', () => {
  it('swaps dimensions for landscape', () => {
    const letter = findPaper('letter')!
    expect(pageGeometry(letter, 'portrait')).toMatchObject({
      width: 8.5,
      height: 11,
      unit: 'in',
    })
    expect(pageGeometry(letter, 'landscape')).toMatchObject({
      width: 11,
      height: 8.5,
    })
  })

  it('grows the margin with the paper', () => {
    const small = pageGeometry(findPaper('letter')!, 'portrait').margin
    const large = pageGeometry(findPaper('poster-24x36')!, 'portrait').margin
    expect(small).toBeCloseTo(0.38)
    expect(large).toBeGreaterThan(small * 2)
  })

  it('has unique paper ids', () => {
    const ids = PAPER_SIZES.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('printCss', () => {
  it('sizes the page and the sheet for a known paper', () => {
    const css = printCss({ ...DEFAULT_PRINT_OPTIONS, paper: 'a4' })
    expect(css).toContain('size: 210mm 297mm')
    expect(css).toContain('margin: 9.45mm')
    expect(css).toContain('--sheet-width: 191.1mm')
    expect(css).toContain('--sheet-height: 278.1mm')
  })

  it('leaves the size to the printer for auto', () => {
    const css = printCss({
      ...DEFAULT_PRINT_OPTIONS,
      paper: 'auto',
      orientation: 'landscape',
    })
    expect(css).toContain('size: landscape')
    expect(css).toContain('--sheet-height: 100vh')
  })
})

describe('contentAspect', () => {
  it('is the printable area ratio', () => {
    const portrait = contentAspect(DEFAULT_PRINT_OPTIONS)
    const landscape = contentAspect({
      ...DEFAULT_PRINT_OPTIONS,
      orientation: 'landscape',
    })
    expect(portrait).toBeLessThan(1)
    expect(landscape).toBeCloseTo(1 / portrait)
  })
})

describe('normalizePrintOptions', () => {
  it('fills in defaults and drops unknown values', () => {
    expect(normalizePrintOptions(undefined)).toEqual(DEFAULT_PRINT_OPTIONS)
    expect(
      normalizePrintOptions({
        layout: 'nope' as never,
        paper: 'napkin',
        orientation: 'sideways' as never,
      }),
    ).toEqual(DEFAULT_PRINT_OPTIONS)
    expect(normalizePrintOptions({ layout: 'split', paper: 'auto' })).toEqual({
      layout: 'split',
      paper: 'auto',
      orientation: 'portrait',
    })
  })
})
