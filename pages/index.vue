<template>
  <div v-if="birthday">
    <el-container>
      <el-header>Header {{ birthday || 'foo' }}</el-header>
      <el-main>Main</el-main>
    </el-container>
  </div>
  <div v-else>
    <Onboarding />
  </div>
</template>

<script lang="ts">
export default {
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
    birthday(): Date | undefined {
      return (this as any).$store.state.birthday.date
    },
  },
}
</script>
