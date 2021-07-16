<template>
  <header>
    <h1>Calendar of Your Life</h1>
    <p>Time is limited and precious. How do you want to spend it?</p>
    <p>Weeks Elapsed: {{ currentWeek }}</p>
  </header>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  computed: {
    currentWeek() {
      return this.$accessor.birthday.currentWeek
    },
  },
})
</script>
