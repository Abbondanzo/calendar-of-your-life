<template>
  <div class="circles-wrapper">
    <BodyArrow text="Weeks of Your Life" :arrow-on-bottom="true" />
    <div class="canvas-wrapper">
      <div class="rotated">
        <BodyArrow text="Years of Your Life" :arrow-on-bottom="false" />
      </div>
      <div class="forward">
        <canvas id="circles" />
      </div>
      <div class="rotated">
        <BodyArrow text="Stages of Your Life" :arrow-on-bottom="false" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { CircleCanvasPainter } from '~/utils/circle-canvas'

let canvasPainter: CircleCanvasPainter

export default Vue.extend({
  name: 'BodyCircles',
  data() {
    return { yearRowWidth: 0, yearRowHeight: 0 }
  },
  mounted() {
    const canvas: HTMLCanvasElement = document.querySelector('#circles')!
    const circleMatrix = this.$accessor.circles.circleMatrix
    const rowCount = circleMatrix.length
    const columnCount = circleMatrix.length > 0 ? circleMatrix[0].length : 0
    canvasPainter = new CircleCanvasPainter({
      canvas,
      rowCount,
      columnCount,
    })
    this.drawInitialCircles()
    this.drawStages()
  },
  methods: {
    drawInitialCircles() {
      const circleMatrix = this.$accessor.circles.circleMatrix
      circleMatrix.forEach((row, rowIndex) => {
        canvasPainter.drawLeftAxis(rowIndex)
        row.forEach((circle) => {
          canvasPainter.drawCircle(circle)
        })
      })
    },
    drawStages() {
      const labels = this.$accessor.circles.rightAxisLabels
      labels.forEach(canvasPainter.drawRightAxis)
    },
  },
})
</script>

<style lang="scss">
.circles-wrapper {
  max-width: 100%;
  margin: 0 auto;
  overflow: hidden;

  .canvas-wrapper {
    display: flex;
    align-items: flex-start;

    .rotated {
      flex: 0;

      & > * {
        transform-origin: top left;
        transform: rotate(90deg) translate(0, -100%);
      }
    }

    .forward {
      flex: 1;

      canvas {
        max-width: 100%;
      }
    }
  }
}
</style>
