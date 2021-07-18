const DIAMETER = 20
const PADDING = 2
const RADIUS_WIDTH = 2
const STROKE_COLOR = '#bbb'
const STEP_SIZE = DIAMETER + 2 * PADDING

interface Circle {
  row: number
  column: number
}

export const circleCanvasPainter = (canvas: HTMLCanvasElement) => {
  const context: CanvasRenderingContext2D = canvas.getContext('2d')!

  const setRowSize = (rowSize: number) => {
    canvas.height = STEP_SIZE * rowSize
  }

  const setColumnSize = (columnSize: number) => {
    canvas.width = STEP_SIZE * columnSize
  }

  const drawCircle = ({ row, column }: Circle) => {
    const x = STEP_SIZE * column + STEP_SIZE / 2
    const y = STEP_SIZE * row + STEP_SIZE / 2
    context.lineWidth = RADIUS_WIDTH
    context.strokeStyle = STROKE_COLOR

    context.beginPath()
    context.arc(x, y, DIAMETER / 2, 0, Math.PI * 2, true)
    context.closePath()
    context.stroke()
  }

  return {
    drawCircle,
    setColumnSize,
    setRowSize,
  }
}
