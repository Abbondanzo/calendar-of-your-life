<template>
  <canvas ref="canvas" />
</template>

<script lang="ts">
import Vue from 'vue'
import { ArrowCanvasPainter } from '~/utils/arrow-canvas'

export default Vue.extend({
  name: 'BodyArrow',
  props: {
    text: {
      type: String,
      required: true,
    },
    arrowOnBottom: {
      type: Boolean,
      default: true,
    },
  },
  mounted() {
    const canvas = this.$refs.canvas as HTMLCanvasElement
    const painter = new ArrowCanvasPainter(canvas)
    painter.draw(this.$props.text, this.$props.arrowOnBottom)
  },
})
</script>
