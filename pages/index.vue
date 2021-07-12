<template>
  <div v-if="birthday">
    <el-container>
      <el-header>Header {{ birthday }}</el-header>
      <el-main>Main</el-main>
    </el-container>
  </div>
  <div v-else>
    <Onboarding />
  </div>
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
    birthday() {
      return this.$accessor.birthday.date
    },
  },
  mounted() {
    setTimeout(() => {
      this.$accessor.birthday.set({ date: new Date() })
    }, 500)
  },
})
</script>
