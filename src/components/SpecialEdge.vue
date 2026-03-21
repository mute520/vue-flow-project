<script setup>
import { BaseEdge, EdgeLabelRenderer, getBezierPath, useVueFlow } from '@vue-flow/core'
import { computed, useAttrs, ref } from 'vue'

const attrs = useAttrs()
const { data, id } = attrs
const { onEdgeMouseEnter, onEdgeMouseLeave, onEdgeClick, getEdges } = useVueFlow()

const isHover = ref(false)
const path = computed(() => getBezierPath(attrs))
const strokeColor = computed(() => {
  const currentEdge = getEdges.value.find(edge => edge.id === id)
  return (attrs.selected || (currentEdge && isHover.value)) ? '#1976d2' : '#ff0000'
})


onEdgeMouseEnter(({event, edge}) => {
  // console.log('mouse enter', event, edge)
  if (edge.id === id) isHover.value = true
})

onEdgeMouseLeave(({event, edge}) => {
  // console.log('mouse leave', event, edge)
  if (edge.id === id) isHover.value = false
})

</script>

<script>
export default {
  inheritAttrs: false,
}
</script>

<template>
  <svg style="position:absolute;overflow:visible;pointer-events:none;width:0;height:0">
    <defs>
      <marker
        id="arrow"
        markerWidth="10"
        markerHeight="10"
        refX="10"
        refY="5"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path d="M0,0 L10,5 L0,10 Z" fill="#1976d2" />
      </marker>
    </defs>
  </svg>
  <!-- You can use the `BaseEdge` component to create your own custom edge more easily -->
  <BaseEdge
    :path="path[0]"
    :style="{ stroke: strokeColor, strokeWidth: attrs.selected ? 3 : 2, cursor: 'default' }"
    :marker-end="'url(#arrow)'"
  />

  <!-- Use the `EdgeLabelRenderer` to escape the SVG world of edges and render your own custom label in a `<div>` ctx -->
  <EdgeLabelRenderer>
    <div v-show="attrs.selected || isHover"
      :style="{
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`
      }"
      class="nodrag nopan"
    >
      <span class="edge-plus">+</span>
    </div>
  </EdgeLabelRenderer>
</template>

<style scoped>
.edge-plus {
  display: inline-block;
  width: 24px;
  height: 24px;
  background: #fff;
  border: 2px solid #1976d2;
  color: #1976d2;
  border-radius: 50%;
  text-align: center;
  line-height: 20px;
  font-size: 20px;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.15);
  cursor: pointer;
  user-select: none;
}
</style>