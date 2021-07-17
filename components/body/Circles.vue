<template>
  <div id="circles">
    <div
      v-for="(year, yearIndex) in years"
      :key="yearIndex"
      :class="{ mounting: yearRowWidth === 0 }"
      class="year-row"
      :style="{ height: yearRowHeight + 'px', width: yearRowWidth + 'px' }"
    >
      <div
        v-for="(week, weekIndex) in year"
        :key="weekIndex"
        class="week-circle"
      >
        <BodyWeekCircle />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

type Week = {}
type Year = Week[]

const WEEKS_PER_YEAR = 52

export default Vue.extend({
  name: 'BodyCircles',
  data() {
    return { yearRowWidth: 0, yearRowHeight: 0 }
  },
  computed: {
    years() {
      const weekCount = this.$accessor.birthday.currentWeek
      if (weekCount === null) return []
      const yearsAlive = Math.floor(weekCount / WEEKS_PER_YEAR)
      const weeksAliveCurrentYear = weekCount % WEEKS_PER_YEAR

      // Build year rows
      const yearsToFill = yearsAlive + 1
      const years = new Array<Year>(yearsToFill)
        .fill([])
        .map((_, index): Week => {
          const weeksToFill =
            index === yearsAlive ? weeksAliveCurrentYear : WEEKS_PER_YEAR
          return new Array<Week>(weeksToFill).fill({}, 0, weeksToFill)
        })

      return years
    },
  },
  mounted() {
    this.computeYearRowDimensions()
    window.addEventListener('resize', this.computeYearRowDimensions)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.computeYearRowDimensions)
  },
  methods: {
    computeYearRowDimensions() {
      const wrapperElement: HTMLDivElement | null =
        document.querySelector('#circles')
      if (!wrapperElement) return
      const trueWidth = wrapperElement.getBoundingClientRect().width

      const yearRowHeight = Math.floor(trueWidth / WEEKS_PER_YEAR)
      const yearRowWidth = yearRowHeight * WEEKS_PER_YEAR

      this.yearRowWidth = yearRowWidth
      this.yearRowHeight = yearRowHeight
    },
  },
})
</script>

<style lang="scss">
.mounting {
  opacity: 0;
}

.year-row {
  white-space: nowrap;
  padding: 2px;
}

.week-circle {
  display: inline-block;
  position: relative;

  $margin: 2;
  margin: #{$margin}px;

  $dimen: calc((100% / 52) - #{$margin * 2}px);
  width: $dimen;
  height: calc(100% - #{$margin * 2}px);

  @media screen and (max-width: 960px) {
    $margin: 1;
    margin: #{$margin}px;

    $dimen: calc((100% / 52) - #{$margin * 2}px);
    width: $dimen;
    height: calc(100% - #{$margin * 2}px);
  }
}
</style>
