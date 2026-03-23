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
import { nextTick, onUnmounted, ref, watch } from 'vue';
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

let flowInstance = null;
onPaneReady(instance => {
  console.log('onPaneReady', instance);
  flowInstance = instance;
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
  closeNodeDialog2();
})

onNodeDragStart(() => {
  closeNodeDialog();
  closeNodeDialog2();
})

const fromNodeId = ref('');
onConnectStart(({ event, nodeId, handleType, handleId }) => {
  console.log('onConnectStart', event, nodeId);
  fromNodeId.value = nodeId;
  closeNodeDialog();
  closeNodeDialog2();
})

onConnectEnd((event) => {
  console.log('onConnectEnd', event);
  const { x, y } = event;
  posInfo.value = { x, y };
  pendingNodeInfo.value = flowInstance?.project({ x, y }) || { x, y };
  setTimeout(() => {
    nodeDialogVisible.value = true;
  })

  const newNode = { id: uuidv4(), type: 'pending', position: pendingNodeInfo.value };
  pendingNodeInfo.value.nodeId = newNode.id;
  addNodes([newNode]);
  const edge = { id: newNode.id, type: 'line', source: fromNodeId.value, target: newNode.id };
  addEdges([edge]);
})

let targetEdge_click = null;
const clickPlus = (info) => {
  console.log('clickPlus_info', info);
  targetEdge_click = null;
  closeNodeDialog2();
  const { x, y, sourceNode, nodeType, edgeInfo } = info;
  fromNodeId.value = sourceNode.id;
  if (edgeInfo) { // 点击边中间的加号
    nodeDialogVisible.value = false;
    pendingNodeInfo.value = flowInstance?.project({ x, y });
    targetEdge_click = edgeInfo;
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
const removePendingNode = () => {
  removeNodes([pendingNodeInfo.value.nodeId]);
  removeEdges([pendingNodeInfo.value.nodeId]);
  pendingNodeInfo.value.nodeId = '';
}

const posInfo = ref({ x: 0, y: 0 });
const pendingNodeInfo = ref({ x: 0, y: 0, nodeId: '' });
const _clickItem = (nodeInfo) => {
  console.log('_clickItem_item: ', nodeInfo);
  const { type, name } = nodeInfo;
  const newNode = { id: uuidv4(), type, data: { name }, position: { x: pendingNodeInfo.value.x, y: pendingNodeInfo.value.y - 148 / 2 } };
  addNodes([newNode]);
  removePendingNode();
  const newEdge = { id: newNode.id, type: 'custom', source: fromNodeId.value, target: newNode.id };
  !isShowAddNodeFlag.value && addEdges([newEdge]);
  fromNodeId.value = '';
  closeNodeDialog();
  closeNodeDialog2();
  if (!isShowAddNodeFlag.value && targetEdge_click) {
    const edge = { id: uuidv4(), type: 'custom', source: newNode.id, target: targetEdge_click.target };
    addEdges([edge]);
    removeEdges([targetEdge_click.id]);
    targetEdge_click = null;
  }
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
const isShowAddNodeFlag = ref(false);
const clickAddNodeBtn = () => {
  console.log('clickAddNodeBtn');
  nodeDialogVisible.value = false;
  closeNodeDialog2(true, true);
  removePendingNode();

  const viewport = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  pendingNodeInfo.value = flowInstance?.project(viewport) || viewport;
}
const closeNodeDialog2 = (bool1, bool2) => {
  isShowAddNodeDialog.value = bool1 ? true : false;
  isShowAddNodeFlag.value = bool2 ? true : false;
}

// 事件触发
const clickEvent1 = (e) => {
  const element = document.elementFromPoint(e.clientX, e.clientY);
  console.log('clickEvent1: ', element);
  if (!element?.closest('.node-list-dialog')) {
    closeNodeDialog();
  }
}
window.addEventListener('click', clickEvent1);
onUnmounted(() => {
  window.removeEventListener('click', clickEvent1);
})
// 事件触发

watch(nodeDialogVisible, (val) => {
  if (!val) removePendingNode();
})

</script>

<style lang="scss" scoped>
.flow-container {
  height: 100%;
  width: 100%;
}
</style>