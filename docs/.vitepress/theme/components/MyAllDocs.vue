<!--
 * @Author: hfWang
 * @Date: 2023-02-04 20:25:52
 * @LastEditTime: 2024-01-19 00:39:53
 * @Description: file content
 * @FilePath: \hf_blog\docs\.vitepress\theme\components\MyAllDocs.vue
-->
<script setup lang="ts">
import { useRouter } from "vitepress";
import { ref, onMounted } from 'vue'
import { titleMap, baseUrl } from '../constant';
import useDocsInfo from "../hooks/useDocsInfo";

const router = useRouter();

const { keys, docsData } = useDocsInfo()

const getDocsByType = (type: string) => {
  return docsData.keywords[type]?.data || []
}

const getDocsNumByType = (type: string) => {
  return docsData.keywords[type]?.data?.length || 0
}

const gotoTargetDocs = (item: any) => {
  router.go(item.link!)
}

const showMore = ref<boolean[]>([])

onMounted(() => {
  showMore.value = Array(keys.value.length).fill(true)
})
</script>

<script lang="ts">
export default {
  name: "MyAllDocs",
};
</script>
<template>
  <div v-for="(type, index) in keys" class="docs-group">
    <div class="docs-item-box">
      <p class="type-title flex-center">
        <span>{{ titleMap[type] || type }}</span>
      <div class="flex-center">
        {{ getDocsNumByType(type) }}篇
        <!-- <input class="show-more" type="checkbox" v-model="showMore[index]" /> -->
      </div>
      </p>
      <div class="docs-item-box" v-show="showMore[index]">
        <div v-for="item in getDocsByType(type)" class="w-1_2">
          <div class="docs-item" @click="gotoTargetDocs(item)">
            <div style="display: inline-block; width: 20px">{{ item.icon }}</div>
            <span class="ml-8 docs-item-text" :title="item.text">
              {{ item.text === 'index' ? '分类目录' : item.text }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.flex-center {
  display: flex;
  align-items: center;
}

.w-1_2 {
  width: 50%;
  display: inline-block;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.show-more {
  width: 16px;
  height: 16px;
  margin-left: 12px;
}

.mb-20 {
  margin-bottom: 20px;
}

.ml-8 {
  margin-left: 8px;
}

.docs-group {
  padding: 20px;
  border-radius: 12px;
  width: 45%;
  margin: 0 20px 20px;
  background-color: var(--hf-bg-1);
  cursor: pointer;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    box-shadow: 0px 0px 20px #ccc;
    transition: .3s all ease-in-out;
    transform: scale(1.01);
  }

  .docs-item-box {
    .type-title {
      font-size: 24px;
      border-bottom: 1px solid #c2a9fd;
      padding: 6px 12px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
    }

    .docs-item {
      font-size: 16px;
      padding: 6px 12px;
      border-radius: 8px;
      box-sizing: border-box;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin: 0 4px;

      &:hover {
        color: var(--vp-c-yellow);
        transition: all .6s ease-in-out;
        transform: scale(1.01);
        background-image: linear-gradient(-225deg, #E3FDF5 0%, #FFE6FA 100%);

        .docs-item-text {
          color: var(--vp-c-yellow);
        }
      }

      .docs-item-text {
        color: var(--vp-c-green);
      }
    }
  }
}

@media (max-width: 1000px) {
  .docs-group {
    width: 100%;
    margin: 20px;
  }

  .w-1_2 {
    width: 100%;
  }
}

@media (max-width: 746px) {
  .docs-group {
    &:hover {
      transform: scale(1);
    }
  }

  .docs-item-box {

    .docs-item {

      &:hover {
        transition: .4s;
        box-shadow: 0px 0px 20px #ccc;
      }
    }
  }
}</style>