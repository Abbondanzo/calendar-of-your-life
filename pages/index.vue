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
          'On most days, life is sort of happening, passing you by. You are just busy keeping your head above water. So it is not easy to figure out what to do with your life and how to spend your time. The Calendar of Your Life website lets you track how many weeks of your life you have spent already and how many you have left.',
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
