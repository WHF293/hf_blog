# 前端脚手架 create-whf 实现

## 前言

Q: 什么是脚手架

A: 百度百科 —— 脚手架是为了保证各施工过程顺利进行而搭设的工作平台。对应前端开发来说，前端脚手架就是一个可以快速创建应用项目模板的工具。

> 比较熟悉的脚手架有 vue-cli、create-react-app，但是这两个脚手架都和对应的框架嵌和度太高了在 vueconf 2022 大会中蒋豪群大牛（[create-vue](https://www.npmjs.com/package/create-vue) 和 [create-vite](https://www.npmjs.com/package/create-vite) 的核心维护者之一）的演讲 [vueconf 2022 - 《vue 项目配置：最佳实践与个人偏见》](https://www.bilibili.com/video/BV1f8411H7RN?p=3)，他认为脚手架应该和框架脱离，交由框架之外的开发人员去维护，所以有了现在的 create-vite，也是 vue 官网上推荐的 vue 项目创建方式

> 连 react 社区也在呼吁 react 新的官方文档使用 create-vite 代替 cra ： [React 团队回应用 Vite 替换 Create React App 的建议](https://juejin.cn/post/7195398724040785976)

> 而我的脚手架就是在学习 create-vite 的源码后，基于 create-vite 的实现思路，实现一个简化版的脚手架 create-whf

目前 create-whf 以开源，同时也已发布 npm

- github: [https://github.com/WHF293/create-whf](https://github.com/WHF293/create-whf)
- npm: [https://www.npmjs.com/package/create-whf](https://www.npmjs.com/package/create-whf)
  > 想学源码的可以看这里： [若川 — Vue 团队公开快如闪电的全新脚手架工具 create-vue，未来将替代 Vue-CLI，才 300 余行代码，学它！](https://lxchuan12.gitee.io/create-vue/)

所以这篇文章将简单讲述一下 create-whf 是怎么实现以及发布的

Q：create-vue 和 create-vite 的关系是？

A：create-vite 是基于 create-vue 衍生出来的，create-vue 只支持创建 vue 项目，create-vite 目前支持创建 vue、react、preact、svelte、vanilla 等不同前端框架的项目模板。目前 create-vite 已被纳入 vite 核心工具中，项目代码在 vite/packages/create-vite

![image-2023-02-09-22-42-31](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/image-2023-02-09-22-42-31.png)

### 实现效果对比

|             | 终端指定模板 | 指定包管理器 | 提供 js / ts 模板 | 支持框架                |
| ----------- | ------------ | ------------ | ----------------- | ----------------------- |
| create-vite | 支持         | 支持         | 支持              | 太多了。。。            |
| create-whf  | 不支持       | 只支持 pnpm  | 懒，目前只支持 ts | 目前只支持 vue3 、react |

---

## 脚手架搭建

先说下整体思路

1. 终端交互操作，获取用户对于新项目的一些配置信息
2. 项目中内置好多套已经提前准备好的模板
3. 根据用户配置信息，将内置模板拷贝到用户指定的目录下

ok，有了思路后，实现就比较简单了

### 初始化项目

```shell
mkdir create-whf && cd create-whf
pnpm init
```

新建一些基础文件目录，如下：

```latex
- create-whf
	- template-react-simple
	- template-react-complete
	- template-vue3-simple
	- template-vue3-simple
	- src
  - index.js
	- tsconfig.json
	- readme.md
	- package.json
```

模仿 create-vite，模板文件形式为 **template-<框架名称>-<类型>**

Q: 老王你内置的这几套模板有什么区别？

A：具体区别看下面

- `template-vue3-simple`： pinia + router + windicss
- `template-vue3-complete`: pinia + router + windicss + vueuse + axios + lodash-es + pinia-plugin-persistedstate + i18n

> react 目前还只是简单的模板，后续将支持到下面提到的配置

- `template-react-simple`：recoil + router + windicss
- `template-react-complete`：recoil + router + windicss + ahooks + axios + lodash-es + i18n

Q： 为什么使用 windicss 不使用 less 、scss？

A： vite 目前好像还没有特别好的微前端接入方案，都是需要关闭沙箱，但是这就带来了样式污染的问题，所以使用 windicss 一方面可以提升开发速度，另一方面也可以减少微前端方案下的样式冲突

---

### 安装打包工具

打包工具选择 rollup + unbuild

> 打包工具使用 webpack 和 vite 也可以，无所谓

```shell
pnpm add rollup unbulid -D
```

根目录下新建 build.config.ts 和 index.js

```typescript
// build.config.ts
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  // 入口文件
  entries: ['src/index'],
  // 每次打包先清空 dist 目录
  clean: true,
  rollup: {
    inlineDependencies: true,
    esbuild: {
      // 开启压缩
      minify: true,
    },
  },
  alias: {
    // 这一行是从 create-vite 抄过来的，为了保证包路径引用正常
    prompts: 'prompts/lib/index.js',
  },
})
```

```javascript
// index.js
#!/usr/bin/env node

import './dist/index.mjs'
```

内容比较简单，就简单说下要注意的就行了 `#!/usr/bin/env node` 这句必须要加，应该我们的脚手架最终是要被全局安装的，所以加上这句才能让文件准确的找到系统中的 node 环境

---

### 实现终端交互

回想一下，我们在使用 create-vite 的时候是怎么用的

```shell
pnpm create vite
```

然后就出现一堆可以选择选项那么终端的交互是怎么实现的，我们在掘金上搜下前脚脚手架搭建相关的文章，如下：

[从零开始搭建前端脚手架](https://juejin.cn/post/6844903592663449607)

[前端脚手架开发入门](https://juejin.cn/post/6914556810129539085)

文章里都有介绍他们用的是什么库/包，那么 create-vite 用的是啥呢

![image-2023-02-09-22-45-22](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/image-2023-02-09-22-45-22.png)

- `kolorist`: 用于终端输出有颜色的文案
- `minimist`: 用于解析用户的终端输入 （这个我们用不上）
- `prompts`: 提供终端交互能力

那么对于 create-whf 来说，我们需要的交互是很简单的，只需要 3 个信息

- 项目名称
- 使用 vue 还是 react
- 使用完整项目模板还是简单的模板

所以开始写代码了（prompts 和 kolorist 的使用自己去看文档就行了，这里不说了）

```typescript
// src/contant.ts
import { blue, yellow } from 'kolorist'

interface IFrameWorks {
  value: string
  title: string
  // 名称叫 ui 原因：
  // 一开始是想以模板安装不同 ui 库来作区分，但后来想到用户想用什么 ui
  // 库让他们自己选择就行了，但是我又懒得改了，所以就叫 ui 字段了
  ui: IFrameWork[]
}

/**
 * @desc 框架模板选择
 */
export const framework = [
  {
    value: 'vue',
    title: 'vue3 + ts',
    ui: [
      { value: 'simple', title: yellow('简易') },
      { value: 'complete', title: blue('简易') },
      // 以后如果出其他模板也可以加在这里后面
    ],
  },
  {
    value: 'react',
    title: 'react18 + ts',
    ui: [
      { value: 'simple', title: yellow('简易') },
      { value: 'complete', title: blue('简易') },
    ],
  },
] as IFrameWorks[]
```

```typescript
// src/index.ts
import { reset } from 'kolorist'
import prompts from 'prompts'

const createProject = async () => {
  //
  const defaultProjectName = `whf-vite-project`

  try {
    // res 是一个用户输入的信息组成的对象
    const res = (await prompts([
      {
        type: 'text', // 文本类型
        name: 'projectName', // 字段名
        message: reset('请输入项目名称'), // 类似 input 的 placeholder 效果
        initial: defaultProjectName, // 默认值
      },
      {
        type: 'select', // 选择类型
        name: 'framework', // 字段名
        message: reset('请选择框架'),
        initial: 0,
        choices: getFrameworkList(), // Array 返回框架类型
      },
      {
        type: 'select',
        name: 'frameworkType',
        message: reset('请选择项目模板'),
        initial: 0,
        // Array 返回框架类型
        choices: (framework: string) => getFrameworkTypeList(framework),
      },
    ])) as IProjectBaseInfo

    // res ==> { projectName: 'xx', framework: 'vue' | 'react', frameworkType: 'xxx' }
    // 下载模板的逻辑
    // downloadTemplate(res)
  } catch (err) {
    throw new Error('出错了.....')
  }
}

createProject()
```

getFrameworkList 和 getFrameworkTypeList 的实现也很简单，就是对 contant.ts 里面的数据进行处理实现效果

![image-2023-02-09-22-46-04](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/image-2023-02-09-22-46-04.png)

![image-2023-02-09-22-46-26](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/image-2023-02-09-22-46-26.png)

ok，到这里终端交互部分就结束了

### 实现模板下载

模板下载主要使用到了 node 提供的 fs 模块不熟悉的可以看这篇文章：

[Node 中 fs 模块 API 详解](https://juejin.cn/post/6844903677782654983)

**整体思路**

1. 判断用户想要的模板是否存在， 如果没有报错提示
2. 判断用户终端执行命令的目录下是否已经存在和想要新建项目项目名相同的文件夹，如果有报错提示
3. 用户目录下新建项目名文件夹
4. 读取相应模板文件夹
   1. 如果是文件，直接复制刚才到新建的文件夹里面
   2. 如果是文件夹，递归复制
5. 特殊文件
   1. `\_gitignore`: 需要修改文件名为 .gitignore
   2. `package.json` 里面的 name 字段需要改成用户输入的项目名

**具体实现** 代码结构如下：

```latex
- src
	- index.ts // 入口文件
	- contant.ts // 静态变量文件
	- types.ts // ts 类型声明文件
	- utils.ts  // 工具函数
	- download.ts // 下载函数
```

接着上面

```typescript
// src/download.ts

// 用户终端执行的地址
const cwd = process.cwd()
// 新建项目的根目录地址
let root: string = ''
// 模板路径
let targetTemplateDir: string = ''

/**
 * @desc 下载模板文件
 * @param source 用户输入的信息
 */
export const downloadTemplate = async (source: IProjectBaseInfo) => {
  const { projectName } = source
  root = path.join(cwd, projectName)

  // 判断新项目文件夹是不是 不存在，若已存在则报错
  if (fs.existsSync(root)) {
    console.log()
    console.log(red('<------------目标文件夹已存在，无法创建------------->'))
    console.log()
    return
  } else {
    console.log()
    console.log(red('-------------------开始创建项目---------------------'))
    console.log()

    // 将模板项目文件夹复制到本地
    copyTemplateFile(root, source)
    // 创建成功提示
    showSuccessTip(projectName)
  }
}
```

所以核心就是 copyTemplateFile 这个函数的实现具体写起来放在这里有点多，想看具体实现的去 gtihub 上看源码吧，下面只说几个重要的函数实现

- 实现复制功能

```typescript
// src/utils.ts
import fs from 'fs'

/**
 * @desc 拷贝文件，将模板文件（夹）拷贝到新建的项目文件夹里
 * @param src 要复制的源文件名
 * @param dest 复制操作的目标文件名
 */
export const copy = (src: string, dest: string) => {
  // 获取文件信息， 包括 mtime，ctime （用于协商缓存）等属性方法
  // https://juejin.cn/post/6955011872298893319
  const stat = fs.statSync(src)

  if (stat.isDirectory()) {
    // 如果是文件夹的话，拷贝文件夹
    copyDir(src, dest)
  } else {
    // 文件的话直接拷贝
    // http://nodejs.cn/api-v14/fs/fs_copyfilesync_src_dest_mode.html
    try {
      console.log(green(`正在创建文件: ${dest}`))
      fs.copyFileSync(src, dest)
    } catch (err) {
      console.log(dest + ' 文件复制出错')
      throw new Error(err)
    }
  }
}

/**
 * @desc 拷贝文件夹
 * @param srcDir  要复制的源文件夹名
 * @param destDir  复制操作的目标文件夹名
 */
export const copyDir = (srcDir: string, destDir: string) => {
  // 在新项目的创建文件夹
  fs.mkdirSync(destDir, { recursive: true })

  // 读取模板项目里的目标文件夹，遍历所有文件，并将对应文件复制到新项目创建的文件夹里面去
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file)
    const destFile = path.resolve(destDir, file)
    copy(srcFile, destFile)
  }
}
```

- 实现修改 package.json

```typescript
/**
 * @desc 生成/修改文件
 * @param file 目标文件名
 * @param content 需要修改的内容
 */
const write = (file: string, content?: string) => {
  // 获取目标文件路径
  const destPath = path.join(root, renameFiles[file] ?? file)

  if (content) {
    // 改写模板文件内容，如 package.json
    fs.writeFileSync(destPath, content)
  } else {
    // 将目标模板的文件复制到新项目的文件夹里
    const srcPath = path.join(targetTemplateDir, file)
    copy(srcPath, destPath)
  }
}

/**
 * @desc 创建 package.json 文件
 * @param projectName 项目名
 */
const copyPkgFile = (projectName: string) => {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(targetTemplateDir, `package.json`), 'utf-8'))
    // 更改 name 字段
    pkg.name = projectName
    // 重写 package.json, 并复制到新项目中
    write('package.json', JSON.stringify(pkg, null, 2))
  } catch (err) {
    throw Error('创建 package.json 时出现异常')
  }
}
```

到这，模板的下载功能也基本说清楚了

## 脚手架发布与使用

### 发布前准备

修改下 package.json

```json
// package.json
{
  // 重要：发布到 npm 时的包名就是这个，包名必须唯一，可以现在 npm 上搜下是否被用了
  "name": "create-whf",
  "version": "1.0.0-beta.0", // 重要：版本必填
  "type": "module",
  "license": "MIT", // 遵循 mit 开源协议
  "author": "WangHaoFeng", // 作者
  "keywords": ["cli", "vite", "ts"],
  "description": "一个用于快速创建基于 vite + ts 项目模板的简易脚手架",
  "bin": {
    "create-whf": "index.js" // 重要：执行的脚本命令
  },
  "files": [
    // 重要： 需要发布到 npm 的文件
    "index.js",
    "template-*",
    "dist"
  ],
  "main": "index.js", // 重要： 入口文件
  "scripts": {
    // ......
  },
  "engines": {
    "node": "^14.18.0 || >=16.0.0"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/WHF293/create-whf.git"
  },
  "bugs": {
    "url": "https://github.com/WHF293/create-whf/issues"
  },
  "homepage": "https://github.com/WHF293/create-whf.git#readme",
  "devDependencies": {
    // .....
  }
}
```

---

### npm 发布

> 前提：你要有个 npm 账号

1. 确认自己电脑的 npm 使用的是 npm 源而不是淘宝或其他镜像源

如果不清楚，直接使用这个命令改下：

```shell
npm config set registry https://register.npmjs.org
```

2. npm login
   1. 如果报错

```shell
# 解决办法：
npm install -g npm@latest # 更新 npm
npm config get proxy
npm config get https-proxy

# 如果返回值都为空，下面的这个设置就可以跳过啦
# 如果返回值不为null，继续执行：
npm config set proxy null
npm config set https-proxy null

# 切换 npm 源
npm config set registry http://registry.npmjs.org/
#  平时可以设为 淘宝源
# npm config set registry https://registry.npm.taobao.org/
```

![image-2023-02-09-22-48-38](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/image-2023-02-09-22-48-38.png)

2.  不报错正常登陆，如图

![image-2023-02-09-22-50-46](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/image-2023-02-09-22-50-46.png)

3. 发布

```shell
npm publish
```

![Q2S4@QYCZFY$XXD62XC_A2P-2023-02-09-22-52-03](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/Q2S4@QYCZFY$XXD62XC_A2P-2023-02-09-22-52-03.png)

正常发布成功的话，你的邮箱会受到发布成功的信息

![image-2023-02-09-22-52-34](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/image-2023-02-09-22-52-34.png)

4. npm 上搜下 create-whf

![20230209225335-2023-02-09-22-53-36](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/20230209225335-2023-02-09-22-53-36.png)

![20230209225405-2023-02-09-22-54-06](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/20230209225405-2023-02-09-22-54-06.png)

ok，npm 发布成功

---

### npm 包升级

- 更新发布 npm 包

```shell
#  更新版本号
npm version <版本号>
# eg. npm version 1.0.1

# 发布更新后的包
npm publish  # 如果版本号为已发布过的，publish 时会报错
```

- 撤销某个版本的 npm 包

```shell
npm unpublish <包名>@<版本号> # 指定版本号
# eg. npm unpublish create-whf@1.0.1
```

---

### 安装与使用

- 临时安装（推荐）

```shell
# 任意目录终端下输入以下命令
pnpm create whf
# or
yarn create whf
```

![20230209225537-2023-02-09-22-55-37](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/20230209225537-2023-02-09-22-55-37.png)

- 本地全局安装（不推荐）

```shell
npm i create-whf -g
create-whf
```

OK，终于结束了

## 最后

欢迎大家加入进来共同维护，如果发现 bug 的话也欢迎大家提 isiue
