<template>
  <header>
    <h1>Calendar of Your Life</h1>
    <h2>Time is limited and precious. How do you want to spend it?</h2>
    <p>Weeks Elapsed: {{ currentWeek }}</p>
  </header>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'BodyHeader',
  computed: {
    currentWeek() {
      return this.$accessor.birthday.currentWeek
    },
  },
})
</script>

<style lang="scss" scoped>
header {
  text-align: center;

  h1,
  h2 {
    margin: 0;
  }
}
</style>
