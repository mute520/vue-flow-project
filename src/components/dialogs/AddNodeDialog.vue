<template>
  <div class="node-list-dialog" :class="{'only-add-node': onlyAddNode}" :style="style" ref="nodeListRef">
    <el-input v-model="searchValue" :prefix-icon="Search"></el-input>
    <div>
      <template v-for="item in mainNodes" :key="item.id">
        <p class="text-[#888] mt-10 mb-5">{{ item.title }}</p>
        <el-row class="nodes">
          <el-col :span="12" class="mb-5" @click="clickItem(c_item)" v-for="c_item in item.nodes" :key="c_item.id">
            <img :src="c_item.icon">
            {{ c_item.name }}
          </el-col>
        </el-row>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { Search } from '@element-plus/icons-vue';
import startIcon from '@/assets/icons/icon-Start-v2.jpg'
import endIcon from '@/assets/icons/icon-End-v2.jpg'
import llmIcon from '@/assets/icons/icon-LLM-v2.jpg'
import conditionIcon from '@/assets/icons/icon-Condition-v2.jpg'
import intentIcon from '@/assets/icons/icon-Intent-v2.jpg'
import loopIcon from '@/assets/icons/icon-Loop-v2.jpg'
import batchIcon from '@/assets/icons/icon-Batch-v2.jpg'
import outputIcon from '@/assets/icons/icon-Output-v2.jpg'

const emit = defineEmits(['clickItem']);
const props = defineProps({
  pos: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  },
  onlyAddNode: Boolean,
})

const searchValue = ref('');
const nodeListRef = ref();

const style = computed(() => ({
  left: `${props.pos.x}px`,
  top: `${props.pos.y - 150}px`,
}))

const mainNodes = [
  {
    title: '基础节点',
    nodes: [
      { name: '大模型', type: 'llm', icon: llmIcon },
      { name: '文生图', type: 'texttoimg', icon: llmIcon },
      { name: '图生图', type: 'imgtoimg', icon: llmIcon },
      { name: '输出', type: 'out', icon: outputIcon },
    ]
  },
  {
    title: '业务逻辑',
    nodes: [
      { name: '代码', type: 'code', icon: outputIcon },
      { name: '条件判断', type: 'condition', icon: conditionIcon },
      { name: '意图识别', type: 'intent', icon: intentIcon },
      { name: '循环', type: 'loop', icon: loopIcon },
      { name: '批处理', type: 'batch', icon: batchIcon },
    ]
  },
]

const clickItem = (item) => {
  emit('clickItem', { ...item });
}

onMounted(() => {})

</script>


<style lang="scss" scoped>
.node-list-dialog {
  position: absolute;
  width: 300px;
  height: 300px;
  padding: 15px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  transform: scale(0);
  transform-origin: left;
  animation: animate 0.1s ease-out forwards;
  .nodes {
    .el-col {
      display: flex;
      align-items: center;
      cursor: pointer;
      &:hover {
        // color: #666;
        opacity: .7;
      }
      img {
        width: 20px;
        height: 20px;
        border-radius: 4px;
        margin-right: 5px;
      }
    }
  }
  &.only-add-node {
    position: static;
    height: 500px;
    transform-origin: bottom; 
    &::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: -19px;
      width: 0;
      height: 0;
      border: 10px solid transparent;
      border-top-color: #fff;
    }
  }
}

@keyframes animate {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}
</style>