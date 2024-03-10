<template>
  <div ref="parentRef" :class="classname" :style="style">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { CSSProperties, HTMLAttributes, computed, onMounted, onUnmounted, ref, watch } from 'vue';
import {
  WaterMarkBaseOptions,
  WaterMarkOptions,
  getWaterMark,
  setWatermark,
  watchWaterMarkChange,
} from './utils';

type WaterMarkProps = WaterMarkBaseOptions & {
  /** 自定义水印样式 */
  style?: CSSProperties;
  /** 自定义水印类名 */
  class?: string;
};
const props = withDefaults(defineProps<WaterMarkProps>(), {
  text: 'xialuxiaohuo',
  fontSize: 16,
  rotate: -45,
  gap: 10,
  fontColor: '#999',
  class: '',
  style: () => ({}),
})

const style = computed<HTMLAttributes['style']>(() => {
  return {
    position: 'relative',
    ...props?.style,
  }
})
const classname = computed(() => {
  return `watermark-contain ${props?.class}`
})

const watermarkOptions = ref<WaterMarkOptions>()
const parentRef = ref<HTMLDivElement>();
const ob = ref<MutationObserver>();

const getWatermarkOptions = () => {
  const { fontSize,
    rotate,
    text,
    gap,
    fontColor, } = props;
  watermarkOptions.value = getWaterMark({
    fontSize,
    rotate,
    text,
    gap,
    fontColor,
  });
};

const resetWatermark = () => setWatermark(
  parentRef.value as HTMLDivElement,
  watermarkOptions.value as WaterMarkOptions
);

onMounted(() => {
  observe()
})

const observe = () => {
  getWatermarkOptions();
  resetWatermark();
  ob.value = watchWaterMarkChange(
    parentRef.value as HTMLDivElement,
    watermarkOptions.value as WaterMarkOptions
  );
  ob.value?.observe(parentRef.value as HTMLDivElement, {
    attributes: true,
    childList: true,
    subtree: true,
  });
}


const disconnect = () => {
  ob.value?.disconnect();
  const id = watermarkOptions.value?.waterMarkId || '';
  if (id) {
    document.getElementById?.(id)?.remove();
  }
}

onUnmounted(() => disconnect())

watch(() => [
  props.fontSize,
  props.rotate,
  props.text,
  props.gap,
  props.fontColor,
], () => {
  disconnect()
  observe()
})
</script>

<style scoped></style>