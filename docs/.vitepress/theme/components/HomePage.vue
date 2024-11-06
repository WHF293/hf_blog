<script setup lang="ts">
import MyAllDocs from './MyAllDocs.vue'
import { tagColors } from '../constant'
import useDocsInfo from '../hooks/useDocsInfo';
import { getRandomNum } from '../../utils';
import { ref } from 'vue'


const { allDocsNum, keys } = useDocsInfo()
const myTags = ref(['动漫', '军事', '逗比'])

const getRandomColor = () => {
  const color = tagColors[getRandomNum(tagColors.length - 1)]
  return color
}
</script>

<template>
  <div class="home-box">
    <div class="home-page">
      <div class="right">
        <MyAllDocs></MyAllDocs>
      </div>
      <div class="left">
        <div class="left-item scale">
          <div class="flex-center mb-16">
            <img src="https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/202411062257132.jpg" class="avatar card scale" />
          </div>
          <p class="base-info name">霞露小伙-HfWang</p>
          <p class="base-info my-desc">一个有点中二还在努力搬砖的前端攻城狮</p>
          <div class="tag-box">
            <span v-for="tag in myTags" :key="tag" class="tag" :style="{ backgroundColor: getRandomColor() }">
              {{ tag }}
            </span>
          </div>
        </div>
        <div class="left-item scale">
          <div class="docs-all-tag">
            <div class="docs-tag">
              <p>文章</p>
              <p class="docs-tag-num">{{ allDocsNum }}</p>
            </div>
            <div class="docs-tag">
              <p>分类</p>
              <p class="docs-tag-num">{{ keys.length }}</p>
            </div>
            <div class="docs-tag">
              <p>标签</p>
              <p class="docs-tag-num">0</p>
            </div>
          </div>
        </div>
        <div class="left-item scale mytip">
          永远相信美好的事情即将发生
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.mytip {
  display: flex;
  justify-content: center;
  align-items: center;
}

.tag {
  font-size: 12px;
  line-height: 16px;
  padding: 2px 4px;
  margin: 4px;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
}

.scale {
  cursor: pointer;

  &:hover {
    transform: scale(1.02);
    transition: .4s all ease-out;
    box-shadow: 0px 0px 8px #ccc;
  }
}

.mb-16 {
  margin-bottom: 16px;
}

.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.quick-module {
  font-size: 12px;
  line-height: 16px;
  padding: 0 12px;

  a {
    display: inline-block;
    box-shadow: 0px 0px 8px #ccc;
    margin: 4px;
    padding: 4px 8px;
    border-radius: 4px;

    &:hover {
      background-image: linear-gradient(36deg, #ffe7f8 0%, #d8e6ff 100%);
    }
  }
}

.dark {
  .home-box {
    background-image: linear-gradient(90deg, #a7a6cb 0%, #8989ba 52%, #8989ba 100%);
  }
}

.home-box {
  z-index: 100;
  display: flex;
  justify-content: center;
  background-image: linear-gradient(90deg, #f5e3e6 0%, #d6e6fd 99%, #e3eeff 100%);


  .home-page {
    width: 100%;
    padding: 40px;
    display: flex;
    backdrop-filter: blur(12px);
    justify-content: center;

    .left {
      width: 300px;
      height: calc(100% - 4px);
      margin: 4px 0 0 18px;
      display: flex;
      flex-direction: column;
      position: relative;

      .left-item {
        background-color: var(--hf-bg-1);
        border-radius: 8px;
        margin-bottom: 16px;
        padding: 20px 0;

        &:last-child {
          margin-bottom: 0;
        }

        .docs-all-tag {
          display: flex;
          margin: 0 16px;
          justify-content: space-between;

          .docs-tag {
            width: 32%;
            display: flex;
            flex-direction: column;

            p {
              text-align: center;
              font-size: 12px;
              color: var(--vp-c-green);
            }

            .docs-tag-num {
              color: var(--vp-c-yellow);
            }
          }
        }
      }

      .buliangren {
        position: absolute;
        right: 0;
        top: 0;
        width: 60px;
        height: 60px;
      }

      .tag-box {
        display: flex;
        justify-content: center;
      }

      .base-info {
        text-align: center;
        font-size: 14px;
      }

      .my-desc {
        font-size: 12px;
        line-height: 32px;
      }

      .name {
        color: var(--vp-c-green);
        font-weight: 550;
      }

      .avatar {
        border-radius: 50%;
        width: 180px;
        height: 180px;
        box-shadow: 0px 0px 15px var(--vp-c-yellow-lighter);

        &:hover {
          transform: scale(1.02);
          transition: .4s all ease-out;
          box-shadow: 0px 0px 30px var(--vp-c-yellow);
        }
      }
    }

    .right {
      width: 1100px;
      border-radius: 8px;
      padding: 4px 8px;
      display: flex;
      box-sizing: border-box;
      flex-wrap: wrap;

      &::-webkit-scrollbar {
        width: 0px;
        height: 0px;
      }
    }
  }
}

@media (max-width: 1400px) {
  .home-box {
    .home-page {
      width: 100%;

      .right {
        flex: 1;
      }

      .left {
        width: 240px;

        .avatar {
          width: 140px;
          height: 140px;
        }
      }
    }
  }
}

@media (max-width: 746px) {
  .home-box {
    padding: 20px;

    .home-page {
      flex-direction: column-reverse;
      padding: 40px 0;
      justify-content: center;

      .left {
        width: 100%;
        height: 320px;
        margin: 0 0 20px;
        overflow: hidden;
        border-radius: 16px;

        .left-item {
          display: none;

          &:first-child {
            display: block;
          }

          &:hover {
            transform: scale(1);
          }
        }

        .avatar {
          width: 180px;
          height: 180px;
        }
      }

      .right {
        width: 100%;
        max-height: 10000px;
        padding: 0;
      }
    }
  }
}
</style>