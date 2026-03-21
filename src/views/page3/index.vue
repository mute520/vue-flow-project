<template>
  <MarkdownEditor />
  <div class="flex">
    <div class="w-[150px] border border-black" style="padding-top: 140px;">{{ text }}</div>
    <div class="page2">
      <TextTooltip :content="text" />
      <div>我是下一行1。。。</div>
      <TextTooltip2 :content="text" />
      <div>我是下一行2。。。</div>
      <!-- <TextTooltipOld :text="text" /> -->
      <!-- <div>我是下一行3。。。</div> -->
    </div>
  </div>
  <CuCascader />
</template>

<script setup>
import { ref } from 'vue';
import TextTooltip from '@/components/TextTooltip.vue';
import TextTooltip2 from '@/components/TextTooltip2.vue';
import TextTooltipOld from '@/components/TextTooltipOld.vue';
import CuCascader from './CuCascader.vue';
import MarkdownEditor from '@/components/MarkdownEditor.vue';

const text = ref('根据具体场景，您可能想要将此更改为“navigation”');

</script>

<style lang="scss" scoped>
.page2 {
  width: 300px;
  width: 60%;
  height: 500px;
  padding: 140px 10px 0;
  border: 1px solid #000;
  resize: both;
  overflow: auto;
}
</style>