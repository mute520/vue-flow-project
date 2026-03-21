<template>
  <div :class="['node-container', {'is-selected': attrs.selected}]" @click="clickNode">
    <Handle type="target" :class="isConnected(0)" :position="Position.Left" />
    <div class="flex items-center justify-between mb-10">
      <div class="node-content flex">
        <img :src="startIcon" alt="" class="w-[24px] h-[24px] mr-10 rounded-[4px]">
        <TextEditable v-model="nodeName" @update:modelValue="updateNodeName" ref="textEditable" />
      </div>
      <el-dropdown class="node-actions nodrag" @command="handleCommand" placement="bottom-end">
        <el-icon class="node-actions-icon" size="16"><More /></el-icon>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="edit">编辑</el-dropdown-item>
            <el-dropdown-item command="delete">删除节点</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <el-input v-model="nodeType" class="nodrag"></el-input>
    <div class="info-item relative">
      <label class="flex-shrink-0 mr-10">输入</label>
      <div class="params flex items-center overflow-hidden">
        <div class="params-item" v-for="i in 6" :key="i">
          <el-tooltip content="String" effect="light" placement="top">
            <span>
              <span class="text-[#aaa]">str.</span>input
            </span>
          </el-tooltip>
        </div>
      </div>
      <div class="overlay absolute flex items-center">
        <div class="overlay-mark w-[93px]"></div>
        <el-popover v-if="1" content="String" trigger="hover" placement="bottom-end">
          <template #reference>
            <span class="more-btn flex items-center h-full">
              <el-icon><MoreFilled /></el-icon>
            </span>
          </template>
          <div v-for="i in 5" :key="i">
            <span class="text-[#aaa]">str.</span>input
          </div>
        </el-popover>
      </div>
    </div>
    <div class="info-item relative">
      <label class="flex-shrink-0 mr-10">输出</label>
      <div class="params flex items-center overflow-hidden">
        <div class="params-item" v-for="i in 5" :key="i">
          <el-tooltip content="String" effect="light" placement="top">
            <span>
              <span class="text-[#aaa]">str.</span>output
            </span>
          </el-tooltip>
        </div>
      </div>
      <div class="overlay absolute flex items-center">
        <div class="overlay-mark w-[93px]"></div>
        <el-popover v-if="1" content="String" trigger="hover" placement="bottom-end">
          <template #reference>
            <span class="more-btn flex items-center h-full">
              <el-icon><MoreFilled /></el-icon>
            </span>
          </template>
          <div v-for="i in 5" :key="i">
            <span class="text-[#aaa]">str.</span>output
          </div>
        </el-popover>
      </div>
    </div>
    <Handle type="source" :class="isConnected(1)" :position="Position.Right">
      <el-icon color="#37d0ff" @click.stop="clickPlus"><Plus /></el-icon>
    </Handle>
  </div>
</template>

<script setup>
import { ref, useAttrs } from 'vue';
import { Position, Handle, ConnectionMode, useVueFlow } from '@vue-flow/core';
import { Plus, More, MoreFilled } from '@element-plus/icons-vue';
import TextEditable from '@/components/TextEditable.vue';
import startIcon from '@/assets/icons/icon-Start-v2.jpg'
import llmIcon from '@/assets/icons/icon-LLM-v2.jpg'
import loopIcon from '@/assets/icons/icon-Loop-v2.jpg'

console.log(startIcon)
const emit = defineEmits(['clickNode', 'updateNode', 'deleteNode', 'clickPlus']);
const props = defineProps({
  data: Object,
});
const { data } = props;
const attrs = useAttrs();
const { getEdges } = useVueFlow();
// console.log('props: ', props);
// console.log('attrs: ', attrs);

const nodeType = ref(attrs.type);


const clickNode = () => {
  emit('clickNode', { node: attrs, type: 'node' });
};
const updateNode = (newNode) => {
  emit('updateNode', newNode);
};

const deleteNode = () => {
  emit('deleteNode', node.value.id);
};

const clickPlus = (e) => {
  emit('clickPlus', { x: e.x, y: e.y, nodeType: nodeType.value, sourceNode: attrs });
}
const isConnected = (type, handleId) => {
  if (!getEdges.value?.length) return '';
  for (let i = 0; i < getEdges.value.length; i++) {
    const { source, target, sourceHandle } = getEdges.value[i];
    if (type === 0 && target === attrs.id) return 'is-connected';
    if (type === 1 && source === attrs.id) return 'is-connected';
  }
}

// 
const nodeName = ref(data.name);
const textEditable = ref(null);
const updateNodeName = (value) => {
  nodeName.value = value;
  // updateNode({ ...attrs, data: { ...attrs.data, nodeName: value } });
};
const handleCommand = (command) => {
  console.log('command: ', command);
  if (command === 'delete') {
    deleteNode();
  } else if (command === 'edit') {
    textEditable.value.onFocus();
  }
};
</script>

<style lang="scss" scoped>
.node-container {
  background: #fff linear-gradient(#f2f2ff 0%, #fcfcff 40px, transparent 50px);
}

.info-item {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: rgba(55, 67, 105, 0.38);
  font-weight: 500;
  border-radius: 4px;
  margin: 8px 0;
  transform: translateY(0);
  .params {
    .params-item {
      background-color: rgba(87, 104, 161, 0.08);
      border-radius: 4px;
      margin-right: 5px;
      padding: 0px 5px;
      color: rgba(15, 21, 40, 0.82);
      &:hover {
        background-color: rgba(75, 90, 140, 0.19);
      }
    }
  }
  .overlay {
    top: 0;
    right: -1px;
    bottom: 0;
    pointer-events: none;
    background-color: #fff;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0) 80%, #fcfcff 80%);
    .overlay-mark {
      height: 100%;
      background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0, #fcfcff 78%);
    }
    .more-btn {
      pointer-events: auto;
      padding: 0px 2px;
      margin-right: 1px;
      border-radius: 4px;
      background: rgba(87, 104, 161, 0.08);
      &:hover {
        background-color: rgba(75, 90, 140, 0.19);
      }
    }
  }
}

.node-content {
}
</style>