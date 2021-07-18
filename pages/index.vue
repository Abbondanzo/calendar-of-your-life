<template>
  <BodyRoot v-if="hasBirthday" />
  <OnboardingRoot v-else />
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'Home',
  computed: {
    hasBirthday() {
      return Boolean(this.$accessor.birthday.date)
    },
  },
})
</script>
