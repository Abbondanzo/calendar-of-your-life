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
  height: 20px;
  width: 20px;
  border-color: #bbb;
  border-radius: 50%;
  border-style: solid;
  border-width: 2px;
  display: inline-block;
}
</style>
