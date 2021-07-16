<template>
  <div>
    <div v-for="(year, yearIndex) in years" :key="yearIndex" class="year-row">
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
})
</script>

<style>
.year-row {
  white-space: nowrap;
  padding: 2px;
}
.week-circle {
  display: inline;
  padding: 2px;
}
</style>
