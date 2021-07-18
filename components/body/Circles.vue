<template>
  <canvas id="circles" />
</template>

<script lang="ts">
import Vue from 'vue'
import { circleCanvasPainter } from '~/utils/circle-canvas'

type Week = {}
type Year = Week[]

const WEEKS_PER_YEAR = 52

export default Vue.extend({
  name: 'BodyCircles',
  data() {
    return { yearRowWidth: 0, yearRowHeight: 0 }
  },
  computed: {
    years(): Year[] {
      const weekCount = this.$accessor.birthday.currentWeek
      if (weekCount === null) return []
      const yearsAlive = Math.floor(weekCount / WEEKS_PER_YEAR)
      const weeksAliveCurrentYear = weekCount % WEEKS_PER_YEAR

      // Build year rows
      const yearsToFill = yearsAlive + 1
      const years = new Array(yearsToFill).fill([]).map((_, index): Week => {
        const weeksToFill =
          index === yearsAlive ? weeksAliveCurrentYear : WEEKS_PER_YEAR
        return new Array(weeksToFill).fill({}, 0, weeksToFill) as Year
      }) as Year[]

      return years
    },
  },
  mounted() {
    this.drawInitialCircles()
  },
  methods: {
    drawInitialCircles() {
      const canvas: HTMLCanvasElement = document.querySelector('#circles')!
      const canvasPainter = circleCanvasPainter(canvas)

      canvasPainter.setRowSize(this.years.length)
      canvasPainter.setColumnSize(this.years[0].length)

      this.years.forEach((year, row) => {
        year.forEach((_, column) => {
          canvasPainter.drawCircle({ row, column })
        })
      })
    },
  },
})
</script>

<style lang="scss">
#circles {
  max-width: 100%;
  margin: 0 auto;
}
</style>
