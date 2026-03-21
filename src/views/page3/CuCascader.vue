<template>
  <div class="m-4">
    <div class="flex items-center">
      <el-cascader v-model="cascaderValue" :options="options" :props="cascaderProps2" clearable />
      <div class="ml-20">{{ labelStr }}</div>
      <div class="ml-20">{{ optionsMap2[ cascaderValue[0] ] }}</div>
    </div>
    <p>Using slots allows for more flexible control over the display.</p>
    <el-cascader v-model="cascaderValue" :options="options" :props="cascaderProps1" clearable>
      <template #tag="{ data }">
        <el-tag
          v-for="(item, index) in getTags(data)"
          :key="item"
          :color="index % 2 === 0 ? '#FFDE0A' : ''"
        >
          {{ item }}
        </el-tag>
      </template>
    </el-cascader>
    <p>Display top-level tags only</p>
    <el-cascader :options="options" :props="cascaderProps1" clearable>
      <template #tag="{ data }">
        <el-tag v-for="item in getTopLevelTags(data)" :key="item">
          {{ item }}
        </el-tag>
      </template>
    </el-cascader>
  </div>
</template>

<script lang="ts" setup>
import type { Tag } from 'element-plus'
import { computed, ref } from 'vue'

const cascaderProps1 = { multiple: true }
const cascaderProps2 = { expandTrigger: 'hover' as const };
const cascaderValue = ref([]);
const labelStr = computed(() => {
  let str = '', lastIndex = cascaderValue.value.length - 1;
  cascaderValue.value.forEach((_, i) => str += `${optionsMap[_]}${i === lastIndex ? '' : '*'}`);
  return str;
})

const options = [
  {
    value: '1234',
    label: '大模型-1',
    nodeType: 'llm',
    type: 'String',
    children: [
      { value: 'output', label: 'output-label' },
      { value: 'callback', label: 'callback-label' },
    ]
  },
  {
    value: 1,
    label: 'Asia8888888888888',
    nodeType: 'region',
    children: [
      {
        value: 2,
        label: 'China',
        children: [
          { value: 3, label: 'Beijing' },
          { value: 4, label: 'Shanghai' },
          { value: 5, label: 'Hangzhou' },
        ],
      },
      {
        value: 6,
        label: 'Japan',
        children: [
          { value: 7, label: 'Tokyo' },
          { value: 8, label: 'Osaka' },
          { value: 9, label: 'Kyoto' },
        ],
      },
      {
        value: 10,
        label: 'Korea',
        children: [
          { value: 11, label: 'Seoul' },
          { value: 12, label: 'Busan' },
          { value: 13, label: 'Taegu' },
        ],
      },
    ],
  },
  {
    value: 14,
    label: 'Europe',
    nodeType: 'ab',
    type: 'String',
    children: [
      {
        value: 15,
        label: 'France',
        children: [
          { value: 16, label: 'Paris' },
          { value: 17, label: 'Marseille' },
          { value: 18, label: 'Lyon' },
        ],
      },
      {
        value: 19,
        label: 'UK',
        children: [
          { value: 20, label: 'London' },
          { value: 21, label: 'Birmingham' },
          { value: 22, label: 'Manchester' },
        ],
      },
    ],
  },
  {
    value: 23,
    label: 'North America',
    nodeType: 'out',
    type: 'Object',
    children: [
      {
        value: 24,
        label: 'US',
        children: [
          { value: 25, label: 'New York' },
          { value: 26, label: 'Los Angeles' },
          { value: 27, label: 'Washington' },
        ],
      },
      {
        value: 28,
        label: 'Canada',
        children: [
          { value: 29, label: 'Toronto' },
          { value: 30, label: 'Montreal' },
          { value: 31, label: 'Ottawa' },
        ],
      },
    ],
  },
]
const getTags = (data: Tag[]) => {
  console.log('getTags_data:', data)
  return data.map((item) => item.text)
}
const getTopLevelTags = (data: Tag[]) => {
  const set: Set<string> = new Set()
  for (const datum of data) {
    let parent = datum.node?.parent
    while (parent && parent.level !== 1) {
      parent = parent.parent
    }
    const label = parent?.data?.label
    label && set.add(label)
  }
  return [...set]
}

let optionsMap2 = {};
let optionsMap = dealOptions(options);
function dealOptions(list) {
  let result = {};
  fn(list);
  return result;

  function fn(_options) {
    if (!_options.length) return;
    for (let i = 0; i < _options.length; i++) {
      let { value, label, children, nodeType, type } = _options[i];
      result[value] = label;
      if (nodeType) optionsMap2[value] = { value, label, nodeType, type };
      children?.length && fn(children);
    }
  }
}
const getLabel = () => {}
</script>