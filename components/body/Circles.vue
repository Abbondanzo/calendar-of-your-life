<template>
  <div class="circles-wrapper">
    <div class="canvas-wrapper">
      <div class="top">
        <BodyArrow text="Weeks of Your Life" :arrow-on-bottom="true" />
      </div>
      <div class="rotated left">
        <BodyArrow text="Years of Your Life" :arrow-on-bottom="false" />
      </div>
      <div class="rotated right">
        <BodyArrow text="Stages of Your Life" :arrow-on-bottom="false" />
      </div>
      <canvas id="circles" ref="circles" />
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
    const canvas = this.$refs.circles as HTMLCanvasElement
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
    $padding: 48;
    $arrow-padding: 10;
    $axis-width: 28;

    display: inline-block;
    position: relative;
    padding: $padding + px;
    // display: flex;
    // align-items: flex-start;
    // justify-content: center;

    #circles {
      max-width: 100%;
    }

    .top {
      position: absolute;
      top: 0;
      left: $padding + $axis-width + px;
    }

    .rotated {
      position: absolute;
      top: $padding + px;

      canvas {
        position: absolute;
        transform-origin: top left;
        transform: rotate(90deg);
      }

      &.left {
        left: $padding - $arrow-padding + px;

        canvas {
          transform: rotate(90deg);
        }
      }

      &.right {
        right: $padding - $arrow-padding + px;

        canvas {
          transform: rotate(90deg) translateY(-100%);
        }
      }
    }
  }
}
</style>
