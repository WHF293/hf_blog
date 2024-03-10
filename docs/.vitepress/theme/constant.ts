/*
 * @Author: hfWang
 * @Date: 2022-09-20 23:25:36
 * @LastEditTime: 2023-12-16 10:26:35
 * @Description: file content
 * @FilePath: \hf_blog\docs\.vitepress\theme\constant.ts
 */
import { Feature } from '../types'

export const baseUrl = '/hf_blog/'

export const titleMap = {
  work: '工作记录',
  other: '日常记录',
  ahooks: 'ahooks 学习',
  vueuse: 'vueuse 学习',
}

export const levelMap = {
  work: 0,
  ahooks: 1,
  vueuse: 2,
  other: 3,
}

export const tagColors = ['#6ee7b7', '#f0abfc', '#94A3B8', '#6ee7b7', '#22d3ee', '#a5b4fc', '#fca5a5']
export const icons = ['🍔', '🍚', '🥟', '🥑', '☘', '🍂', '🧣', '🥏', '🏀', '🔮']

const homeInfo = [
  { title: '工作日常', details: '记录自己在工作或学习中遇到的问题或者踩到的坑', url: '/work/', icon: '✨' },
  { title: '博客推荐', details: '记录一些平时看到的博客文章', icon: '🧶', url: '/docs/博客推荐' },
  {
    title: 'Vue 笔记',
    details: '主要记录了学习 vue3 以及学习其周边库过程中遇到的一些知识点',
    url: '/vue3/',
    icon: '🏮',
  },
  {
    title: 'React 笔记',
    details: '主要记录了学习 react 以及学习其周边库过程中遇到的一些知识点',
    url: '/react/',
    icon: '🔮',
  },
  {
    title: '面试题解',
    details: 'b 站观看各种模拟面试视频或者根据掘金上大佬们分享面经所记录的笔记',
    icon: '🎖️',
    url: '/interview/',
  },
] as Feature[]

const cli = [
  {
    title: 'create vue',
    icon: '🎡',
    url: 'https://github.com/vuejs/create-vue',
    _blank: true,
    details: '基于 vite 的新一代脚手架，支持 vue / react 等',
  },
  {
    title: 'create react app',
    icon: '🏆',
    url: 'https://create-react-app.bootcss.com/docs/getting-started',
    _blank: true,
    details: '基于 webpack， 是 react 最流行的脚手架',
  },
  {
    title: 'vue cli',
    icon: '🪀',
    url: 'https://cli.vuejs.org/zh/guide/prototyping.html',
    _blank: true,
    details: '不推荐，官网上已经已推荐使用 create vue 这个脚手架创建 vue 项目',
  },
] as Feature[]

const otherWebsite = [
  {
    title: 'ts 演练场',
    url: 'https://www.typescriptlang.org/zh/play',
    _blank: true,
    icon: '🛹',
  },
  {
    title: 'Vue SFC Playground',
    url: 'https://www.typescriptlang.org/zh/play',
    _blank: true,
    icon: '🎃',
  },
  {
    title: 'npm 中文文档',
    url: 'http://www.npmdoc.org/',
    _blank: true,
    icon: '🎃',
  },
] as Feature[]

const vue = [
  {
    title: 'vue 官方文档',
    icon: '🌲',
    url: 'https://cn.vuejs.org/',
    _blank: true,
  },
  {
    title: 'pinia 官方文档',
    icon: '🍍',
    url: 'https://pinia.web3doc.top/',
    _blank: true,
  },
  {
    title: 'vue-router 官方文档',
    icon: '🌴',
    url: 'https://router.vuejs.org/zh/guide/',
    _blank: true,
  },
  {
    title: 'vueuse 官方文档',
    icon: '🥢',
    url: 'https://vueuse.org/guide/',
    _blank: true,
  },
  {
    title: 'vueHook plus',
    icon: '🥢',
    url: 'http://43.138.187.142:9000/vue-hooks-plus/docs/',
    _blank: true,
  },
  {
    title: 'nuxt3 官方文档',
    icon: '🥫',
    url: 'https://57code.github.io/nuxt3-docs-zh/getting-started/installation.html',
    _blank: true,
  },
] as Feature[]

const react = [
  {
    title: 'react',
    icon: '🎆',
    url: 'https://react.docschina.org/tutorial/tutorial.html',
    _blank: true,
  },
  {
    title: 'react-router-dom v6',
    icon: '',
    url: 'https://reactrouter.com/en/main',
    _blank: true,
  },
  {
    title: 'umi4',
    icon: '🎡',
    url: 'https://umijs.org/',
    _blank: true,
  },
  {
    title: 'Mobx6',
    icon: '🎁',
    url: 'https://www.mobxjs.com/',
    _blank: true,
  },
  {
    title: 'zustand',
    icon: '🎨',
    url: 'https://awesomedevin.github.io/zustand-vue/',
    _blank: true,
  },
  {
    title: 'jotai',
    icon: '🎀',
    url: 'https://lecepin.github.io/jotai-docs-cn/',
    _blank: true,
  },
  {
    title: 'react native',
    icon: '🛳',
    url: 'https://www.reactnative.cn/',
    _blank: true,
  },
] as Feature[]

export const FeatureGroupInfo = {
  homeInfo,
  react,
  vue,
  otherWebsite,
  cli,
}

export type IFeatureType = keyof typeof FeatureGroupInfo

export const commonTools = [
  {
    title: 'lodash',
    details: '前端工具库',
    url: 'https://www.lodashjs.com/',
    _blank: true,
    icon: '🗼',
  },
  {
    title: 'dayjs',
    details: '替代 monmentjs 日期库',
    url: 'https://dayjs.fenxianglu.cn/',
    _blank: true,
    icon: '🗼',
  },
  {
    title: 'html2canvas',
    details: 'html 转图片',
    url: 'https://allenchinese.github.io/html2canvas-docs-zh-cn/docs/html2canvas-getStart.html',
    _blank: true,
    icon: '🗼',
  },
  {
    title: 'antv-x6',
    details: '前端流程图生成',
    url: 'https://antv-x6.gitee.io/zh/docs/tutorial/getting-started',
    _blank: true,
    icon: '🗼',
  },
  {
    title: 'formilyjs',
    details: '低代码最流行的基础库之一',
    url: 'https://formilyjs.org/zh-CN',
    _blank: true,
    icon: '🗼',
  },
  {
    title: 'echarts',
    details: '可视化表格',
    url: 'https://echarts.apache.org/zh/index.html',
    _blank: true,
    icon: '🗼',
  },
  {
    title: 'crypto-js',
    details: '加密库，支持 aes、md5、base64 等加密方式',
    url: 'http://www.npmdoc.org/crypto-jszhongwenwendangcrypto-js-jszhongwenjiaochengjiexi.html',
    _blank: true,
    icon: '🗼',
  },
  {
    title: 'socket-io',
    details: 'web-socket 库',
    url: 'https://socketio.bootcss.com/#examples',
    _blank: true,
    icon: '🗼',
  },
  {
    title: 'fs-extra',
    details: '一个扩展 nodejs 原生 fs 模块的库',
    url: 'http://www.npmdoc.org/fs-extrazhongwenwendangzhongwenshili.html',
    _blank: true,
    icon: '🗼',
  },

  {
    title: '西瓜播放器',
    details: '字节开源的视频播放库',
    url: 'https://v2.h5player.bytedance.com/gettingStarted/#%E5%AE%89%E8%A3%85',
    _blank: true,
    icon: '🗼',
  },
  {
    title: 'flv-js',
    details: '哔哩哔哩开源的直播视频库',
    url: 'https://github.com/Bilibili/flv.js/',
    _blank: true,
    icon: '🗼',
  },
  {
    title: 'mathjs',
    details: 'js 数学计算扩展库,支持矩阵和复杂函数',
    url: 'https://www.npmjs.com/package/mathjs',
    _blank: true,
    icon: '🗼',
  },
  {
    title: 'number-precision',
    details: 'js 精度计算',
    url: 'https://www.npmjs.com/package/number-precision',
    _blank: true,
    icon: '🗼',
  },
  {
    title: '',
    details: '',
    url: '',
    _blank: true,
    icon: '🗼',
  },
] as Feature[]

export const vueTools = [
  {
    title: 'vue-clipboard3',
    details: 'vue3 复制库',
    url: 'https://www.npmjs.com/package/vue-clipboard3',
    _blank: true,
    icon: '🗼',
  },
  {
    title: 'vue3-qrcode',
    details: '二维码',
    url: 'https://www.npmjs.com/package/@chenfengyuan/vue-qrcode',
    _blank: true,
    icon: '🗼',
  },
  {
    title: 'vue-barcode',
    details: '条形码',
    url: 'https://www.npmjs.com/package/@chenfengyuan/vue-barcode',
    _blank: true,
    icon: '🗼',
  },
] as Feature[]

export const reactTools = [
  {
    title: 'react-use-clipboard',
    details: 'react 复制库',
    url: 'https://www.npmjs.com/package/react-use-clipboard',
    _blank: true,
    icon: '🗼',
  },
  {
    title: 'react-qrcode',
    details: '二维码',
    url: 'https://www.npmjs.com/package/qrcode.react',
    _blank: true,
    icon: '🗼',
  },
  {
    title: 'react-barcode',
    details: '条形码',
    url: 'https://www.npmjs.com/package/react-barcode',
    _blank: true,
    icon: '🗼',
  },
] as Feature[]
