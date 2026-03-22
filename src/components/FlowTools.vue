<template>
  <div class="flow-tools flex items-center">
    <div class="left flex items-center">
      <el-select v-model="zoomVal" @change="zoomChange" class="mr-10" style="width: 88px;">
        <template #label="{ value }"> {{`${(value * 100).toFixed()}%`}} </template>
        <el-option v-for="item in zoomOptions" :key="item.value" :label="item.label" :value="item.value">缩放到 {{item.label}}</el-option>
      </el-select>
      <el-tooltip content="优化布局" effect="light">
        <el-icon class="cu-icon cursor-pointer mr-10" @click="clickOptimize" color="#eee"><Menu /></el-icon>
      </el-tooltip>
      <el-tooltip content="导出为 png" effect="light">
        <el-icon class="cu-icon cursor-pointer mr-10" @click="exportImage"><MessageBox /></el-icon>
      </el-tooltip>
      <el-tooltip content="缩略图" effect="light">
        <el-icon class="cu-icon cursor-pointer mr-10" :class="{'active': minMapFlag}" @click="clickMiniMap"><Files /></el-icon>
      </el-tooltip>
      <div class="relative">
        <div class="add-node-dialog absolute"><slot name="addBtn"></slot></div>
        <el-button ref="addBtn" class="add-node-btn" @click.stop="clickAddBtn"><el-icon class="mr-10"><Plus /></el-icon> 添加节点</el-button>
      </div>
    </div>
    <div class="right flex items-center ml-10">
      <el-button ref="testRunBtn" class="test-run-btn" @click="clickTestRun"><el-icon class="mr-5" size="18"><CaretRight /></el-icon>试运行</el-button>
    </div>
  </div>
  <el-tour v-model="open">
    <el-tour-step :target="addBtn?.$el">
      添加节点
    </el-tour-step>
    <el-tour-step :target="testRunBtn?.$el">
      试运行
    </el-tour-step>
  </el-tour>
</template>

<script setup>
import { nextTick, onMounted, ref } from 'vue';
import { useVueFlow } from '@vue-flow/core';
import { ElLoading, ElMessage } from 'element-plus';
import { Menu, Plus, CaretRight, MessageBox, Files } from '@element-plus/icons-vue';
import { useLayout } from '@/hooks/useLayout.js';
import useScreenshot from '@/hooks/useScreenshot.js';

const emit = defineEmits(['onMiniMap', 'onAddbtn', 'onTestRun', 'onAutoLayout']);
const props = defineProps({
  flowId: String,
  onUpdate: Function,
})
const { flowId, onUpdate } = props;
const { onViewportChange, onPaneReady, vueFlowRef, getNodes, getEdges, updateNode, getViewport, setViewport, fitView, zoomTo } = useVueFlow(flowId);
const { layout } = useLayout();
const { exportImg } = useScreenshot();

const addBtn = ref(null);
const testRunBtn = ref(null);
const open = ref(false);
const zoomVal = ref(1);

const zoomOptions = [
  { label: '50%', value: 0.5 },
  { label: '75%', value: 0.75 },
  { label: '100%', value: 1 },
  { label: '150%', value: 1.5 },
  { label: '200%', value: 2 },
]

onPaneReady(() => {
  setTimeout(() => {
    const { zoom } = getViewport();
    zoomVal.value = zoom || 1;
  })
})
onViewportChange(({ zoom }) => {
  zoomVal.value = zoom || 1;
})

const zoomChange = (val) => {
  zoomTo(val);
}
const clickOptimize = () => {
  const direction = 'LR';
  const processedNodes = layout(getNodes.value, getEdges.value, direction);
  for (let i = 0; i < processedNodes.length; i++) {
    const node = processedNodes[i];
    const { id, position } = node;
    updateNode(id, { position });
  }
  typeof onUpdate === 'function' && onUpdate(getNodes.value[0]?.id);
  fitView();
}

const originZoom = ref({ x: 0, y: 0 });
const exportImage = () => {
  originZoom.value = getViewport();
  setViewport({ x: 0, y: 0, zoom: 1 });

  let max_info = { x: 0, y: 0 };
  let min_info = { x: 0, y: 0 };

  for (let i = 0; i < getNodes.value.length; i++) {
    const { dimensions, position } = getNodes.value[i];
    const { x, y } = position;
    const { width, height } = dimensions;

    if (i === 0) {
      max_info = { x, y };
      min_info = { x, y };
    }
    max_info.x = Math.max(max_info.x, x + width);
    max_info.y = Math.max(max_info.y, y + height);
    min_info.x = Math.min(min_info.x, x);
    min_info.y = Math.min(min_info.y, y);
  }

  console.log('max_info: ', max_info);
  console.log('min_info: ', min_info);

  let offsetX = 30 - min_info.x;
  let offsetY = 30 - min_info.y;
  
  console.log('offsetX, offsetY: ', offsetX, offsetY);

  setViewport({ x: offsetX, y: offsetY, zoom: 1 });
  vueFlowRef.value.style.cssText = `width:${max_info.x + offsetX + 30}px; height:${max_info.y + offsetY + 30}px;`;

  nextTick(async () => {
    const loading = ElLoading.service({
      lock: true,
      text: '正在导出图片...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    
    try {
      await exportImg(vueFlowRef.value, { imgName: 'flow' });
      ElMessage.success('导出成功！');
    } catch (error) {
      console.error(error);
      ElMessage.error('导出失败！');
    }

    loading.close();
    setViewport(originZoom.value);
    vueFlowRef.value.style.cssText = ``;
  })
}

const minMapFlag = ref(false);
const clickMiniMap = () => {
  minMapFlag.value = !minMapFlag.value;
  emit('onMiniMap', minMapFlag.value);
}

const clickAddBtn = () => {
  emit('onAddbtn', {});
}
const clickTestRun = () => {
  emit('onTestRun', {});
}

onMounted(() => {
  // open.value = true;
})

</script>

<style lang="scss" scoped>

.flow-tools {
  .left, .right {
    padding: 5px 10px;
    background-color: #fff;
    border: 1px solid rgba(68, 83, 130, 0.25);
    border-radius: 8px;
    box-shadow: 0px 2px 6px 0px rgba(0,0,0,0.04),0px 4px 12px 0px rgba(0,0,0,0.02);
    .cu-icon {
      font-size: 20px;
      color: #666;
      &:hover, &.active {
        color: #5147ff;
      }
    }
  }
  .add-node-btn {
    background-color: rgba(171, 181, 255, 0.3);
    color: #5147ff;
    border-color: transparent;
    font-weight: bold;
    &:hover {
      background-color: hsla(233, 100%, 80%, 0.4);
    }
  }
  .test-run-btn {
    background-color: #00b23c;
    color: #fff;
    border-color: transparent;
    font-weight: bold;
    padding-left: 10px;
    &:hover {
      background-color: hsl(140, 100%, 33%);
    }
  }
}

.add-node-dialog {
  bottom: calc(100% + 15px);
  left: 50%;
  transform: translateX(-50%);
}

</style>