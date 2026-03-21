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
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useVueFlow, VueFlow } from '@vue-flow/core';
import { MiniMap } from '@vue-flow/minimap';
import { Background } from '@vue-flow/background';
import { v4 as uuidv4 } from 'uuid';
import AddNodeDialog from '@/components/dialogs/AddNodeDialog.vue';

const flowId = 'main';

const {
  vueFlowRef, getNodes, getEdges, addNodes, addEdges, updateNode, updateEdge, removeNodes, removeEdges, toObject,
  onConnect, onPaneReady, onConnectStart, onConnectEnd, onViewportChange
} = useVueFlow(flowId);

const initNodes = () => {
  const node1 = { id: '1', type: 'start', data: { name: '开始' }, position: { x: 250, y: 5 } };
  const node2 = { id: '2', type: 'llm', data: { name: '大模型' }, position: { x: 250, y: 200 } };
  const node3 = { id: '3', type: 'code', data: { name: '代码' }, position: { x: 250, y: 500 } };
  const node4 = { id: '4', type: 'out', data: { name: '输出' }, position: { x: 650, y: 300 } };
  const node5 = { id: '5', type: 'end', data: { name: '结束' }, position: { x: 50, y: 400 } };

  addNodes([node1, node2, node3, node4, node5]);
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

onConnectStart((event, params) => {
  console.log('onConnectStart', event, params);
  nodeDialogVisible.value = false;
})

onConnectEnd((event, params) => {
  console.log('onConnectEnd', event, params);
  nodeDialogVisible.value = true;
})

const clickPlus = (info) => {
  console.log('clickPlus_info', info);
  const { x, y, sourceNode, nodeType } = info;
  nodeDialogVisible.value = true;
  posInfo.value = { x, y };
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
  isShowAddNodeDialog.value = true;
}

const nodeDialogVisible = ref(false);
const posInfo = ref({ x: 0, y: 0 });
const _clickItem = (item) => {
  
}

</script>

<style lang="scss" scoped>
.flow-container {
  height: 100%;
  width: 100%;
}
</style>