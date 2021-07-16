<template>
  <span class="circle" />
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    enabled: Boolean,
  },
})
</script>

<style>
.circle {
  text-align: center;
}
</style>