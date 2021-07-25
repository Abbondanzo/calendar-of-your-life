<template>
  <div class="arrow-wrapper">
    <span class="text-arrow">{{ text }}</span>
    <div class="arrow" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'BodyArrow',
  props: {
    text: {
      type: String,
      required: true,
    },
  },
})
</script>

<style lang="scss" scoped>
.arrow-wrapper {
  display: inline-block;
  padding: 1em;

  .text-arrow {
    text-transform: uppercase;
  }
  .arrow {
    $arrow-color: #1e1f1c;

    background: $arrow-color;
    height: 1px;
    width: calc(100% + 40px);
    margin: 0 auto;
    position: relative;

    &::before,
    &::after {
      content: '';
      background: $arrow-color;
      position: absolute;
      height: 1px;
      width: 5px;
    }

    &::before {
      right: -2px;
      bottom: -1px;
      transform: rotate(-45deg);
    }

    &::after {
      right: -2px;
      top: -1px;
      transform: rotate(45deg);
    }
  }
}
</style>
