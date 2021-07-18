const AXIS_WIDTH = 28
const DIAMETER = 22
const FONT = '12px "Giga Sans Extra Bold"'
const PADDING = 2
const RADIUS_WIDTH = 2
const STEP_SIZE = DIAMETER + 2 * PADDING

interface Circle {
  row: number
  column: number
  color: string
}

interface RightAxisLabel {
  text: string
  rowStart: number
  rowEnd: number
  color: string
}

interface ConstructorArguments {
  canvas: HTMLCanvasElement
  rowCount: number
  columnCount: number
}

export class CircleCanvasPainter {
  private readonly canvas: HTMLCanvasElement
  private rowCount: number
  private columnCount: number

  constructor({ canvas, rowCount, columnCount }: ConstructorArguments) {
    this.canvas = canvas
    this.rowCount = rowCount
    this.columnCount = columnCount
    this.updateDimensions()

    this.drawCircle = this.drawCircle.bind(this)
    this.drawLeftAxis = this.drawLeftAxis.bind(this)
    this.drawRightAxis = this.drawRightAxis.bind(this)
  }

  drawLeftAxis(row: number) {
    const context = this.getContext()
    context.font = FONT
    context.textAlign = 'start'
    context.fillText(`${row + 1}`, 0, STEP_SIZE * row + STEP_SIZE * 0.7)
  }

  drawRightAxis({ text, rowStart, rowEnd, color }: RightAxisLabel) {
    const context = this.getContext()
    context.font = FONT
    context.textAlign = 'center'
    context.rotate(Math.PI / 2)
    // The x/y are relative to the origin rotated as above
    const x = STEP_SIZE * rowStart + (STEP_SIZE * (1 + rowEnd - rowStart)) / 2
    const y = -(this.getWidth() - STEP_SIZE * 0.5)
    context.fillStyle = color
    context.fillText(text.toUpperCase(), x, y)
    // Restore context rotation
    context.rotate(-Math.PI / 2)
  }

  drawCircle({ row, column, color }: Circle) {
    if (row >= this.rowCount || row < 0) return
    if (column >= this.columnCount || column < 0) return

    const x = STEP_SIZE * column + STEP_SIZE / 2 + AXIS_WIDTH
    const y = STEP_SIZE * row + STEP_SIZE / 2
    const context = this.getContext()
    context.lineWidth = RADIUS_WIDTH
    context.strokeStyle = color

    context.beginPath()
    context.arc(x, y, DIAMETER / 2, 0, Math.PI * 2, true)
    context.closePath()
    context.stroke()
  }

  private updateDimensions() {
    this.canvas.height = this.getHeight()
    this.canvas.width = this.getWidth()
  }

  private getContext(): CanvasRenderingContext2D {
    return this.canvas.getContext('2d')!
  }

  private getHeight(): number {
    return STEP_SIZE * this.rowCount
  }

  private getWidth(): number {
    return STEP_SIZE * this.columnCount + AXIS_WIDTH * 2
  }
}
