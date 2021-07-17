<template>
  <div id="circles">
    <div
      v-for="(year, yearIndex) in years"
      :key="yearIndex"
      :class="{ mounting: circleHeight === 0 }"
      class="year-row"
      :style="{ height: circleHeight + 'px' }"
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
    return { circleHeight: 0 }
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
    this.grabCircleHeightFromWidth()
    window.addEventListener('resize', this.grabCircleHeightFromWidth)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.grabCircleHeightFromWidth)
  },
  methods: {
    grabCircleHeightFromWidth() {
      const circleElement: HTMLDivElement | null =
        document.querySelector('.week-circle')
      if (!circleElement) return
      const trueWidth = circleElement.getBoundingClientRect().width
      this.circleHeight = trueWidth
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
  height: 100%;

  @media screen and (max-width: 960px) {
    $margin: 1;
    margin: #{$margin}px;

    $dimen: calc((100% / 52) - #{$margin * 2}px);
    width: $dimen;
  }
}
</style>
