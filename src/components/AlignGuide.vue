<template>
  <div
      v-for="(line, index) in props.guideLines"
      :key="index"
      class="align-guide"
      :class="line.type === 'v' ? 'v-line' : 'h-line'"
      :style="line.type === 'v' ? { left: line.position + 'px' } : { top: line.position + 'px' }"
    >
  </div>
</template>

<script setup>

const props = defineProps({
  guideLines: {
    type: Array,
    default: () => []
  }
})

</script>

<style lang="scss" scoped>
.align-guide {
  position: absolute;
  pointer-events: none;
}

.v-line {
  top: 0;
  bottom: 0;
  width: 1px;
  background-image: linear-gradient(to bottom, #a6a6f7 50%, transparent 50%);
  background-size: 1px 10px; /* 控制虚线的间距和高度 */
  background-repeat: repeat-y;
}

.h-line {
  left: 0;
  right: 0;
  height: 10px;
  background-image: linear-gradient(to right, #a6a6f7 50%, transparent 50%);
  background-size: 10px 1px; /* 控制虚线的间距和高度 */
  background-repeat: repeat-x;
}
</style>