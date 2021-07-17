<template>
  <div class="circle" />
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'BodyWeekCircle',
  props: {
    enabled: Boolean,
  },
})
</script>

<style lang="scss">
.circle {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  border-color: #bbb;
  border-radius: 50%;
  border-style: solid;
  border-width: 2px;
  display: block;
}
</style>
