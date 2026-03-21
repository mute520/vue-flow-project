import { useVueFlow } from "@vue-flow/core";
import { ref } from "vue";

export default function useAlignGuide({ flowId, threshold }) {
  const THRESHOLD = threshold || 5; // 误差阈值
  const guideLines = ref([]);
  const { getNodes, getViewport, onNodeDrag, onNodeDragStop } = useVueFlow(flowId);
  function getNodeBounds(node) {
    const width = node.dimensions?.width ?? 120
    const height = node.dimensions?.height ?? 60
    // const width = node.style?.width ?? 120
    // const height = node.style?.height ?? 60
    return {
      left: node.position.x,
      right: node.position.x + width,
      top: node.position.y,
      bottom: node.position.y + height,
      centerX: node.position.x + width / 2,
      centerY: node.position.y + height / 2,
      width,
      height,
    }
  }

  function getAlignGuides(currentBoundsList, otherNodes) {
    const guides = []
    const otherBoundsList = otherNodes.map(getNodeBounds)
    const { x, y, zoom } = getViewport()

    for (const boundsA of currentBoundsList) {
      for (const boundsB of otherBoundsList) {
        // 水平线比较
        if (Math.abs(boundsA.top - boundsB.top) < THRESHOLD)
          guides.push({ type: 'h', position: boundsB.top * zoom + y })
        if (Math.abs(boundsA.bottom - boundsB.bottom) < THRESHOLD)
          guides.push({ type: 'h', position: boundsB.bottom * zoom + y })
        if (Math.abs(boundsA.centerY - boundsB.centerY) < THRESHOLD)
          guides.push({ type: 'h', position: boundsB.centerY * zoom + y })

        // 垂直线比较
        if (Math.abs(boundsA.left - boundsB.left) < THRESHOLD)
          guides.push({ type: 'v', position: boundsB.left * zoom + x })
        if (Math.abs(boundsA.right - boundsB.right) < THRESHOLD)
          guides.push({ type: 'v', position: boundsB.right * zoom + x })
        if (Math.abs(boundsA.centerX - boundsB.centerX) < THRESHOLD)
          guides.push({ type: 'v', position: boundsB.centerX * zoom + x })
      }
    }

    return guides
  }

  function getSnappedOffset(currentBoundsList, otherNodes) {
    let dx = 0
    let dy = 0
    const otherBoundsList = otherNodes.map(getNodeBounds)

    for (const boundsA of currentBoundsList) {
      for (const boundsB of otherBoundsList) {
        if (Math.abs(boundsA.centerX - boundsB.centerX) < THRESHOLD) {
          dx = boundsB.centerX - boundsA.centerX
          break
        }
        if (Math.abs(boundsA.left - boundsB.left) < THRESHOLD) {
          dx = boundsB.left - boundsA.left
        } else if (Math.abs(boundsA.right - boundsB.right) < THRESHOLD) {
          dx = boundsB.right - boundsA.right
        }

        if (Math.abs(boundsA.centerY - boundsB.centerY) < THRESHOLD) {
          dy = boundsB.centerY - boundsA.centerY
          break
        }
        if (Math.abs(boundsA.top - boundsB.top) < THRESHOLD) {
          dy = boundsB.top - boundsA.top
        } else if (Math.abs(boundsA.bottom - boundsB.bottom) < THRESHOLD) {
          dy = boundsB.bottom - boundsA.bottom
        }
      }
    }

    return { dx, dy }
  }

  onNodeDrag(({ event, node, nodes }) => {
    // console.log('use-onNodeDrag', node, nodes)
    const selectedIds = new Set(nodes.map(n => n.id))
    const draggedNodes = getNodes.value.filter(n => selectedIds.has(n.id))
    const otherNodes = getNodes.value.filter(n => !selectedIds.has(n.id))

    const currentBoundsList = draggedNodes.map(getNodeBounds)
    guideLines.value = getAlignGuides(currentBoundsList, otherNodes)

    const { dx, dy } = getSnappedOffset(currentBoundsList, otherNodes)

    // console.log('onNodeDrag_', dx, dy, guideLines.value.length)
    draggedNodes.forEach(n => {
      n.position.x += dx
      n.position.y += dy
    })
  })

  onNodeDragStop((event) => {
    guideLines.value = []
  })

  return { guideLines, getNodeBounds, getAlignGuides, getSnappedOffset }
}