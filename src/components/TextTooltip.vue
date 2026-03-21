<template>
  <div class="text-tooltip">
    <div class="text hide">{{ props.content }}</div>
    <el-tooltip :content="props.content" placement="top" show-after="500">
      <div class="text is-tooltip is-ellipsis">{{ props.content }}</div>
    </el-tooltip>
    <div class="text">{{ props.content }}</div>
  </div>
</template>

<script setup>
const props = defineProps({
  content: {
    type: String,
    default: ''
  }
})

</script>

<style lang="scss" scoped>
$height: 1.5em;
$height2: 3em;

.text-tooltip {
  // border: 1px solid #000;
  max-height: $height;
  overflow: hidden;
  .text {
    max-height: $height2;
  }
  .is-tooltip {
    margin-top: -$height2;
    max-height: $height;
    color: red;
  }
  .hide {
    visibility: hidden;
    pointer-events: none;
  }
}

</style>