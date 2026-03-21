import { useVueFlow } from "@vue-flow/core";
import { ref } from "vue";

export default function useAlignGuide({ flowId, threshold }) {
  const THRESHOLD = threshold || 5; // 误差阈值
  const BREAK_SNAP_THRESHOLD = THRESHOLD * 3; // 脱离对齐的阈值（吸附后需要移动超过此距离才能脱离）
  const guideLines = ref([]);

  // 吸附状态追踪
  const snapState = ref({
    isSnapped: false,
    snapPosition: { x: 0, y: 0 }, // 记录吸附时的目标位置
    snappedAxes: { x: false, y: false } // 记录哪些轴已吸附
  });

  const { getNodes, getViewport, onNodeDrag, onNodeDragStop } = useVueFlow(flowId);

  function getNodeBounds(node) {
    const width = node.dimensions?.width ?? 120
    const height = node.dimensions?.height ?? 60
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

  function getAlignGuides(currentBoundsList, otherBoundsList) {
    const guides = []

    for (const boundsA of currentBoundsList) {
      for (const boundsB of otherBoundsList) {
        // 水平线比较
        if (Math.abs(boundsA.top - boundsB.top) < THRESHOLD)
          guides.push({ type: 'h', position: boundsB.top })
        if (Math.abs(boundsA.bottom - boundsB.bottom) < THRESHOLD)
          guides.push({ type: 'h', position: boundsB.bottom })
        if (Math.abs(boundsA.centerY - boundsB.centerY) < THRESHOLD)
          guides.push({ type: 'h', position: boundsB.centerY })

        // 垂直线比较
        if (Math.abs(boundsA.left - boundsB.left) < THRESHOLD)
          guides.push({ type: 'v', position: boundsB.left })
        if (Math.abs(boundsA.right - boundsB.right) < THRESHOLD)
          guides.push({ type: 'v', position: boundsB.right })
        if (Math.abs(boundsA.centerX - boundsB.centerX) < THRESHOLD)
          guides.push({ type: 'v', position: boundsB.centerX })
      }
    }

    return guides
  }

  /**
   * 获取吸附偏移量和目标位置
   * 优化：优先级排序 + 同时检测 X 和 Y 方向
   */
  function getSnapInfo(currentBoundsList, otherBoundsList, currentSnapState) {
    let bestSnapX = { offset: 0, targetX: null, priority: 0 }
    let bestSnapY = { offset: 0, targetY: null, priority: 0 }

    // 吸附优先级：中心点 > 边缘（left/top > right/bottom）
    const CENTER_PRIORITY = 3
    const LEFT_TOP_PRIORITY = 2
    const RIGHT_BOTTOM_PRIORITY = 1

    for (const boundsA of currentBoundsList) {
      for (const boundsB of otherBoundsList) {
        // X 方向检测
        const diffCenterX = boundsB.centerX - boundsA.centerX
        const diffLeft = boundsB.left - boundsA.left
        const diffRight = boundsB.right - boundsA.right

        if (Math.abs(diffCenterX) < THRESHOLD && Math.abs(diffCenterX) > bestSnapX.priority * 0.1) {
          bestSnapX = { offset: diffCenterX, targetX: boundsB.centerX - boundsA.width / 2, priority: CENTER_PRIORITY }
        }
        if (Math.abs(diffLeft) < THRESHOLD && Math.abs(diffLeft) > bestSnapX.priority * 0.1) {
          bestSnapX = { offset: diffLeft, targetX: boundsB.left, priority: LEFT_TOP_PRIORITY }
        }
        if (Math.abs(diffRight) < THRESHOLD && Math.abs(diffRight) > bestSnapX.priority * 0.1) {
          bestSnapX = { offset: diffRight, targetX: boundsB.right - boundsA.width, priority: RIGHT_BOTTOM_PRIORITY }
        }

        // Y 方向检测
        const diffCenterY = boundsB.centerY - boundsA.centerY
        const diffTop = boundsB.top - boundsA.top
        const diffBottom = boundsB.bottom - boundsA.bottom

        if (Math.abs(diffCenterY) < THRESHOLD && Math.abs(diffCenterY) > bestSnapY.priority * 0.1) {
          bestSnapY = { offset: diffCenterY, targetY: boundsB.centerY - boundsA.height / 2, priority: CENTER_PRIORITY }
        }
        if (Math.abs(diffTop) < THRESHOLD && Math.abs(diffTop) > bestSnapY.priority * 0.1) {
          bestSnapY = { offset: diffTop, targetY: boundsB.top, priority: LEFT_TOP_PRIORITY }
        }
        if (Math.abs(diffBottom) < THRESHOLD && Math.abs(diffBottom) > bestSnapY.priority * 0.1) {
          bestSnapY = { offset: diffBottom, targetY: boundsB.bottom - boundsA.height, priority: RIGHT_BOTTOM_PRIORITY }
        }
      }
    }

    return {
      dx: bestSnapX.offset,
      dy: bestSnapY.offset,
      targetX: bestSnapX.targetX,
      targetY: bestSnapY.targetY,
      canSnapX: bestSnapX.priority > 0,
      canSnapY: bestSnapY.priority > 0
    }
  }

  onNodeDrag(({ event, node, nodes }) => {
    const selectedIds = new Set(nodes.map(n => n.id))
    // const draggedNodes = getNodes.value.filter(n => selectedIds.has(n.id))
    const otherNodes = getNodes.value.filter(n => !selectedIds.has(n.id))

    const currentBoundsList = nodes.map(getNodeBounds)
    const otherBoundsList = otherNodes.map(getNodeBounds)
    const { x, y, zoom } = getViewport()

    // 计算吸附信息
    const snapInfo = getSnapInfo(currentBoundsList, otherBoundsList, snapState.value)

    // 计算辅助线（转换到视口坐标系）
    const guides = getAlignGuides(currentBoundsList, otherBoundsList)
    guideLines.value = guides.map(g => ({
      type: g.type,
      position: g.type === 'h' ? g.position * zoom + y : g.position * zoom + x
    }))

    // 应用吸附逻辑（优化版：磁性吸附 + 状态保持）
    if (snapInfo.canSnapX || snapInfo.canSnapY) {
      // 检测到新的吸附机会
      snapState.value = {
        isSnapped: true,
        snapPosition: {
          x: snapInfo.targetX ?? node.position.x,
          y: snapInfo.targetY ?? node.position.y
        },
        snappedAxes: {
          x: snapInfo.canSnapX,
          y: snapInfo.canSnapY
        }
      }

      // 强制吸附到目标位置（而不是累加偏移）
      nodes.forEach(n => {
        if (snapInfo.canSnapX) n.position.x = snapInfo.targetX + (n.position.x - node.position.x)
        if (snapInfo.canSnapY) n.position.y = snapInfo.targetY + (n.position.y - node.position.y)
      })
    } else if (snapState.value.isSnapped) {
      // 已吸附，检查是否需要脱离
      const currentX = node.position.x
      const currentY = node.position.y
      const snapX = snapState.value.snapPosition.x
      const snapY = snapState.value.snapPosition.y

      // 计算距离吸附位置的偏移
      const distanceFromSnap = Math.sqrt(
        Math.pow(currentX - snapX, 2) + Math.pow(currentY - snapY, 2)
      )

      // 如果距离超过脱离阈值，解除吸附状态
      if (distanceFromSnap > BREAK_SNAP_THRESHOLD) {
        snapState.value.isSnapped = false
        snapState.value.snappedAxes = { x: false, y: false }
      } else {
        // 仍然在吸附范围内，保持对齐（仅对已吸附的轴）
        const deltaX = currentX - node.position.x
        const deltaY = currentY - node.position.y

        nodes.forEach(n => {
          // 强制保持已吸附轴的位置
          if (snapState.value.snappedAxes.x) {
            n.position.x = snapX + (n.position.x - node.position.x)
          }
          if (snapState.value.snappedAxes.y) {
            n.position.y = snapY + (n.position.y - node.position.y)
          }
        })
      }
    }
  })

  onNodeDragStop(() => {
    guideLines.value = []
    // 重置吸附状态
    snapState.value = {
      isSnapped: false,
      snapPosition: { x: 0, y: 0 },
      snappedAxes: { x: false, y: false }
    }
  })

  return {
    guideLines,
    getNodeBounds,
    getAlignGuides,
    getSnappedOffset: () => snapState.value
  }
}
