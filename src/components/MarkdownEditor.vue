<template>
  <el-button @click="getContent">获取内容</el-button>
  <el-button @click="setContent">设置内容</el-button>
  <!-- 1. 使用 ref 绑定 DOM 元素，而不是用 class 选择器 -->
  <div ref="editorRoot" class="milkdown-wrapper"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Crepe } from '@milkdown/crepe'
import '@milkdown/crepe/theme/common/style.css'
import '@milkdown/crepe/theme/frame.css' // 引入 Frame 主题样式

// 2. 定义 ref 引用 DOM
const editorRoot = ref<HTMLElement | null>(null)
let crepeInstance: Crepe | null = null

const getContent = () => {
  if (crepeInstance) {
    console.log('crepeInstance: ', crepeInstance)
    console.log(crepeInstance.getMarkdown())
    // crepeInstance.setReadonly(true)
  }
}
const setContent = () => {
  if (crepeInstance) {
    crepeInstance.editor.action((ctx) => {
      ctx.set('content', '# 555555 Hello, Milkdown!\n\n这是优化后的 Crepe 编辑器。');
    })
  }
}

// 3. 在 onMounted 中初始化，确保 DOM 已经渲染
onMounted(async () => {
  if (!editorRoot.value) return

  crepeInstance = new Crepe({
    root: editorRoot.value, // 直接传递 DOM 元素
    defaultValue: '# Hello, Milkdown!\n\n这是优化后的 Crepe 编辑器。',
    features: {
      // 可以在这里配置 Crepe 的功能特性

    }
  })

  try {
    await crepeInstance.create()
    console.log('Milkdown Crepe initialized successfully.')
    init();
  } catch (e) {
    console.error('Failed to initialize Milkdown:', e)
  }
})

function init() {
  crepeInstance?.on((listener) => {
    listener.markdownUpdated((markdown) => {
      console.log("Markdown updated:", markdown);
    });

    listener.updated((doc) => {
      console.log("Document updated", doc);
    });

    listener.focus(() => {
      console.log("Editor focused");
    });

    listener.blur(() => {
      console.log("Editor blurred");
    });
  });
}

// 4. 在组件销毁前清理实例，防止内存泄漏
onBeforeUnmount(() => {
  if (crepeInstance) {
    crepeInstance.destroy()
    crepeInstance = null
  }
})
</script>

<style scoped lang="scss">
.milkdown-wrapper {
  min-height: 400px; /* 稍微增加高度以便更好地展示 */
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  position: relative; /* 确保绝对定位的内部元素（如悬浮菜单）正确显示 */
  background-color: #fff; /* 确保背景色 */
}

:deep(.milkdown) .ProseMirror {
  padding: 16px;
}
</style>
