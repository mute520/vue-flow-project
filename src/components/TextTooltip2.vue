<template>
  <div class="text-tooltip">
    <div class="text hide">{{ props.content }}</div>
    <el-tooltip :content="props.content" placement="top" show-after="500">
      <div class="text is-tooltip is-ellipsis-2" ref="parentRef">{{ props.content }}</div>
    </el-tooltip>
    <div class="text">{{ props.content }}</div>
  </div>
  {{ distance }}
</template>

<script setup>
import { onMounted, onUpdated, ref } from 'vue';

const props = defineProps({
  content: {
    type: String,
    default: ''
  }
})

const parentRef = ref(null);
const distance = ref(0);

const calculateDistance = () => {
  if (!parentRef.value) return;
  
  const parent = parentRef.value;
  const text = props.content;
  const lastChar = text.slice(-1);
  
  // 创建临时 span
  const span = document.createElement('span');
  span.textContent = lastChar;
  span.style.visibility = 'hidden';
  // 插入 DOM
  parent.appendChild(span);
  // 计算
  const parentRight = parent.getBoundingClientRect().right;
  const { right, width } = span.getBoundingClientRect();
  const lastCharRight =  right - width;
  distance.value = Math.round(parentRight - lastCharRight); // 取整

  // console.log(`最后一个字距离右边的距离: ${distance.value}px`);
  // 移除
  parent.removeChild(span);
};

// 组件挂载后和更新后都计算一次
onMounted(calculateDistance);
window.addEventListener('resize', calculateDistance);


function calculateLastCharDistance() {
  const parent = document.getElementById('parent');
  const text = parent.innerText;
  
  // 1. 获取最后一个字
  const lastChar = text.slice(-1);
  
  // 2. 创建一个临时的 span 包裹最后一个字
  const span = document.createElement('span');
  span.textContent = lastChar;
  span.style.visibility = 'hidden'; // 隐藏，避免影响页面布局
  // span.style.color = 'red'; // 调试时可开启查看位置
  
  // 3. 将 span 插入到父容器末尾
  // 注意：必须插入到 DOM 中才能获取准确的 offsetLeft
  parent.appendChild(span);
  
  // 4. 计算距离
  // span.offsetLeft: span 左边缘距离 parent 左边缘的距离
  // span.offsetWidth: span 自身的宽度
  const parentWidth = parent.clientWidth; // 父容器可视宽度
  const lastCharRightPos = span.offsetLeft + span.offsetWidth;
  
  const distance = parentWidth - lastCharRightPos;
  
  console.log(`最后一个字距离右边的距离: ${distance}px`);
  
  // 5. 清理临时 span
  parent.removeChild(span);
  
  return distance;
}

// 执行计算
  // calculateLastCharDistance();
// 监听窗口大小变化（因为父容器宽度变化会影响结果）
// window.addEventListener('resize', calculateLastCharDistance);

</script>

<style lang="scss" scoped>
$height: 1.5em;
$height2: 3em;

.text-tooltip {
  border: 1px solid #000;
  max-height: $height2;
  overflow: hidden;
  .text {
    max-height: $height2;
  }
  .is-tooltip {
    margin-top: -$height2;
    color: red;
  }
  .hide {
    visibility: hidden;
    pointer-events: none;
  }
}

.is-ellipsis-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

</style>