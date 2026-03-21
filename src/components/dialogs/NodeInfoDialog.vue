<template>
  <div class="node-info">
    <div class="flex justify-between items-center p-10">
      <span>{{ info.data.name }}</span>
      <el-icon @click="clickClose" class="cursor-pointer"><Close /></el-icon>
    </div>
  </div>
</template>

<script setup>
import { Close } from '@element-plus/icons-vue'

const emit = defineEmits(['clickClose']);
const props = defineProps({
  info: {
    type: Object,
    default: () => ({})
  },
})

const clickClose = () => {
  emit('clickClose', {});
}
</script>

<style lang="scss" scoped>
.node-info {
  height: 100%;
  background-color: #fff;
}

</style>