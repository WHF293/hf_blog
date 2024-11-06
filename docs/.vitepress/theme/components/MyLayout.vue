<!--
 * @Author: hfWang
 * @Date: 2022-07-25 19:05:31
 * @LastEditTime: 2023-12-11 21:32:39
 * @Description: file content
 * @FilePath: \hf_blog\docs\.vitepress\theme\components\MyLayout.vue
-->
<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import MyNotFound from './MyNotFound.vue'
import Watermark from './Watermark/index.vue'
import { ref, computed } from 'vue'
// import MySearch from "../MyComps/MySearch.vue";
import { useData } from 'vitepress'

const { page, frontmatter } = useData()
const { Layout } = DefaultTheme
</script>

<template>
  <div v-if="page.isNotFound">
    <MyNotFound />
  </div>
  <!-- <div v-else-if="frontmatter.layout === 'home'">
    hdakslhakljh
  </div> -->
  <Watermark v-else text="wanghaofeng" :gap="350" :font-size="14" :rotate="-30" fontColor="#f8c373">
    <Layout>
      <!-- 导航栏右侧 -->
      <!-- <template #nav-bar-content-before>
    			<MySearch style="margin-left: 20px" />
    		</template> -->
      <!-- 首页banner图 -->
      <template #home-hero-before>
        <div class="my-home-hero-before">
          <img src="https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/202411062255110.png" alt="图片" style="width: 100%" />
        </div>
      </template>
      <!--文章主体-->
      <!-- <template #doc-before>
      <div class="title">{{ _title }}</div>
    </template> -->
      <!--右侧边栏快速前往标题-->
      <template #aside-top>
        <div class="mb-20 fs-20 color">霞露小伙 — HfWang</div>
      </template>
      <!--右侧边栏底部图片-->
      <template #aside-bottom>
        <div class="aside-bottom-img">
          <img src="https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/202411062256856.png" alt="" />
          <!-- <img src="/cy2.png" alt="" /> -->
        </div>
      </template>
    </Layout>
  </Watermark>
</template>

<style scoped>
.title {
  font-size: 64px;
}
.my-home-hero-before {
  position: relative;
  width: 100%;
  height: 100%;
}

.my-home-hero-before .logo-text {
  position: absolute;
  font-size: 100px;
  font-style: oblique;
  font-weight: 700;
  color: #fff;
  top: 200px;
  left: 100px;
}

.home-fixed-img {
  position: fixed;
  top: 150px;
  right: 0;
  display: none;
  animation: chu-uin linear 3s infinite;
}

.aside-bottom-img img {
  border-radius: 8px;
  position: fixed;
  bottom: 0;
  right: -20px;
  width: 180px;
  pointer-events: none;
  opacity: 0.3;
  animation: chu-uin linear 3s infinite;
}

@media (min-width: 1000px) {
  .home-fixed-img {
    width: 280px;
    display: block;
  }

  .aside-bottom-img img {
    width: 240px;
  }
}

@media (min-width: 1400px) {
  .aside-bottom-img img {
    width: 360px;
  }

  .home-fixed-img {
    width: 400px;
  }
}

@keyframes chu-uin {
  0% {
    transform: translateY(0px);
  }
  25% {
    transform: translateY(-20px);
  }
  50% {
    transform: translateY(-40px);
  }
  75% {
    transform: translateY(-20px);
  }
  100% {
    transform: translateY(0px);
  }
}

.color {
  color: var(--vp-c-brand-light);
}

.fs-26 {
  font-size: 26px;
}

.fs-20 {
  font-size: 20px;
}

.mb-40 {
  margin-bottom: 40px;
}

.mb-20 {
  margin-bottom: 20px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  padding-bottom: 40px;
}

.top-tip {
  margin-bottom: 40px;
  font-size: 12px;
  background: rgba(179, 222, 239, 0.2);
  border: 1px solid var(--vp-c-green-light);
  padding: 10px;
  border-radius: 8px;
  color: var(--vp-c-green-light);
}

.top-tip .tip {
  font-size: 16px;
  margin-bottom: 8px;
  color: var(--vp-c-green-light);
}
</style>

<style>
.title-text,
.link-text:hover {
  color: var(--vp-c-brand-light) !important;
}
</style>
