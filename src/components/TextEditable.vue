<template>
  <div>
    <el-input v-if="editing" v-model="text" @input="onInput" @blur="onBlur" class="nodrag" ref="inputRef"></el-input>
    <span v-else>{{ text }}</span>
  </div>
</template>

<script setup>
import { nextTick, ref } from 'vue';

const emit = defineEmits(['update:modelValue']);
const props = defineProps({
  modelValue: {
    type: String,
    default: 'Editable text'
  }
})
const editing = ref(false);
const text = ref(props.modelValue);
const inputRef = ref(null);

const onInput = (e) => {
  emit('update:modelValue', e);
}

const onFocus = () => {
  editing.value = true;
  nextTick(() => {
    console.log('onFocus', inputRef.value);
    inputRef.value?.focus();
  })
  console.log('onFocus', editing.value);
}

const onBlur = () => {
  editing.value = false;
  console.log('onBlur', editing.value);
}

defineExpose({
  onFocus,
  onBlur
});

</script>