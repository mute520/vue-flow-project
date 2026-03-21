<template>
  <div class="pending-node">
    <Handle type="source" :position="Position.Left" />
    
  </div>
</template>

<script setup>
import { Handle, Position } from '@vue-flow/core'

</script>

<style lang="scss" scoped>
.pending-node {
  width: 10px;
  height: 10px;
  border: 1px solid #f00;
}
</style>
