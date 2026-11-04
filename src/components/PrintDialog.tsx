import {
  useEffect,
  useId,
  useRef,
  type CSSProperties,
  type ComponentProps,
} from 'react'
import {
  LAYOUTS,
  PAPER_SIZES,
  contentAspect,
  type PrintOptions,
} from '../lib/print'
import { PrintSheets } from './PrintSheets'

type SheetProps = Omit<ComponentProps<typeof PrintSheets>, 'options'>

interface Props extends SheetProps {
  open: boolean
  options: PrintOptions
  onChange: (patch: Partial<PrintOptions>) => void
  onStageColorsChange: (value: boolean) => void
  onPrint: () => void
  onClose: () => void
}

// Longest edge of a preview page, in CSS px
const PREVIEW_EDGE = 280
const PREVIEW_GAP = 16
// Pages are laid out this many times larger and scaled down, so tiny text
// isn't inflated by the browser's minimum font size and the preview matches
// the printed proportions.
const PREVIEW_SCALE = 4

export function PrintDialog({
  open,
  options,
  onChange,
  onStageColorsChange,
  onPrint,
  onClose,
  ...sheet
}: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const aspect = contentAspect(options)
  const pages = options.layout === 'split' ? 2 : 1
  // Shrink so two pages fit side by side, and everything fits a phone screen
  const edge = pages === 2 ? PREVIEW_EDGE * 0.72 : PREVIEW_EDGE
  let [width, height] =
    aspect < 1 ? [edge * aspect, edge] : [edge, edge / aspect]
  // Dialog gutters, padding and the preview's own padding
  const room = window.innerWidth - 32 - 32 - 40
  const needed = pages * width + (pages - 1) * PREVIEW_GAP
  if (needed > room) {
    const fit = Math.max(
      0.3,
      (room - (pages - 1) * PREVIEW_GAP) / (needed - (pages - 1) * PREVIEW_GAP),
    )
    width *= fit
    height *= fit
  }

  return (
    <dialog
      ref={ref}
      className="print-dialog"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        // A click on the backdrop lands on the dialog element itself
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <form
        method="dialog"
        className="print-dialog-body"
        onSubmit={(e) => {
          e.preventDefault()
          onPrint()
        }}
      >
        <h2 id={titleId} className="print-dialog-title">
          Print
        </h2>

        <div className="print-preview" aria-hidden="true">
          <div
            className="print-preview-frame"
            style={{
              width: pages * width + (pages - 1) * PREVIEW_GAP,
              height,
            }}
          >
            <div
              className="print-preview-pages"
              style={
                {
                  '--sheet-width': `${width * PREVIEW_SCALE}px`,
                  '--sheet-height': `${height * PREVIEW_SCALE}px`,
                  gap: PREVIEW_GAP * PREVIEW_SCALE,
                  transform: `scale(${1 / PREVIEW_SCALE})`,
                } as CSSProperties
              }
            >
              <PrintSheets {...sheet} options={options} preview />
            </div>
          </div>
        </div>

        <fieldset className="print-field">
          <legend>Layout</legend>
          <div className="print-choices">
            {LAYOUTS.map((layout) => (
              <label key={layout.id} className="print-choice">
                <input
                  type="radio"
                  name="layout"
                  value={layout.id}
                  checked={options.layout === layout.id}
                  onChange={() => onChange({ layout: layout.id })}
                />
                <span>
                  <strong>{layout.label}</strong>
                  <small>{layout.description}</small>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="print-row">
          <label className="control">
            <span>Paper</span>
            <select
              value={options.paper}
              onChange={(e) => onChange({ paper: e.target.value })}
            >
              {PAPER_SIZES.map((paper) => (
                <option key={paper.id} value={paper.id}>
                  {paper.label}
                </option>
              ))}
              <option value="auto">Printer default</option>
            </select>
          </label>
          <label className="control">
            <span>Orientation</span>
            <select
              value={options.orientation}
              onChange={(e) =>
                onChange({
                  orientation:
                    e.target.value === 'landscape' ? 'landscape' : 'portrait',
                })
              }
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </label>
          <label className="control checkbox">
            <input
              type="checkbox"
              checked={sheet.showStageColors}
              onChange={(e) => onStageColorsChange(e.target.checked)}
            />
            <span>Stage colors</span>
          </label>
        </div>

        <p className="print-tip">
          Tip: in your browser's print dialog, keep margins on "Default" and
          turn on "Background graphics" if colors are missing. Pick "Save as
          PDF" to send a poster to a print shop.
        </p>

        <div className="print-actions">
          <button type="button" className="button ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button primary">
            Print
          </button>
        </div>
      </form>
    </dialog>
  )
}
