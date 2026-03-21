<script setup>
import { BaseEdge, EdgeLabelRenderer, getBezierPath, useVueFlow } from '@vue-flow/core'
import { computed, useAttrs, ref } from 'vue'
import { CirclePlusFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import { v4 as uuidv4 } from 'uuid'

const emit = defineEmits(['clickPlus', 'clickClose'])

const attrs = useAttrs()
const { data, id } = attrs
const { onEdgeMouseEnter, onEdgeMouseLeave, onEdgeClick, getEdges, removeEdges } = useVueFlow()

const isHover = ref(false)
const path = computed(() => getBezierPath(attrs))
const strokeColor = computed(() => {
  const currentEdge = getEdges.value.find(edge => edge.id === id)
  return (attrs.selected || (currentEdge && isHover.value)) ? '#37d0ff' : '#4d53e8'
})


onEdgeMouseEnter(({event, edge}) => {
  // console.log('mouse enter', event, edge)
  if (edge.id === id) isHover.value = true
})

onEdgeMouseLeave(({event, edge}) => {
  // console.log('mouse leave', event, edge)
  if (edge.id === id) isHover.value = false
})

const onLabelMouseEnter = () => {
  isHover.value = true
}

const onLabelMouseLeave = () => {
  isHover.value = false
}

const clickPlus = (e) => {
  const { x, y } = e;
  const { source, target, sourceNode } = attrs;
  emit('clickPlus', { x, y, sourceNode, edgeInfo: { id, source, target } });
}
const clickClose = () => {
  console.log('clickClose')
  emit('clickClose', attrs)
  removeEdges(id)
}

const arrowId = uuidv4()
</script>

<template>
  <svg>
    <defs>
      <marker
        :id="arrowId"
        markerWidth="10"
        markerHeight="10"
        refX="10"
        refY="5"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path d="M0,0 L10,5 L0,10" fill="none" :stroke="strokeColor" />
        <!-- <path d="M0,0 L10,5 L0,10 L2,5 L0,0" :fill="strokeColor" /> -->
        <!-- <path d="M0,0 L10,5 L0,10 L2,5 L0,0" fill="transparent" :stroke="strokeColor" /> -->
        <!-- <path d="M0,0 L10,5 L0,10 Z" :fill="strokeColor" stroke="#fff" /> -->
      </marker>
    </defs>
  </svg>
  <!-- You can use the `BaseEdge` component to create your own custom edge more easily -->
  <BaseEdge
    :id="attrs.id"
    :path="path[0]"
    :style="{ stroke: strokeColor, strokeWidth: attrs.selected ? 3 : 2 }"
    :marker-end="`url(#${arrowId})`"
  />

  <!-- Use the `EdgeLabelRenderer` to escape the SVG world of edges and render your own custom label in a `<div>` ctx -->
  <EdgeLabelRenderer v-if="attrs.selected || isHover">
    <div @mouseenter="onLabelMouseEnter" @mouseleave="onLabelMouseLeave"
      :style="{
        pointerEvents: 'all',
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`,
      }"
      class="nodrag nopan"
    >
      <el-icon class="label-btn" color="#37d0ff" @click="clickPlus"><CirclePlusFilled /></el-icon>
      <el-icon class="label-btn" color="#f33333" @click="clickClose"><CircleCloseFilled /></el-icon>
    </div>
  </EdgeLabelRenderer>
</template>

<style scoped lang="scss">
.label-btn {
  margin: 0 2px;
  font-size: 16px;
  cursor: pointer;
  transition: all .3s;
  &:hover {
    transform: scale(1.2);
  }
  &::before {
    content: '';
    position: absolute;
    width: 70%;
    height: 70%;
    border-radius: 50%;
    background: #fff;
    z-index: -1;
  }
}
</style>