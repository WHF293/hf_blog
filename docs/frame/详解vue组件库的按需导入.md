# 详解 vue 组件库的按需导入

:::warning 概要：
1. 了解 vue 组件的导入和使用方式
2. 了解组件库是怎么实现按需导入和全局导入的
3. 了解按需导入插件的实现 
:::

## vue 组件的导入和使用方式

### 自定义组件的使用

自定义组件 A

```html
<!-- A.vue -->
<script setup lang="ts"></script>
<template>
  <div>我是 A 组件</div>
</template>
```

- 全局引入

```typescript
// main.ts
import App from './App.vue'
import { createApp } from 'vue'
import A from './A.vue'
const app = createApp(App)

app.components(A)

app.mount('#app')
```

- 组件内引入

```html
<!-- B.vue -->
<script setup lang="ts">
  import A from './A.vue'
</script>
<template>
  <a></a>
</template>
```

### 第三方组件库的使用

> 这里以 element plus 为例子

- 全部全局导入

```typescript
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)
app.mount('#app')
```

- 按需手动导入

```shell
pnpm add unplugin-element-plus -D
```

```html
<template>
  <el-button>I am ElButton</el-button>
</template>
<script>
  import { ElButton } from 'element-plus'
  export default {
    components: { ElButton },
  }
</script>
```

```typescript
import { defineConfig } from 'vite'
import ElementPlus from 'unplugin-element-plus/vite'

export default defineConfig({
  plugins: [ElementPlus()],
})
```

- 按需自动导入

```shell
pnpm add -D unplugin-vue-components unplugin-auto-import
```

```typescript
import { defineConfig } from 'vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
})
```

```html
<template>
  <!-- 使用了自动导入插件，不需要手动导入 -->
  <el-button>I am ElButton</el-button>
</template>
<script></script>
```

### 分析 element plus 的导入方式

首先，在全部导入的时候，使用了

```typescript
app.use(ElementPlus)
```

根据官方文档 [app.use](https://cn.vuejs.org/api/application.html#app-use) 我们可以知道，use 这个方法是去按照一个插件，而 vue 的插件实际上就是一个对象，而这个插件必须要有一个 `install` 方法, 所以插件的形式大致如下：

```typescript
{
    install(app: App) {
        // .......
    }
}
```

所以根据 element plus 的导入方式可以得出一下结论：

1. 手动按需导入时和我们自己定义组件时的使用方法完全一致
2. 全部导入调用的是插件的 `install` 方法，而 vue 中组件的组册又必须 使用 `app.component(组件)`,所以这个 install 中肯定就是遍历所有组件，让后对每个组件执行注册，大致方法推测如下：

```typescript
import { App } from 'vue'
// 假设所有组件都是在 components 这个目录
import Button from './components/Button'
import Select from './components/Select'

// 实现按需导入
export { Button, Select }

// 实现全部导入
const compList = [Button, Select]
export default function install(app: App) {
  compList.forEach((comp) => {
    app.component(comp, comp.name)
  })
}
```

## 组件库是怎么实现按需导入和全局导入的

我们分别对比一下 3 个组件库的实现方式

### 1、蚂蚁 [ant design vue](https://gitee.com/ant-design-vue/ant-design-vue)

antd-vue 采用的是 tsx + less 的方案

> 备注：ant-design-5 react （2022-11-18 发布） 放弃了 less，采用 css in js + 自研引擎作为组件库的样式处理，不知道 antd-vue 后面会不会改

```typescript
import type { App } from 'vue'

import * as components from './components'
import { default as version } from './version'
export * from './components'

export const install = function (app: App) {
  Object.keys(components).forEach((key) => {
    const component = components[key]
    if (component.install) {
      app.use(component)
    }
  })

  app.config.globalProperties.$message = components.message
  app.config.globalProperties.$notification = components.notification
  app.config.globalProperties.$info = components.Modal.info
  app.config.globalProperties.$success = components.Modal.success
  app.config.globalProperties.$error = components.Modal.error
  app.config.globalProperties.$warning = components.Modal.warning
  app.config.globalProperties.$confirm = components.Modal.confirm
  app.config.globalProperties.$destroyAll = components.Modal.destroyAll
  return app
}

export { version }

export default {
  version,
  install,
}
```

```typescript
export type { AffixProps } from './affix'
export { default as Affix } from './affix'

export type { AnchorProps, AnchorLinkProps } from './anchor'
export { default as Anchor, AnchorLink } from './anchor'

export type { AutoCompleteProps } from './auto-complete'
export { default as AutoComplete, AutoCompleteOptGroup, AutoCompleteOption } from './auto-complete'

// .....略(省略其他组件的导入)......
```

可以看出 ant design vue 的方式和我们推测的大致一样，除了 `message` 等不是在组件 `template` 里使用的组件是使用 `app.config.globalProperties.xxxx` 设置为全局变量的

### 2、饿了么 [element plus](https://gitee.com/element-plus/element-plus)

饿了么的采用了 pnpm 的 monorepo 作为项目的管理方式，组件相关的都放在了 `packages/components`(组件不同于 antd vue 的 `TSX` 写法，而采用 `SFC`) ，而统一导入和按需导入的处理逻辑则是放在了 `packages/element-plus`

```typescript
import { ElAffix } from '@element-plus/components/affix'
import { ElAlert } from '@element-plus/components/alert'
// .....省略其他组件的导入

import type { Plugin } from 'vue'

export default [
  ElAffix,
  ElAlert,
  // ....省略其他组件...
] as Plugin[]
```

```typescript
import { provideGlobalConfig } from '@element-plus/hooks'
import { INSTALLED_KEY } from '@element-plus/constants'
import { version } from './version'

import type { App, Plugin } from '@vue/runtime-core'
import type { ConfigProviderContext } from '@element-plus/tokens'

export const makeInstaller = (components: Plugin[] = []) => {
  const install = (app: App, options?: ConfigProviderContext) => {
    if (app[INSTALLED_KEY]) return

    app[INSTALLED_KEY] = true
    components.forEach((c) => app.use(c))

    if (options) provideGlobalConfig(options, app, true)
  }

  return {
    version,
    install,
  }
}
```

```typescript
import installer from './defaults'
export * from '@element-plus/components'
export * from '@element-plus/constants'
export * from '@element-plus/directives'
export * from '@element-plus/hooks'
export * from '@element-plus/tokens'
export * from './make-installer'

export const install = installer.install
export const version = installer.version
export default installer

export { default as dayjs } from 'dayjs'
```

### 3、华为 [devui-vue](https://gitee.com/devui/vue-devui)

华为的 devui-vue 这个组件库是 2022-09-01 才正式发布的，项目架构采用的 pnpm monorepo 的方式，组件采用的是 tsx + scss，

- 组件代码在 `vue-devui/packages/devui-vue/devui`,
- 文档库在 `vue-devui/packages/devui-vue/docs`,
- 组件库的脚手架在 `vue-devui/packages/devui-vue/vue-cli`

基本的全部注册和按需注册和另外两个一样

具体的实现可以看 b 站 `前端村长`，村长的系列视频里面有一个系列邀请了 `devui-vue` 的总负责人，手把手的叫我们怎么实现一个简单的 vue3 组件库以及如何实现组件库的按需导入和全部导入，不想看视频的话可以在【掘金】上搜下 `DevUI 团队`，查看 【我要做开源】系列文章（村长视频的文字搞）

> 这是我跟着做的一个 demo，一个超简单的组件库 [hf-ui](https://gitee.com/whf293/hf-ui) 实现效果： ![image.png](https://cdn.nlark.com/yuque/0/2022/png/2586551/1670574028607-90f2ba64-d52f-4a6c-b48b-b954ff35276e.png#averageHue=%23e3c788&clientId=u14744021-4d51-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=758&id=ue06f4df2&margin=%5Bobject%20Object%5D&name=image.png&originHeight=758&originWidth=1191&originalType=binary&ratio=1&rotation=0&showTitle=false&size=65856&status=done&style=none&taskId=u018f3d40-3460-46b6-b59e-36a07304b8e&title=&width=1191)

具体地址：

- [【我要做开源】Vue DevUI 开源指南 01：提交我的第一次 pr](https://juejin.cn/post/7009273646884028430)
- [【我要做开源】Vue DevUI 开源指南 02：实现一个能渲染多层节点的 Tree 组件](https://juejin.cn/post/7011535488171376671)
- [【我要做开源】Vue DevUI 开源指南 03：如何给 tree 组件增加展开/收起功能](https://juejin.cn/post/7015023354847428645)
- [【我要做开源】Vue DevUI 开源指南 04：使用 Vite 搭建一个支持 TypeScript/JSX 的 Vue3 组件库工程](https://juejin.cn/post/7017101147865350158)
- [【我要做开源】Vue DevUI 开源指南 05：给 Vue3 组件库添加 VitePress 文档系统](https://juejin.cn/post/7019314307682795534)
- [【我要做开源】Vue DevUI 开源指南 06：手把手带你开发一个脚手架](https://juejin.cn/post/7021915468046811144)

![1.png](https://cdn.nlark.com/yuque/0/2022/png/2586551/1670573175470-3c4b2a3a-8130-451c-8e5c-706b11a3238e.png#averageHue=%23839aa8&clientId=u14744021-4d51-4&crop=0&crop=0&crop=1&crop=1&from=ui&id=u37bf150f&margin=%5Bobject%20Object%5D&name=1.png&originHeight=723&originWidth=1284&originalType=binary&ratio=1&rotation=0&showTitle=false&size=28748&status=done&style=none&taskId=u32da29f2-8e39-4757-aade-fd3367e6558&title=)

## 按需导入插件的实现

查看下面内容时需要对 rollup / vite 插件开发的一些基本配置有了解，如果没有，可以先看这几篇文章：

- [十分钟带你了解 vite 插件开发](https://juejin.cn/post/7067827608842403848)
- [如何实现一个 Rollup 插件](https://juejin.cn/post/7060806475907596319)

这里先以 element-plus 为例， 后面再说 antd 的按需导入可以看到

[element-plus 按需导入](https://element-plus.gitee.io/zh-CN/guide/quickstart.html#%E6%8C%89%E9%9C%80%E5%AF%BC%E5%85%A5)

是通过安装两个插件实现的

- [unplugin-vue-components](https://www.npmjs.com/package/unplugin-vue-components)
- [unplugin-auto-import](https://www.npmjs.com/package/unplugin-auto-import)

vite

```tsx
import { defineConfig } from 'vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    // ...
  ],
})
```

webpack

```typescript
const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')

module.exports = {
  // ...
  plugins: [
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
}
```

可以看到这两个插件都有 vite 和 webpack 的版本， so jump

### unplugin-vue-components

先看 [unplugin-vue-components （github）](https://github.com/antfu/unplugin-vue-components) 在它的 readme 文件上有这样一段话：

![image.png](https://cdn.nlark.com/yuque/0/2022/png/2586551/1670564983900-30e3a028-2354-4814-8ddf-d1beaead1ac7.png#averageHue=%23f9f7f7&clientId=ubf0f6acc-8e2e-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=471&id=u2ae2764b&margin=%5Bobject%20Object%5D&name=image.png&originHeight=471&originWidth=938&originalType=binary&ratio=1&rotation=0&showTitle=false&size=30270&status=done&style=none&taskId=uc0919ef6-293c-414d-a4d6-4d70d5c5522&title=&width=938)

所以如果在一些项目中看到了 vite-plugin-components （只支持 vite，不支持 webpack） 这个插件，现在实际上已经更名为 unplugin-vue-components ，同时支持了 webpack，可以进行升级更改，readme 文件上也提供了迁移指南

#### ElementPlusResolver

看到 element-plus 中 plugin-vue-components 的使用

```typescript
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    // ...
  ],
})
```

先看 ElementPlusResolver 看到 src/resolver.ts

```typescript
export * from './core/resolvers'
export * from './core/helpers/libraryResolver'
```

```typescript
export * from './antdv'
export * from './element-plus'
export * from './element-ui'
export * from './headless-ui'
export * from './idux'
export * from './inkline'
export * from './naive-ui'
export * from './prime-vue'
export * from './vant'
export * from './varlet-ui'
export * from './veui'
export * from './view-ui'
export * from './vuetify'
export * from './vueuse'
export * from './quasar'
export * from './devui'
export * from './arco'
export * from './tdesign'
```

看到这恍然大悟，所有支持按需导入的组件库在 resolvers 目录下都有对应的文件，如：

- vue3
  - element-plus.ts
  - naive-ui.ts
  - antdv.ts
  - devui.ts
  - arco.ts
- vue2
  - element-ui.ts

我们找到 element-plus.ts,

```typescript
import cv from 'compare-versions'
import type { ComponentInfo, ComponentResolver, SideEffectsInfo } from '../../types'
import { getPkgVersion, kebabCase } from '../utils'

export interface ElementPlusResolverOptions {
  // 按需导入样式的格式 false：不导入样式；true/css： 导入css； sass： 导入 scss
  importStyle?: boolean | 'css' | 'sass'
  ssr?: boolean // 是否是服务端渲染
  version?: string // 版本号
  directives?: boolean // 是否是自定义指令
}
type ElementPlusResolverOptionsResolved = Required<ElementPlusResolverOptions>

// 获取组件对应样式 （最新版本已弃用）
function getSideEffectsLegacy(
  partialName: string,
  options: ElementPlusResolverOptionsResolved,
): SideEffectsInfo | undefined {
  const { importStyle } = options
  // 不导入样式
  if (!importStyle) return
  // 导入 scss
  if (importStyle === 'sass') {
    return [
      // 老版本需要导入组件对应样式文件和基础样式文件，多个组件时，基础样式文件会被多次导入
      'element-plus/packages/theme-chalk/src/base.scss',
      `element-plus/packages/theme-chalk/src/${partialName}.scss`,
    ]
  }
  // 导入 css
  else if (importStyle === true || importStyle === 'css') {
    return ['element-plus/lib/theme-chalk/base.css', `element-plus/lib/theme-chalk/el-${partialName}.css`]
  }
}

// 新版 - 获取组件对应样式
function getSideEffects(dirName: string, options: ElementPlusResolverOptionsResolved): SideEffectsInfo | undefined {
  const { importStyle, ssr } = options
  const themeFolder = 'element-plus/theme-chalk' // 样式文件打包后的目录
  const esComponentsFolder = 'element-plus/es/components' // 组件打包后的目录

  if (importStyle === 'sass')
    return ssr ? `${themeFolder}/src/${dirName}.scss` : `${esComponentsFolder}/${dirName}/style/index`
  else if (importStyle === true || importStyle === 'css')
    return ssr ? `${themeFolder}/el-${dirName}.css` : `${esComponentsFolder}/${dirName}/style/css`
}

// 解析组件
function resolveComponent(name: string, options: ElementPlusResolverOptionsResolved): ComponentInfo | undefined {
  // 命名空间,组件以 el 开头的才会触发接下来的逻辑，否则 return
  if (!name.match(/^El[A-Z]/)) return

  const partialName = kebabCase(name.slice(2)) // ElTableColumn -> table-column
  const { version, ssr } = options

  // 不同版本打包结果不一致，这里做下区分

  // >=1.1.0-beta.1
  if (cv.compare(version, '1.1.0-beta.1', '>=')) {
    return {
      importName: name,
      path: `element-plus/${ssr ? 'lib' : 'es'}`, // 用于区分是否是 服务端渲染，因为 element-plus 也支持 Nuxt3
      sideEffects: getSideEffects(partialName, options), // 获取组件样式地址
    }
  }
  // >=1.0.2-beta.28
  else if (cv.compare(version, '1.0.2-beta.28', '>=')) {
    return {
      path: `element-plus/es/el-${partialName}`,
      sideEffects: getSideEffectsLegacy(partialName, options),
    }
  }
  // for <=1.0.1
  else {
    return {
      path: `element-plus/lib/el-${partialName}`,
      sideEffects: getSideEffectsLegacy(partialName, options),
    }
  }
}

// 解析自定义指令
function resolveDirective(name: string, options: ElementPlusResolverOptionsResolved): ComponentInfo | undefined {
  if (!options.directives) return

  // element-plus 目前提供的所有自定义指令
  const directives: Record<string, { importName: string; styleName: string }> = {
    Loading: { importName: 'ElLoadingDirective', styleName: 'loading' },
    Popover: { importName: 'ElPopoverDirective', styleName: 'popover' },
    InfiniteScroll: { importName: 'ElInfiniteScroll', styleName: 'infinite-scroll' },
  }

  // 判断指令 name 是否属于 elemenet-plus 定义的，不是直接 return
  const directive = directives[name]
  if (!directive) return

  const { version, ssr } = options

  // >=1.1.0-beta.1
  if (cv.compare(version, '1.1.0-beta.1', '>=')) {
    return {
      importName: directive.importName,
      path: `element-plus/${ssr ? 'lib' : 'es'}`, // src 用于区分是否是服务端渲染
      sideEffects: getSideEffects(directive.styleName, options), // 获取自定义指令对应的样式文件
    }
  }
}

export function ElementPlusResolver(options: ElementPlusResolverOptions = {}): ComponentResolver[] {
  let optionsResolved: ElementPlusResolverOptionsResolved | undefined

  async function resolveOptions() {
    if (optionsResolved) return optionsResolved
    optionsResolved = {
      ssr: false,
      version: await getPkgVersion('element-plus', '1.1.0-beta.21'),
      importStyle: 'css',
      directives: true,
      ...options,
    }
    return optionsResolved
  }

  return [
    {
      type: 'component',
      resolve: async (name: string) => {
        return resolveComponent(name, await resolveOptions())
      },
    },
    {
      type: 'directive',
      resolve: async (name: string) => {
        return resolveDirective(name, await resolveOptions())
      },
    },
  ]
}
```

#### Components

回到 vite.config.ts , 再看这一句

```typescript
import Components from 'unplugin-vue-components/vite'
```

我们查看项目的 packages.json

![image.png](https://cdn.nlark.com/yuque/0/2022/png/2586551/1670565283931-9750c457-c547-4fec-a9f9-6e681adf6a20.png#averageHue=%230d1219&clientId=ubf0f6acc-8e2e-4&crop=0&crop=0.5205&crop=1&crop=1&from=paste&height=609&id=sg4Wv&margin=%5Bobject%20Object%5D&name=image.png&originHeight=609&originWidth=685&originalType=binary&ratio=1&rotation=0&showTitle=false&size=46779&status=done&style=none&taskId=u26222b04-d26e-4b77-9fb8-a1564349566&title=&width=685)

可以看到，打包结果中出现了 vite 目录和 webpack 目录，这就是我们这次的目标文件进入 src 目录，我们就可以看到 vite.ts 和 webpack.ts 两个文件

![image.png](https://cdn.nlark.com/yuque/0/2022/png/2586551/1670565709664-d310d747-a847-440a-8ed7-5acbe210fc4a.png#averageHue=%23191c1d&clientId=ubf0f6acc-8e2e-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=531&id=wzBkV&margin=%5Bobject%20Object%5D&name=image.png&originHeight=531&originWidth=1099&originalType=binary&ratio=1&rotation=0&showTitle=false&size=40914&status=done&style=none&taskId=ue06c6a93-512a-42e7-bc57-5d906cd28bb&title=&width=1099)

进去之后直接傻眼，这都是啥啊

```typescript
import unplugin from '.' // 导入 src/index.ts

export default unplugin.vite
```

```typescript
import unplugin from '.' // 导入 src/index.ts

export default unplugin.webpack
```

啥啥啥，这都是啥 ？？？？？ 你没看错，这两文件就是这么简单。。。。。直接找到 src/index.ts

```typescript
export * from './types'
export { default } from './core/unplugin'
export { camelCase, pascalCase, kebabCase } from './core/utils'
```

我在跳到 core/unplugin.ts

```typescript
import { createUnplugin } from 'unplugin'
import { createFilter } from '@rollup/pluginutils'
import chokidar from 'chokidar'
import type { ResolvedConfig, ViteDevServer } from 'vite'
import type { Options } from '../types'
import { Context } from './context'
import { shouldTransform } from './utils'

// 结合前面的分析，options 就是我们前面说的  { resolvers: [ElementPlusResolver()] },
export default createUnplugin<Options>((options = {}) => {
  // 创建过滤器
  const filter = createFilter(
    // 指定包含哪些文件，默认只支持 .vue 文件结尾的
    options.include || [/\.vue$/, /\.vue\?vue/],
    // 排除 node_modules 、 .git、 .nuxt 目录下的所有文件
    options.exclude || [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/, /[\\/]\.nuxt[\\/]/],
  )
  // 使用传进来的【按需导入的解析器】获取插件的上下文
  const ctx: Context = new Context(options)

  return {
    name: 'unplugin-vue-components',
    enforce: 'post',

    transformInclude(id) {
      return filter(id)
    },

    async transform(code, id) {
      if (!shouldTransform(code))
        return null
      try {
        const result = await ctx.transform(code, id)
        ctx.generateDeclaration()
        return result
      }
      catch (e) {
        this.error(e)
      }
    },

    vite: {
       (config: ResolvedConfig) {
        ctx.setRoot(config.root)
        ctx.sourcemap = true

        if (config.plugins.find(i => i.name === 'vite-plugin-vue2'))
          ctx.setTransformer('vue2')

        if (options.dts) {
          ctx.searchGlob()
          ctx.generateDeclaration()
        }

        if (config.build.watch && config.command === 'build')
          ctx.setupWatcher(chokidar.watch(ctx.options.globs))
      },

      configureServer(server: ViteDevServer) {
        ctx.setupViteServer(server)
      },
    },
  }
})
```

> l 扩展：用到的工具包主要有这几个
>
> - [unplugin](https://www.npmjs.com/package/unplugin) 用于同时支持 vite webpack esbuild rollup 插件的生成
> - [chokidar](https://www.npmjs.com/package/chokidar) 用于扩展 nodejs fs 模块的能力
> - [@rollup/pluginutils](https://www.npmjs.com/package/@rollup/pluginutils) rollup 插件工具包

看到这我们发现，src/core/unplugin 默认对外导出的是 createUnplugin 执行后的结果而且 createUnplugin 的入参是一个函数，所以还得去看的具体实现 [unplugin](https://github.com/unjs/unplugin)

#### unplugin

看到 unplugin/webpack 的 package.json

![image.png](https://cdn.nlark.com/yuque/0/2022/png/2586551/1670572712284-83c55017-772d-4b00-acce-1ba979568207.png#averageHue=%2312171c&clientId=u14744021-4d51-4&crop=0&crop=0.4262&crop=1&crop=1&from=paste&height=538&id=uad254329&margin=%5Bobject%20Object%5D&name=image.png&originHeight=538&originWidth=792&originalType=binary&ratio=1&rotation=0&showTitle=false&size=59550&status=done&style=none&taskId=u1045028c-614e-4650-b098-4a2df44dca4&title=&width=792)

在进入到 src

![image.png](https://cdn.nlark.com/yuque/0/2022/png/2586551/1670572934434-cbeb5bdf-1232-43dd-82ea-7e4eead1fdd9.png#averageHue=%2313181e&clientId=u14744021-4d51-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=382&id=u43975b88&margin=%5Bobject%20Object%5D&name=image.png&originHeight=382&originWidth=989&originalType=binary&ratio=1&rotation=0&showTitle=false&size=40691&status=done&style=none&taskId=u2201c16d-111c-470c-88f0-7d34100bc9e&title=&width=989)

看到没，这就是 unplugin 可以支持 vite webpack rollup esbuild 的原因找到 src/index.ts

```typescript
export * from './define'
export * from './types'
```

```typescript
import { getEsbuildPlugin } from './esbuild'
import { getRollupPlugin } from './rollup'
import type { UnpluginFactory, UnpluginInstance } from './types'
import { getVitePlugin } from './vite'
import { getWebpackPlugin } from './webpack'

export function createUnplugin<UserOptions, Nested extends boolean = boolean>(
  factory: UnpluginFactory<UserOptions, Nested>,
): UnpluginInstance<UserOptions, Nested> {
  return {
    get esbuild() {
      return getEsbuildPlugin(factory)
    },
    get rollup() {
      return getRollupPlugin(factory)
    },
    get vite() {
      return getVitePlugin(factory)
    },
    get webpack() {
      return getWebpackPlugin(factory)
    },
    get raw() {
      // 好吧，我不知道这个是啥
      return factory
    },
  }
}
```

我们这次的目标是 vite 和 webpack，所以冲冲冲

##### vite

```typescript
import unplugin from '.' // 导入 src/index.ts

export default unplugin.vite
```

```typescript
import { getVitePlugin } from './vite'

export function createUnplugin<UserOptions, Nested extends boolean = boolean>(
  factory: UnpluginFactory<UserOptions, Nested>,
): UnpluginInstance<UserOptions, Nested> {
  return {
    // ....
    get vite() {
      return getVitePlugin(factory)
    },
    // ....
  }
}
```

找到 src/vite 目录，发现只有一个 index.ts 文件

![image.png](https://cdn.nlark.com/yuque/0/2022/png/2586551/1670573492007-c16aebda-5a44-4ea6-8d1e-d403c03636b1.png#averageHue=%2313181f&clientId=u14744021-4d51-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=170&id=u9d4063fa&margin=%5Bobject%20Object%5D&name=image.png&originHeight=170&originWidth=982&originalType=binary&ratio=1&rotation=0&showTitle=false&size=13346&status=done&style=none&taskId=u0ae93117-48d1-4dd2-9413-179d38e75f7&title=&width=982)

```typescript
import { toRollupPlugin } from '../rollup'
import type { UnpluginContextMeta, UnpluginFactory, UnpluginInstance, VitePlugin } from '../types'
import { toArray } from '../utils'

export function getVitePlugin<UserOptions = {}, Nested extends boolean = boolean>(
  factory: UnpluginFactory<UserOptions, Nested>,
) {
  return ((userOptions?: UserOptions) => {
    const meta: UnpluginContextMeta = {
      framework: 'vite',
    }
    const rawPlugins = toArray(factory(userOptions!, meta))

    const plugins = rawPlugins.map((rawPlugin) => {
      const plugin = toRollupPlugin(rawPlugin, false) as VitePlugin
      if (rawPlugin.vite) Object.assign(plugin, rawPlugin.vite)

      return plugin
    })

    // 返回 vite 插件
    return plugins.length === 1 ? plugins[0] : plugins
  }) as UnpluginInstance<UserOptions, Nested>['vite']
}
```

所以 vite.config.ts 中的 Components({ resolver: ElementPlusResolvers }) 实际上等同于 getVitePlugin({ resolver: ElementPlusResolvers })

##### webpack

```typescript
import unplugin from '.' // 导入 src/index.ts

export default unplugin.webpack
```

```typescript
import { getWebpackPlugin } from './vite'

export function createUnplugin<UserOptions, Nested extends boolean = boolean>(
  factory: UnpluginFactory<UserOptions, Nested>,
): UnpluginInstance<UserOptions, Nested> {
  return {
    // ....
    get webpack() {
      return getWebpackPlugin(factory)
    },
    // ....
  }
}
```

### unplugin-auto-import
