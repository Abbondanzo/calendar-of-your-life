<template>
  <div class="circles-wrapper">
    <BodyArrow text="Weeks of Your Life" :arrow-on-bottom="true" />
    <div class="canvas-wrapper">
      <BodyArrow text="Years of Your Life" :arrow-on-bottom="false" />
      <canvas id="circles" />
      <BodyArrow text="Stages of Your Life" :arrow-on-bottom="false" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { CircleCanvasPainter } from '~/utils/circle-canvas'

let canvasPainter: CircleCanvasPainter

export default Vue.extend({
  name: 'BodyCircles',
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
  margin: 0 auto;

  .canvas-wrapper {
    display: flex;
    align-items: flex-start;
    justify-content: center;
  }
}
</style>
