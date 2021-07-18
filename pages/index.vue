<template>
  <BodyRoot v-if="hasBirthday" />
  <OnboardingRoot v-else />
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'Home',
  head: {
    title: 'Calendar of Your Life',
    meta: [
      {
        hid: 'description',
        name: 'description',
        content:
          'Track how many weeks of your life you have spent already and how many you have left',
      },
    ],
  },
  computed: {
    hasBirthday() {
      return Boolean(this.$accessor.birthday.date)
    },
  },
})
</script>
