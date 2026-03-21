<script setup>
import { BaseEdge, EdgeLabelRenderer, getBezierPath, useVueFlow } from '@vue-flow/core'
import { computed, useAttrs, ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'

const attrs = useAttrs()
const path = computed(() => getBezierPath(attrs))
const strokeColor = '#37d0ff'

const arrowId = uuidv4();
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
      </marker>
    </defs>
  </svg>
  <!-- You can use the `BaseEdge` component to create your own custom edge more easily -->
  <BaseEdge
    :id="attrs.id"
    :path="path[0]"
    :style="{ stroke: strokeColor, strokeWidth: 2, cursor: 'default' }"
    :marker-end="`url(#${arrowId})`"
  />
</template>