/*
 * @Author: hfWang
 * @Date: 2022-07-18 21:24:05
 * @LastEditTime: 2023-12-11 22:04:35
 * @Description: file content
 * @FilePath: \hf_blog\docs\.vitepress\theme\config\nav.ts
 */

const nav = [
  {
    text: '笔记分组',
    items: [
      { text: '👑 ahooks', link: '/ahooks/' },
      { text: '🥬 vueuse', link: '/vueuse/' },
      { text: '🏐 work', link: '/work/' },
      { text: '🎀 other', link: '/other/' },
    ],
  },
  {
    text: '博客推荐',
    items: [
      {
        text: '面试刷题网站',
        items: [
          { text: '👑 前端充电宝-前端面试题汇总', link: 'https://www.yuque.com/cuggz/interview' },
          { text: '🥬 前端充电宝-前端知识进阶', link: 'https://www.yuque.com/cuggz/feplus' },
          { text: '🏐 前端充电宝-LeetCode题解]', link: 'https://www.yuque.com/cuggz/leetcode' },
          { text: '🎀 前端充电宝-前端资讯', link: 'https://www.yuque.com/cuggz/news ' },
          { text: '💜 面经分享', link: 'https://www.yuque.com/yayu/nice-people' },
          { text: '🥚 大厂每日一题', link: 'https://q.shanyue.tech/' },
        ],
      },
      {
        text: '大佬博客',
        items: [
          { text: '👑 代码随想录', link: 'https://www.programmercarl.com/' },
          { text: '🥬 山月行', link: 'https://shanyue.tech/about.html' },
          { text: '🥬 Anthony Fu', link: 'https://antfu.me/' },
          { text: '🎃 后盾人', link: 'https://doc.houdunren.com/' },
          { text: '🏐 汪图南', link: 'https://wangtunan.github.io/blog/' },
          { text: '🍏 若川视野', link: 'https://lxchuan12.gitee.io/' },
          { text: '🍡 程序员成长指北', link: 'http://www.inode.club/' },
          { text: '🍤 Pan 的技术生涯', link: 'https://free_pan.gitee.io/freepan-blog/' },
          { text: "🎀 springleo's blog", link: 'https://lq782655835.github.io/blogs/' },
        ],
      },
    ],
  },
  {
    text: '电子文档推荐',
    items: [
      { text: '🛩️ vue3 编译原理揭秘', link: 'https://vue-compiler.iamouyang.cn/' },
      { text: '⛪ react 技术解密', link: 'https://kasong.gitee.io/just-react/' },
      { text: '🚕 vue2 源码解析', link: 'https://vue-js.com/learn-vue/reactive/' },
      // {text: '', link: ''},
      // {text: '', link: ''},
      // {text: '', link: ''},
      { text: '💜 ts 类型体操', link: 'https://blog.maxiaobo.com.cn/type-challenge/dist/' },
      { text: '🎫 webpack-guidebook', link: 'https://tsejx.github.io/webpack-guidebook/' },
      { text: '⚽ 深入浅出 Webpack', link: 'http://webpack.wuhaolin.cn/' },
      { text: '🥈 深入理解 TypeScript', link: 'https://jkchao.github.io/typescript-book-chinese/' },
      { text: '🧲 TypeScript 入门进阶必备', link: 'https://ts.yayujs.com/' },
      { text: '🎨 TypeScript 手册', link: 'https://bosens-china.github.io/Typescript-manual/' },
      {
        text: '🧨 jest 实践指南',
        link: 'https://github.yanhaixiang.com/jest-tutorial/#%E6%B5%8B%E8%AF%95%E9%9A%BE%E7%82%B9',
      },
      { text: '🎆 Linter上手完全指南', link: 'https://github.yanhaixiang.com/linter-tutorial/' },
    ],
  },
  {
    text: '常用工具',
    items: [
      { text: '🛩️ 颜色表', link: 'https://www.toolscat.com/ui/color/yansebiao' },
      { text: '⛪ 渐变色', link: 'http://color.oulu.me/' },
      { text: '👑 插图', link: 'https://unsplash.com/' },
      { text: '🥬 表情图', link: 'https://www.emojiall.com/zh-hans' },
      { text: '🧨 removeBg', link: 'https://www.remove.bg/zh' },
      { text: '🥈 JSON.cn', link: 'https://www.json.cn/' },
      { text: '⚽ 代码片段', link: 'https://snippet-generator.app/' },
    ],
  },
]

export default nav
