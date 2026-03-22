<template>
  <div class="flow-container relative">
    <VueFlow :min-zoom="0.01" :fit-view-on-init="true">
      <template #node-start="nodeData">
        <StartNode v-bind="nodeData" @clickPlus="clickPlus" @clickNode="clickNode" />
      </template>
      <template #node-llm="nodeData">
        <StartNode v-bind="nodeData" @clickPlus="clickPlus" @clickNode="clickNode" />
      </template>
      <template #node-code="nodeData">
        <StartNode v-bind="nodeData" @clickPlus="clickPlus" @clickNode="clickNode" />
      </template>
      <template #node-out="nodeData">
        <StartNode v-bind="nodeData" @clickPlus="clickPlus" @clickNode="clickNode" />
      </template>
      <template #node-end="nodeData">
        <StartNode v-bind="nodeData" @clickPlus="clickPlus" @clickNode="clickNode" />
      </template>
      <template #edge-custom="edgeData">
        <CustomEdge v-bind="edgeData" @clickPlus="clickPlus" />
      </template>
      <template #edge-line="edgeData">
        <ConnLineEdge v-bind="edgeData" />
      </template>
      <template #connection-line="edgeData">
        <ConnLineEdge v-bind="edgeData" />
      </template>
      <template #node-pending="nodeData">
        <PendingNode v-bind="nodeData" />
      </template>

      <Background />
      <MiniMap v-show="minimapFlag" pannable zoomable :nodeExtent="true" />
    </VueFlow>
    <AddNodeDialog v-if="nodeDialogVisible" :pos="posInfo" @clickItem="_clickItem" />
    <div class="fixed bottom-[15px] left-[50%]" style="transform: translateX(-50%)">
      <FlowTools :flowId="flowId" @onMiniMap="onMiniMap" @onAddbtn="clickAddNodeBtn">
        <template v-if="isShowAddNodeDialog" #addBtn>
          <AddNodeDialog :onlyAddNode="true" @clickItem="_clickItem" />
        </template>
      </FlowTools>
    </div>
    <AlignGuide :guideLines="guideLines" />
  </div>
</template>

<script setup>
import { nextTick, onUnmounted, ref } from 'vue';
import { useVueFlow, VueFlow } from '@vue-flow/core';
import { MiniMap } from '@vue-flow/minimap';
import { Background } from '@vue-flow/background';
import { v4 as uuidv4 } from 'uuid';
import AddNodeDialog from '@/components/dialogs/AddNodeDialog.vue';
import useAlignGuide from "@/hooks/useAlignGuide.js";

const flowId = 'main';

const {
  vueFlowRef, getNodes, getEdges, addNodes, addEdges, updateNode, updateEdge, removeNodes, removeEdges, toObject,
  onConnect, onPaneReady, onConnectStart, onConnectEnd, onViewportChange, onNodeDragStart
} = useVueFlow(flowId);

const { guideLines } = useAlignGuide({ flowId, threshold: 8 });

const initNodes = () => {
  const node1 = { id: '1', type: 'start', data: { name: '开始' }, position: { x: 250, y: 5 } };
  const node2 = { id: '2', type: 'llm', data: { name: '大模型' }, position: { x: 250, y: 200 } };
  const node3 = { id: '3', type: 'code', data: { name: '代码' }, position: { x: 250, y: 500 } };
  const node4 = { id: '4', type: 'out', data: { name: '输出' }, position: { x: 650, y: 300 } };
  const node5 = { id: '5', type: 'end', data: { name: '结束' }, position: { x: 50, y: 400 } };

  addNodes([node1, node2, node3, node4, node5]);

  const edge1 = { id: '1->2', type: 'custom', source: '1', target: '2' };
  const edge2 = { id: '2->3', type: 'custom', source: '2', target: '3' };
  addEdges([edge1, edge2]);
}

onPaneReady(instance => {
  console.log('onPaneReady', instance);
  console.log('vueFlowRef', vueFlowRef.value);
  initNodes();
})

onConnect((params) => {
  console.log('onConnect', params);
  const edge = { 
    ...params,
    type: 'custom',
  }
  addEdges([edge]);
})

onViewportChange(() => {
  closeNodeDialog();
})

onNodeDragStart(() => {
  closeNodeDialog();
})

onConnectStart((event, params) => {
  console.log('onConnectStart', event, params);
  closeNodeDialog();
})

onConnectEnd((event, params) => {
  console.log('onConnectEnd', event, params);
  nodeDialogVisible.value = true;
})

const clickPlus = (info) => {
  console.log('clickPlus_info', info);
  const { x, y, sourceNode, nodeType, edgeInfo } = info;
  if (edgeInfo) { // 点击边中间的加号
    nodeDialogVisible.value = false;
  }
  setTimeout(() => {
    nodeDialogVisible.value = true;
  })
  posInfo.value = { x, y };
}

const nodeDialogVisible = ref(false);
const closeNodeDialog = () => {
  nodeDialogVisible.value = false;
  isShowAddNodeDialog.value = false;
}

const posInfo = ref({ x: 0, y: 0 });
const _clickItem = (nodeInfo) => {
  console.log('_clickItem_item: ', nodeInfo);
  const { type, name } = nodeInfo;
  const nodeItem = { id: uuidv4(), type, data: { name }, position: { x: 456, y: 105 } };
  addNodes([nodeItem]);
  closeNodeDialog();
}

const clickNode = (info) => {
  console.log('clickNode_info', info);
}

const minimapFlag = ref(false);
const onMiniMap = (bool) => {
  console.log('onMiniMap_bool', bool);
  minimapFlag.value = bool;
}

const isShowAddNodeDialog = ref(false);
const clickAddNodeBtn = () => {
  console.log('clickAddNodeBtn');
  nodeDialogVisible.value = false;
  isShowAddNodeDialog.value = true;
}

// 事件触发
const clickEvent1 = (e) => {
  const element = document.elementFromPoint(e.clientX, e.clientY);
  console.log('clickEvent1: ', element);
  if (!element?.closest('.node-list-dialog')) {
    closeNodeDialog();
    // removePendingNode();
  }
}
window.addEventListener('click', clickEvent1);
onUnmounted(() => {
  window.removeEventListener('click', clickEvent1);
})
// 事件触发

</script>

<style lang="scss" scoped>
.flow-container {
  height: 100%;
  width: 100%;
}
</style>