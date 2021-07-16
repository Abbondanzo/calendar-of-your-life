<template>
  <div>
    <span>Weeks to live: {{ currentWeek }}</span>
  </div>
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