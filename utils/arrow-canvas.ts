const ARROW_HEAD_LENGTH = 8
const ARROW_OVERFLOW_RIGHT = 40
const FONT = '16px "Giga Sans Extra Bold"'
const FONT_VERTICAL_OFFSET = 4
const GRAYSCALE_COLOR = '#111'
const LINE_PADDING = 4

export class ArrowCanvasPainter {
  private readonly canvas: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
  }

  draw(text: string, drawArrowBottom: boolean) {
    text = text.toUpperCase()

    // Compute and set dimensions
    const textDimensions = this.measureText(text)
    const arrowAngle = Math.PI / 4 // 45 degrees
    const arrowHeight = Math.sin(arrowAngle) * ARROW_HEAD_LENGTH * 2
    const arrowVerticalOffset = drawArrowBottom
      ? textDimensions.height + LINE_PADDING
      : arrowHeight / 2
    const canvasWidth = textDimensions.width + ARROW_OVERFLOW_RIGHT
    const canvasHeight = textDimensions.height + LINE_PADDING + arrowHeight

    this.canvas.width = canvasWidth
    this.canvas.height = canvasHeight

    // Draw everything
    this.drawText(text, drawArrowBottom)
    this.drawArrow(0, arrowVerticalOffset, canvasWidth, arrowVerticalOffset)
  }

  private drawArrow(fromX: number, fromY: number, toX: number, toY: number) {
    const context = this.getContext()

    const dx = toX - fromX
    const dy = toY - fromY
    const angle = Math.atan2(dy, dx)
    context.beginPath()
    context.moveTo(fromX, fromY)
    context.lineTo(toX, toY)
    context.lineTo(
      toX - ARROW_HEAD_LENGTH * Math.cos(angle - Math.PI / 6),
      toY - ARROW_HEAD_LENGTH * Math.sin(angle - Math.PI / 6)
    )
    context.moveTo(toX, toY)
    context.lineTo(
      toX - ARROW_HEAD_LENGTH * Math.cos(angle + Math.PI / 6),
      toY - ARROW_HEAD_LENGTH * Math.sin(angle + Math.PI / 6)
    )
    context.stroke()
  }

  private applyContextStyling(context: CanvasRenderingContext2D) {
    context.fillStyle = GRAYSCALE_COLOR
    context.font = FONT
    context.textBaseline = 'top'
    context.textAlign = 'start'
  }

  private measureText(text: string) {
    const context = this.getContext()
    this.applyContextStyling(context)
    const metrics = context.measureText(text)
    const height =
      2 * metrics.actualBoundingBoxDescent - metrics.actualBoundingBoxAscent
    return { width: metrics.width, height }
  }

  private drawText(text: string, drawArrowBottom: boolean) {
    const context = this.getContext()
    this.applyContextStyling(context)
    const y =
      FONT_VERTICAL_OFFSET +
      (drawArrowBottom ? 0 : ARROW_HEAD_LENGTH + LINE_PADDING)
    context.fillText(text, 0, y)
  }

  private getContext(): CanvasRenderingContext2D {
    return this.canvas.getContext('2d')!
  }
}
