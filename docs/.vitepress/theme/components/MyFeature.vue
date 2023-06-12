<!--
 * @Author: hfWang
 * @Date: 2022-09-14 20:49:50
 * @LastEditTime: 2022-10-19 20:11:55
 * @Description: file content
 * @FilePath: \blog\docs\.vitepress\theme\MyComps\MyFeature.vue
-->
<script setup lang="ts">
const props = defineProps<{
  title: string
  details?: string
  icon?: string
  url?: string
  _blank?: boolean
}>()
const jumpToTargetUrl = () => {
  if (!props.url) return
  const type = props._blank ? '_blank' : '_self'
  let url = props.url
  if (!props._blank) {
    url = location.origin + url
  }
  let a = document.createElement('a') as HTMLAnchorElement | null
  a!.setAttribute('href', url)
  a!.setAttribute('target', type)
  a!.click()
  setTimeout(() => {
    a = null
  }, 300)
}
</script>

<script lang="ts">
export default {
  name: 'MyFeature',
}
</script>

<template>
  <article class="VPFeature" @click="jumpToTargetUrl">
    <div v-if="props.icon" class="icon">{{ props.icon }}</div>
    <h2 class="title">{{ props.title }}</h2>
    <p v-if="props.details" class="details">{{ props.details }}</p>
  </article>
</template>

<style scoped>
.VPFeature {
  border-radius: 12px;
  padding: 24px;
  height: 100%;
  background-color: var(--vp-c-bg-soft);
  cursor: pointer;
  transform: skew(-8deg);
}
.VPFeature:hover {
  background-image: linear-gradient(
    42deg,
    var(--hf-c-1),
    var(--hf-c-2),
    var(--hf-c-3)
  );
  transform: scale(1.01) skew(-10deg);
}

.VPFeature:hover .icon {
  box-shadow: 1px 1px 1px var(--vp-c-yellow);
}

.VPFeature:hover  .details {
  color: var(--vp-c-yellow);
}

.VPFeature:hover .title {
  color: var(--vp-c-yellow-light);
}

.icon {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  border-radius: 6px;
  background-color: var(--vp-c-gray-light-4);
  width: 48px;
  height: 48px;
  font-size: 24px;
}

.dark .icon {
  background-color: var(--vp-c-bg-mute);
}

.title {
  line-height: 24px;
  font-size: 20px;
  font-weight: 600;
  color: var(--vp-c-green);
}

.details {
  padding-top: 8px;
  line-height: 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

h2 {
  margin: 0;
}
</style>
