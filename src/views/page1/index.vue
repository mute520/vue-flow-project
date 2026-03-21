<template>
  <div class="page1">
    <div class="header">
      <el-button @click="goBack">back</el-button>
      <el-button @click="clickAddNode">添加节点</el-button>
      <el-button @click="exportWorkflow">导出图片（html2canvas）</el-button>
      <el-button @click="_setView">缩放</el-button>
    </div>
    <div class="flex-grow relative">
      <VueFlow :connection-mode="ConnectionMode.Strict" :fit-view-on-init="true" :min-zoom="0.01">
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
        <Controls />
        <MiniMap v-if="miniMapFlag" pannable zoomable />
        <template v-if="false" #zoom-pane>
          <div>Some element inside the zoom pane</div>
        </template>
      </VueFlow>
      <AlignGuide :guideLines="guideLines" />
      <AddNodeDialog v-if="nodeDialogVisible" :pos="posInfo" @clickItem="_clickItem" />
      <div v-if="nodeInfoVisible" class="nodeinfo-wrap absolute top-[10px] right-[10px]">
        <NodeInfoDialog :info="currentNodeInfo" @clickClose="clickClose"></NodeInfoDialog>
      </div>
      <div class="fixed bottom-[15px] left-[50%]" style="transform: translateX(-50%)">
        <FlowTools :flowId="flowId" @onMiniMap="onMiniMap" @onAutoLayout="onAutoLayout" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref } from "vue";
import { VueFlow, useVueFlow, ConnectionMode } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { MiniMap } from "@vue-flow/minimap";
import { NodeToolbar } from "@vue-flow/node-toolbar";
import { NodeResizer } from "@vue-flow/node-resizer";
import StartNode from '@/components/nodes/StartNode.vue';
import PendingNode from '@/components/nodes/PendingNode.vue';
import CustomEdge from "@/components/CustomEdge.vue";
import ConnLineEdge from "@/components/ConnLineEdge.vue";
import NodeInfoDialog from "@/components/dialogs/NodeInfoDialog.vue";
import AddNodeDialog from "@/components/dialogs/AddNodeDialog.vue";
import AlignGuide from "@/components/AlignGuide.vue";
import useAlignGuide from "@/hooks/useAlignGuide.js";
import useScreenshot from "@/hooks/useScreenshot.js";
import { useLayout } from '@/hooks/useLayout.js';
import FlowTools from "../../components/FlowTools.vue";

const flowId = 'main';
const { addNodes, addEdges, removeNodes, removeEdges, getViewport, vueFlowRef,
  onConnect, onPaneReady, onConnectStart, onConnectEnd, onPaneClick, onNodeDragStart,
  fitView, getNodes, getEdges, updateNode
} = useVueFlow(flowId);
const { guideLines } = useAlignGuide({ flowId, threshold: 8 });
const { exportImg } = useScreenshot();
const { layout } = useLayout();

let isSpecialArea = false;
const nodeDialogVisible = ref(false);
const posInfo = ref({ x: 0, y: 0 });
let newNodePosInfo = {};
let pendingNodeId = '';

const connStartNodeId = ref('');
const edgeInfo = ref({});
let isClickLinePlus = false;

onConnectStart((info) => {
  console.log('onConnectStart', info);
  connStartNodeId.value = info.nodeId;
  removePendingNode();
  nodeDialogVisible.value = false;
  isClickLinePlus = false;
});

onConnectEnd((event) => {
  console.log('onConnectEnd', event);
  if (isSpecialArea) return;
  setTimeout(() => { nodeDialogVisible.value = true })
  const { x, y } = event;
  const { x: offsetX, y: offsetY, zoom } = getViewport();
  
  // 获取VueFlow容器的边界矩形
  const flowBounds = document.querySelector('.vue-flow').getBoundingClientRect();
  
  // 计算相对于视口的位置
  const relativeX = x - flowBounds.left;
  const relativeY = y - flowBounds.top;
  
  // 转换为画布坐标
  const actualX = (relativeX - offsetX) / zoom;
  const actualY = (relativeY - offsetY) / zoom;
  
  posInfo.value = { x: actualX * zoom + offsetX, y: actualY * zoom + offsetY};
  newNodePosInfo = { x: actualX, y: actualY };
  const newNode = generateRandomNode({
    type: 'pending',
    position: { x: actualX, y: actualY },
  });
  pendingNodeId = newNode.id;
  addNodes([newNode]);
  const newEdge = createEdge({
    source: connStartNodeId.value,
    target: newNode.id,
    // animated: true,
    type: 'line',
  });
  addEdges([newEdge]);
})

const clickPlus = (info = {}) => {
  console.log('clickPlus_info:', info);
  const { x, y, sourceNode, edgeInfo: _edgeInfo } = info;
  const { width, height } = sourceNode.dimensions;
  const { x: sx, y: sy } = sourceNode.position;

  posInfo.value = { x: x + 10, y };
  newNodePosInfo = { x: sx + width + 50, y: sy };
  setTimeout(() => {
    nodeDialogVisible.value = true;
  })
  connStartNodeId.value = sourceNode.id;

  if (_edgeInfo) {
    edgeInfo.value = _edgeInfo;
    isClickLinePlus = true;
  }
}
const _clickItem = (info = {}) => {
  console.log('_clickItem_info: ', info);
  const { x, y } = newNodePosInfo;
  const newNode = generateRandomNode({
    position: { x, y },
  });
  addNodes(newNode);
  const newEdge = createEdge({
    source: connStartNodeId.value,
    target: newNode.id,
    type: 'custom',
  });
  addEdges(newEdge);
  removePendingNode();
  nodeDialogVisible.value = false;

  if (isClickLinePlus && edgeInfo.value?.target) {
    const newEdge2 = createEdge({
      source: newNode.id,
      target: edgeInfo.value.target,
      type: 'custom',
    });
    addEdges(newEdge2);
    removeEdges(edgeInfo.value?.id);
  }

  isClickLinePlus = false;
}

const flowInstance = ref(null);
onPaneReady((instance) => {
  flowInstance.value = instance;
  console.log('onPaneReady-instance:', instance);
  const newNode1 = generateRandomNode({
    position: { x: 100, y: 200 },
    position: { x: 120, y: 200 },
  });
  const newNode2 = generateRandomNode({
    type: 'llm',
    data: { name: '大模型' },
    position: { x: 400 + 200, y: 20 },
  })
  const newNode3 = generateRandomNode({
    type: 'code',
    data: { name: '代码' },
    position: { x: 400 + 200, y: 200 },
  })
  const newNode4 = generateRandomNode({
    type: 'out',
    data: { name: '输出' },
    position: { x: 400 + 200, y: 380 * 2 },
  })
  const newNode5 = generateRandomNode({
    type: 'end',
    data: { name: '结束' },
    position: { x: 400 * 4 + 200, y: 380 },
  })
  addNodes([newNode1, newNode2, newNode3, newNode4, newNode5]);

  const newEdge = createEdge({
    source: newNode1.id,
    target: newNode2.id,
    type: 'custom',
  });
  const newEdge2 = createEdge({
    source: newNode2.id,
    target: newNode3.id,
    type: 'custom',
  });
  const newEdge3 = createEdge({
    source: newNode3.id,
    target: newNode4.id,
    type: 'custom',
  });
  addEdges([newEdge, newEdge2, newEdge3]);
  
})

onConnect((params) => {
  console.log('onConnect', params);
  const newEdge = createEdge({
    source: params.source,
    target: params.target,
    type: 'custom',
  });
  addEdges([newEdge]);
})

const nodeInfoVisible = ref(false);
const currentNodeInfo = ref({});
const clickNode = (info) => {
  console.log('clickNode_info:', info);
  currentNodeInfo.value = info.node;
  nodeInfoVisible.value = true;
}

onPaneClick(() => {
  nodeInfoVisible.value = false;
})
onNodeDragStart(() => {
  nodeInfoVisible.value = false;
})
const clickClose = () => {
  nodeInfoVisible.value = false;
}

// 创建通用节点
const generateRandomNode = (item = {}) => {
  return {
    id: Math.random().toString(36).substr(2, 9),
    type: 'start', // input node
    data: { name: '开始节点' },
    position: {
      x: Math.random() * window.innerWidth - 75,
      y: Math.random() * window.innerHeight - 75
    },
    ...item,
  }
}
const createEdge = (item = {}) => {
  return {
    id: Math.random().toString(36).substr(2, 9),
    source: item.source,
    target: item.target,
    animated: item.animated || false,
    // style: { stroke: '#f6ab6c' },
    ...item,
  }
}

const removePendingNode = () => {
  pendingNodeId && removeNodes(pendingNodeId);
}

const goBack = () => {
  history.back()
}
const clickAddNode = (event) => {
  const newNode = generateRandomNode();
  addNodes([newNode]);
}
const exportWorkflow = () => {
  exportImg(vueFlowRef.value);
}
const _setView = () => {
  // flowInstance.value.setViewport({ x: 100, y: 100, zoom: 1 });
  fitView();
}

const moveEvent = e => {
  const element = document.elementFromPoint(e.clientX, e.clientY);
  if (element?.closest('.vue-flow__handle')) {
    isSpecialArea = true;
  } else {
    isSpecialArea = false;
  }
}
const clickEvent = e => {
  if (!nodeDialogVisible.value) return;
  const element = document.elementFromPoint(e.clientX, e.clientY);
  // console.log('clickEvent: ', element);
  if (!element?.closest('.node-list-dialog')) {
    nodeDialogVisible.value = false;
    removePendingNode();
  }
}
const keyupEvent = e => {}

onMounted(() => {
  document.addEventListener('mousemove', moveEvent);
  document.addEventListener('click', clickEvent);
})
onUnmounted(() => {
  document.removeEventListener('mousemove', moveEvent);
  document.removeEventListener('click', clickEvent);
})

const miniMapFlag = ref(false);
const onMiniMap = (event) => {
  console.log('onMiniMap: ', event);
  miniMapFlag.value = event;
}

const onAutoLayout = () => {
  const direction = 'LR'; // 支持 TB（上到下）、BT（下到上）、LR（左到右）、RL（右到左）四种布局方向
  // const direction = 'TD';
  const res = layout(getNodes.value, getEdges.value, direction);
  console.log('layout: ', res);
  res.forEach(item => {
    updateNode(item.id, {
      position: item.position,
    })
  })
  nextTick(() => {
    fitView()
  })
}
</script>

<style lang="scss" scoped>

.page1 {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.nodeinfo-wrap {
  width: 450px;
  height: calc(100% - 20px);
  border: 1px solid #ccc;
  border-radius: 10px;
  overflow: hidden;
  transform: scale(0);
  transform-origin: right;
  animation: animate 0.1s ease-out forwards;
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