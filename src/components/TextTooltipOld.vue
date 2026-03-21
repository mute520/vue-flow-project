<template>
  <div class="overflow-tip">
    <div class="txt">
      <div class="txt-item hide">{{ text }}</div>
      <div class="txt-item show">{{ text }}</div>
    </div>
    <el-tooltip :content="text" v-bind="attrs">
      <div class="txt tip is-ellipsis" :class="[place]" :data-title="text">{{ text }}</div>
    </el-tooltip>
  </div>
</template>

<script setup>
import { useAttrs } from 'vue';

// 定义 props
defineProps({
  text: {
    type: String,
    default: ''
  },
  place: {
    type: String,
    default: '' // center, start
  }
});

// 获取 attrs (虽然在模板中 v-bind="$attrs" 可以直接用，但在 setup 中显式获取是标准做法)
const attrs = useAttrs();
</script>

<style lang="scss" scoped>

.overflow-tip {
  height: 1.5em;
  line-height: 1.5em;
  overflow: hidden;
  .txt {
    max-height: 3em;
    .txt-item {
      &.hide {
        visibility: hidden;
        color: transparent;
      }
      &.show {
        margin-top: -1.5em;
        // color: yellow;
      }
    }
    &.tip {
      position: relative;
      top: -3em;
      &.start {
        direction: rtl;
      }
      &.center {
        &::before {
          content: attr(data-title);
          width: 50%;
          float: right;
          direction: rtl;
          color: red;
          overflow: hidden;
        }
      }
    }
  }
}
</style>
