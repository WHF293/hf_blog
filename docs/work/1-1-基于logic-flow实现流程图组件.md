# 基于 logic-flow 实现一个 react 流程图组件

:::warning 提示
待完善
:::

## 前言

> 项目地址： [lf-react](https://gitee.com/whf293/lf-react) 看这篇文章前请先大致看下 [logic-flow](http://logic-flow.cn/) 官网，以免后面使用对应 api 时一脸懵

### 最终实现的效果

![image-2023-02-05-19-55-26](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/image-2023-02-05-19-55-26.png)


> 这时我在自己的 react demo 项目 [tmt-web](https://gitee.com/whf293/tmt-web) 中实现的效果，这次的目标就是把它从项目中给单独提取出来变成一个独立的包，并且发布到 npm 上从项目中提取出来的过程其实也是对这个组件进行部分重构以及功能的完善，这篇文章就是记录一下自己实现的过程

### 项目依赖包

完成这个组件（npm 包）需要用到的一些文档：

- [react](https://react.docschina.org/tutorial/tutorial.html) ： react 18 官方文档
- [logic-flow](http://logic-flow.cn/) ： 滴滴开源的流程图库
- [dumi](https://d.umijs.org/) ： 阿里开源的一款为组件开发场景而生的静态站点框架，与 [father](https://github.com/umijs/father) 一起为开发者提供一站式的组件开发体验，father 负责组件源码构建，而 dumi 负责组件开发及组件文档生成
- [sass](https://www.sasscss.com/) ： 略（后面内容 scss 主要使用 xxx.module.scss ）
- [antd5](https://ant-design.gitee.io/index-cn) : ant-design-5

## 项目搭建

> 我们使用 dumi 作为 npm 包的搭建工具，原因时 dumi 不仅可以快速的实现 npm 包的发布上线，同时还可以同步生成对应的文档，这样在 npm 包发布后无需在单独的去搞一个文档库项目（目前 dumi 已有支持 vue 的提案，在官方 2.0 的发布记录中也明确提到后续将支持 vue 的构建，等出了我们在来搞一下 vue3 的版本）

### 安装 dumi

```typescript
// 终端
1. mkdir lf-react && cd lf-react
2. npx create-dumi

输入命令 2 后，选择模板
template  -->  React Library
NPM client ---> pnpm
// ... 其余无所谓

// 为了有良好的类型提示，我们在安装下 react 的类型提示
3. pnpm add @types/react @types/react-dom -D

// 运行项目
4. pnpm start
```

![image-2023-02-05-19-56-17](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/image-2023-02-05-19-56-17.png)

访问 8000 端口，看到下面这样的页面证明没有出错

![image-2023-02-05-19-56-57](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/image-2023-02-05-19-56-57.png)

看下项目目录

![image-2023-02-05-19-57-52](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/image-2023-02-05-19-57-52.png)

先看下 docs/index.md , 如图，这个文件就是定义我们首页的结构

![image-2023-02-05-19-59-21](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/image-2023-02-05-19-59-21.png)

按自己的需要修改对应的字段即可。

> actions 里面的 link 字段对应跳转的 路由地址

### 安装其他依赖

```typescript
pnpm add @logicflow/core @logicflow/extension @icon-park/react antd
// dumi 本身是基于 umijs 的，所以为了支持 scss，可以直接安装 umijs 的插件
pnpm add @umijs/plugin-sass -D
```

简单测试一下 scss 是否生效

```typescript
// src/Foo/index.ts
import React, { type FC } from 'react';
import './index.scss';

const Foo: FC<{ title: string }> = (props) => (
  <h4>
    <div className="test">{props.title}</div>
  </h4>
);

export default Foo;

// src/Foo/index.scss
.test {
    background-color: aqua;
}
```

查看 `localhost:8000/components/foo`

![image-2023-02-05-19-59-41](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/image-2023-02-05-19-59-41.png)

完美生效，为了避免组件被使用时出现样式污染，后面我们正式开发时都采用 module.scss 使用 module css 原因： [在 React 中使用 CSS Modules](https://www.jianshu.com/p/694f9c14ab35)

## 实现 LfFlowChart

### 简单开坑

src 下新建一下目录

```typescript
src -
  lfFlowChart -
  types.ts - // 类型提示文件
  index.tsx - // 组件入口文件
  lfFlowChart.module.scss - // 组件样式
  index.md - // 组件文档
  index.$tab -
  api.md // 组件文档 tab-api
```

后续可能会增加以下目录 (待定)

```typescript
;-lfFlowChart -
  node -
  base - // 基础的节点
  edge - // 基础连线
  index.ts -
  lfComps -
  SideBar.tsx - // 侧边节点拖拽面板
  CtrlBar.tsx - // 顶部控制面板
  EditBar.tsx - // 节点、边样式编辑面板
  utils -
  ctrlbar -
  tools.tsx -
  sidebar -
  tools.tsx -
  editbar -
  tools.tsx -
  constants.ts - // 静态数据
  helper.ts // 工具函数
```

简单写点代码

```typescript
// src/lfFlowChart/index.tsx
import React from 'react'
import s from './lfFlowChart.modules.scss'

export default function LfFlowChart(props: any) {
  return (
    <div className={s.lf_flowChart}>index</div>
  )
}

// src/lfFlowChart/lfFlowChart.module.scss
.lf_flowChart {
    background-color: azure;
}

// src/lfFlowChart/index.md
# LfChartFlow

流程图组件

// src/lfFlowChart/index.$tab-api.md
# api

流程图组件 api

| 属性 | 描述 | 类型 | 是否必填 | 示例 |
| ---- | ---- | ---- | -------- | ---- |
|      |      |      |          |      |
```

如果熟悉 ts 开发的话应该知道，现在直接运行肯定会报错，因为 ts 无法识别 `xxx.module.scss`是啥？用 vscode 的话可以直接看到 红色波浪线 报错解决方式 src 下新建 react-env.d.ts (前面的名字无所谓，但必须以 .d.ts 结尾)，内容如下：

```typescript
// src/react-env.d.ts
declare module '*.module.scss' {
  const classes: { readonly [key: string]: string }
  export default classes
}
```

之后在 src/index.ts 中导出组件（必须导出、必须导出、必须导出）

```typescript
export { default as Foo } from './Foo' // 创建的时候自带的，后期在移除
export { default as LfFlowChart } from './lfFlowChart'
```

ok, 运行 pnpm strat，先看下发生了什么变化 （备注：每次新增新的组件都 需要重启）

![image-2023-02-05-20-01-29](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/image-2023-02-05-20-01-29.png)

看，多了这个，点进去看

![image-2023-02-05-20-01-52](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/image-2023-02-05-20-01-52.png)


![image-2023-02-05-20-02-29](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/image-2023-02-05-20-02-29.png)


后续，我们组件弄好后只需要在 index.md 中使用即可，而 index.$tab-api.md 里面可以用来写 相应的属性和方法

### 需求分析

首先，logic-flow 已经给我们提供了很多很强大的功能，但是都比较琐碎，我们想要的是一个开箱即用的流程图组件，能够提供常见的图形块，支持样式编辑，同时必须支持 logic-flow 为我们提供的自定义节点的功能，也要支持 logic-flow 原始所有的配置选项，还要能保存不同格式的数据类型所以总结如下：

- 开箱即用
- 提供常见节点
- 支持自定义节点
- 支持所有配置
- 支持导出 图片、json、xml
- 支持主题定制

### 搭建基础画布

```typescript
// src/lfFlowChart/index.tsx
import React, { useEffect, useRef } from 'react'
import s from './lfFlowChart.module.scss'
// logic-flow 相关
import LogicFlow from '@logicflow/core'
import '@logicflow/core/dist/style/index.css'
import '@logicflow/extension/lib/style/index.css'
// iconpark 的样式文件
import '@icon-park/react/styles/index.css'

import { LfFlowChartProps } from './types'

const LfFlowChart: FC<LfFlowChartProps> = (props) => {
  // 使用 useRef 是为了保证每次都是同一个数据
  const lfRef = useRef<HTMLDivElement | null>(null) // logic-flow 挂载的节点
  const lf = useRef<LogicFlow | null>(null) // logic-flow 实例

  useEffect(() => {
    // 实例化 LogicFlow
    lf.current = new LogicFlow({
      container: lfRef.current as HTMLDivElement,
      width: 1200,
      height: 800,
    })

    const { data = {} } = props
    // 流程图渲染
    lf.current.render(data)

    // 组件卸载时移除实例
    return () => {
      if (lf.current !== null) {
        lf.current = null
      }
    }
  }, [])

  return (
    <div className={s.lf_flowChart}>
      <div ref={lfRef}></div>
    </div>
  )
}

export default LfFlowChart
```

```typescript
// src/lfFlowChart/types.ts
export interface LfFlowChartProps {
  data: any
  config: {
    width: number
    height: number
    [key: string]: any
  }
}
```

为了支持用户自定义配置，我们需要更改一下配置项(具体配置项看 logic-flow)：

```typescript
// src/lfFlowChart/utils/helper.ts
/**
 * @param config 用户自定义配置
 * @returns 流程图配置
 */
export function getLfConfig(config: any = {}) {
  return {
    overlapMode: 1,
    autoWrap: true, // 文本自动换行
    metaKeyMultipleSelected: true, // 允许一次选中多个节点
    keyboard: {
      enabled: true, // 支持键盘控制，例如 ctrl + z 等
    },
    grid: {
      visible: true, // 开启网格， 默认纯色背景
      size: 10, // 网格大小
    },
    stopScrollGraph: true, // 画布是否允许滚动
    background: {
      // 背景
      backgroundImage: '#ccc',
      backgroundRepeat: 'repeat',
    },
    ...config,
  }
}
```

修改 index.tsx

```tsx
lf.current = new LogicFlow({
  container: lfRef.current as HTMLDivElement,
  ...getLfConfig(props.config),
})
```

到这基本结束底层画布了，修改 index.md

```typescript
// // src/lfFlowChart/index.md
# LfChartFlow

流程图组件

``jsx
import { LfFlowChart } from 'lf-react';

const lfConfig = {
  width: 800,
  height: 400,
};

export default () => <LfFlowChart config={lfConfig} />;
``
```

重新跑下项目，如图所示，画布出现了

![image-2023-02-05-20-02-55](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/image-2023-02-05-20-02-55.png)

后面的 3 个面板我们可以这么弄，最外层 div 相对定位， 3 个面板决定定位覆盖在画布上，面板位置支持手动传入，大致结构如图所示：

![image-2023-02-05-20-07-12](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/image-2023-02-05-20-07-12.png)

所以可以先写一下大致的样式代码：

```css
/* src/LfFlowChart/LfFlowChart.module.scss */
.lf_flowChart {
  background-color: azure;
  position: relative;
  overflow: scroll;
}

/* 拖拽面板之后所有样式写在这里面 */
.side_bar {
  position: absolute;
}

/* 编辑面板之后所有样式写在这里面 */
.edit_bar {
  position: absolute;
}

/* 控制面板之后所有样式写在这里面 */
.ctrl_bar {
  position: absolute;
}

/* 通用的样式写在这下面 */
```

同时新建如下文件，并在 index.tsx 中导入（这里太简单了，直接放图了）

![image-2023-02-05-20-07-56](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/image-2023-02-05-20-07-56.png)

![image-2023-02-05-20-08-43](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/image-2023-02-05-20-08-43.png)

同时要支持这 3 个面板的样式调整，以及缩略图的位置控制，我们需要给一个口子让用户可以传进来，所以修改一下 types.ts

```typescript
// lfFlowChart/types.ts
import { CSSProperties, ReactNode } from 'react'

export interface LfFlowChartProps {
  themeColor?: string
  data?: any
  style?: CSSProperties
  config: {
    width: number
    height: number
    [key: string]: any
  }
  styleConf?: {
    ctrlBatStyle?: CSSProperties
    editBatStyle?: CSSProperties
    sideBatStyle?: CSSProperties
    miniMapPosition?: {
      width: number
      height: number
    }
  }
}

// ....
```

### 实现主题定制

antd 5 为我们提供了十分便捷的主题定制方案，无需向 antd 4 一样需要使用第三方插件来更改 less 的变量，具体使用看 [antd5 定制主题](https://ant-design.gitee.io/docs/react/customize-theme-cn) 修改 index.tsx 、 types.ts、lfFlowChart.module.scss 最终结果如下：

```tsx
// lfFlowChart\index.tsx
import React, { FC, useEffect, useRef } from 'react'
import s from './lfFlowChart.module.scss'

import LogicFlow from '@logicflow/core'
import '@logicflow/core/dist/style/index.css'
import '@logicflow/extension/lib/style/index.css'

import '@icon-park/react/styles/index.css'

import { LfFlowChartProps } from './types'
import { getLfConfig } from './utils/helper'
import { ConfigProvider } from 'antd'
import { defaultThemeColor } from './utils/contants'

import CtrlBar from './lfComps/CtrlBar'
import EditBar from './lfComps/EditBar'
import SideBar from './lfComps/SideBar'

const LfFlowChart: FC<LfFlowChartProps> = (props) => {
  const lfRef = useRef<HTMLDivElement | null>(null)
  const lfBoxRef = useRef<HTMLDivElement | null>(null)
  const lf = useRef<LogicFlow | null>(null)

  useEffect(() => {
    lf.current = new LogicFlow({
      container: lfRef.current as HTMLDivElement,
      ...getLfConfig(props.config),
    })

    const { data = {} } = props
    // 流程图渲染
    lf.current.render(data)

    return () => {
      if (lf.current !== null) {
        lf.current = null
      }
    }
  }, [])

  useEffect(() => {
    // 主题更改
    if (props.themeColor) {
      lfBoxRef.current?.style.setProperty('--themeColor', props.themeColor)
    }
  }, [props?.themeColor])

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: props.themeColor || defaultThemeColor,
        },
      }}>
      <div className={s.lf_flowChart} ref={lfBoxRef}>
        <div ref={lfRef}></div>
        <CtrlBar />
        <EditBar />
        <SideBar />
      </div>
    </ConfigProvider>
  )
}

export default LfFlowChart
```

```typescript
export interface LfFlowChartProps {
  themeColor?: string
  data?: any
  // ...
}
```

```css
/* lfFlowChart.module.scss */
$themeColor: var(--themeColor, '#b96dfc');

// ....
```

> 扩展：[js 变量控制 scss 变量](https://juejin.cn/post/7070762204286435359)

到这一步实现了 antd 组件的主题定制了，但是对于组件的其他东西时没有的，所以有吗还需要在组件内获取到用户传入的主题， 使用方式如下：

```typescript
// src\lfFlowChart\lfComps\CtrlBar.tsx
import { theme } from 'antd'
import React from 'react'

const { useToken } = theme

const CtrlBar = () => {
  const {
    token: { colorPrimary }, // colorPrimary: 就是我们要的主题
  } = useToken()

  return <div>CtrlBar</div>
}

export default CtrlBar
```

### 实现控制面板

控制面板即用来控制流程图相关的，简单分析下我们需要那些功能

- 开启/关闭拖拽面板
- 开启/关闭框选功能
- 开启/关闭缩略图
- 上/下一步操作的回退
- 画布的放大与缩小
- 保存流程图的信息

先定义一下类型提示

```typescript
// src/lfFlowChart/types.ts

export interface LfFlowChartProps {
  themeColor?: string
  data?: any
  config: {
    width: number
    height: number
    [key: string]: any
  }
  style?: CSSProperties
  // 定义各个控制面板的样式
  styleConf?: {
    ctrlBatStyle?: CSSProperties
    editBatStyle?: CSSProperties
    sideBatStyle?: CSSProperties
    miniMapPosition?: {
      width: number
      height: number
    }
  }
}

// 控制面板每一个按钮类型定义
export interface CtrlItem {
  icon: ReactNode // 必须，面板上显示的icon
  type: string // 必填，唯一标识
  title?: string // hover 提示
}

// 保存的数据类型
export type SaveLfInfoType = 'json' | 'xml' | 'image'

// ctrlbar 组件的所有入参
export interface CtrlBarProps {
  toggleSidebar: () => void // 开启关闭拖拽面板
  selectMoreNode: () => void // 开启关闭框选功能
  openMiniMap: () => void // 打开缩略图
  lfUndoOrRedo: (type: boolean) => void // 回退到上一步/下一步
  lfZoomInOrOut: (type: boolean) => void // 画布放大/缩小
  saveLfInfo: (type: SaveLfInfoType) => void // 保存流程图数据
}
```

直接放代码

```tsx
// lfFlowChart/lfComps/CtrlBar.tsx
import { DownloadTwo } from '@icon-park/react'
import { Dropdown, MenuProps, theme } from 'antd'
import React, { FC, useEffect, useState } from 'react'
import s from '../lfFlowChart.module.scss'
import { CtrlBarProps, CtrlItem, SaveLfInfoType } from '../types'
import { getCtrlItemsList, items, size } from '../utils/ctrlbar-tools'

const { useToken } = theme

const CtrlBar: FC<CtrlBarProps> = (props) => {
  const {
    token: { colorPrimary },
  } = useToken()

  const [ctrlItemsList, setCtrlItemsList] = useState<CtrlItem[]>(getCtrlItemsList(colorPrimary))

  useEffect(() => {
    setCtrlItemsList(getCtrlItemsList(colorPrimary))
  }, [colorPrimary])

  const handleClickCtrlItem = (data: CtrlItem) => {
    switch (data.type) {
      case 'toggleSidebar':
        props.toggleSidebar()
        break
      case 'selectMoreNode':
        props.selectMoreNode()
        break
      case 'openMiniMap':
        props.openMiniMap()
        break
      case 'lfUndo':
        props.lfUndoOrRedo(true)
        break
      case 'lfRedo':
        props.lfUndoOrRedo(false)
        break
      case 'lfZoomIn':
        props.lfZoomInOrOut(true)
        break
      case 'lfZoomOut':
        props.lfZoomInOrOut(false)
        break
      default:
        break
    }
  }

  const saveFlowChartInfo: MenuProps['onClick'] = (data: any) => {
    props.saveLfInfo(data.key as SaveLfInfoType)
  }

  return (
    <div className={s.ctrl_bar} style={props?.style}>
      {ctrlItemsList.map((item) => (
        <div
          key={item.type}
          title={item?.title}
          className={`${s.ctrl_item} ${s.hover_scale}`}
          onClick={() => handleClickCtrlItem(item)}>
          {item.icon}
        </div>
      ))}
      <div className={`${s.ctrl_item} ${s.hover_scale}`}>
        <Dropdown
          menu={{
            items,
            onClick: saveFlowChartInfo,
          }}>
          <DownloadTwo theme="outline" size={size} fill={colorPrimary} />
        </Dropdown>
      </div>
    </div>
  )
}

export default CtrlBar
```

```typescript
// lfFlowChart/utils/ctrlbar-tools.tsx
import { Back, HamburgerButton, Next, Stretching, SwitchButton, ZoomIn, ZoomOut } from '@icon-park/react'
import React from 'react'
import { CtrlItem } from '../types'

export const size = 18

export const items: MenuProps['items'] = [
  { label: '保存为图片', key: 'image' },
  { label: '保存为JSON', key: 'json' },
  { label: '保存为XML', key: 'xml' },
]

export const getCtrlItemsList = (colorPrimary: string): CtrlItem[] =>
  [
    {
      icon: <HamburgerButton theme="outline" size={size} fill={colorPrimary} strokeLinejoin="miter" />,
      type: 'toggleSidebar',
      title: '开启/关闭节点选择面板',
    },
    {
      icon: <SwitchButton theme="outline" size={size} fill={colorPrimary} />,
      type: 'selectMoreNode',
      className: 'px-2',
      title: '开启/关闭画布框选功能',
    },
    {
      icon: <Stretching theme="outline" size={size} fill={colorPrimary} strokeLinejoin="miter" />,
      type: 'openMiniMap',
      title: '开启缩略图',
    },
    {
      icon: <Back theme="outline" size={size} fill={colorPrimary} strokeLinejoin="miter" />,
      type: 'lfUndo',
      title: '上一步',
    },
    {
      icon: <Next theme="outline" size={size} fill={colorPrimary} strokeLinejoin="miter" />,
      type: 'lfRedo',
      title: '下一步',
    },
    {
      icon: <ZoomIn theme="outline" size={size} fill={colorPrimary} strokeLinejoin="miter" />,
      type: 'lfZoomIn',
      className: 'px-2',
      title: '放大',
    },
    {
      icon: <ZoomOut theme="outline" size={size} fill={colorPrimary} strokeLinejoin="miter" />,
      type: 'lfZoomOut',
      className: 'px-2',
      title: '缩小',
    },
  ] as CtrlItem[]
```

```css
/* lfFlowChart/lfFlowChart.module.scss */
$themeColor: var(--themeColor, '#b96dfc');
$boxBg: rgb(248, 246, 246);
$btnItemBg: #fff;
$borderColor: rgb(238, 238, 238);

.ctrl_bar {
  position: absolute;
  display: flex;
  align-items: center;
  padding: 4px 8px;
  box-shadow: 1px 1px 3px $themeColor;
  border-radius: 8px;
  top: 20px;
  left: 140px;
  background-color: $boxBg;

  .ctrl_item {
    display: flex;
    margin: 0 4px;
    justify-content: center;
    align-items: center;
    border-radius: 6px;
    box-shadow: 1px 1px 3px $themeColor;
    border: 1px solid $borderColor;
    background-color: $btnItemBg;
    width: 36px;
    height: 36px;
  }
}

.hover_scale {
  transform: scale(0.95);
  cursor: pointer;

  &:hover {
    transform: scale(1.02);
  }
}
```

index.tsx 修改下

```tsx
const LfFlowChart: FC<LfFlowChartProps> = (props) => {
  // .....
  const toggleSidebar = () => {}
  const openMiniMap = () => {}
  const selectMoreNode = () => {}
  const lfUndoOrRedo = (type: boolean) => {}
  const lfZoomInOrOut = (type: boolean) => {}
  const saveLfInfo = (type: SaveLfInfoType) => {}
  // ...
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: props.themeColor || defaultThemeColor,
        },
      }}>
      <div className={s.lf_flowChart} ref={lfBoxRef} style={props?.style}>
        <div ref={lfRef}></div>
        <CtrlBar
          style={props?.styleConf?.ctrlBatStyle}
          toggleSidebar={toggleSidebar}
          selectMoreNode={selectMoreNode}
          openMiniMap={openMiniMap}
          lfUndoOrRedo={lfUndoOrRedo}
          lfZoomInOrOut={lfZoomInOrOut}
          saveLfInfo={saveLfInfo}></CtrlBar>
        <EditBar />
        <SideBar />
      </div>
    </ConfigProvider>
  )
}
```

run 一下，看下现在是什么效果

![image-2023-02-05-20-10-00](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/image-2023-02-05-20-10-00.png)

ok，没毛病, 在试下更改下主题试下，修改下 index.md 文件,试下【原谅绿】主题

```typescript
# LfChartFlow

流程图组件

``jsx
import { LfFlowChart } from 'lf-react';

const lfConfig = {
  width: 1200,
  height: 600,
};

export default () => <LfFlowChart config={lfConfig} />;
```

```jsx
import { LfFlowChart } from 'lf-react'

const lfConfig = {
  width: 1200,
  height: 600,
}
const theme = '#b3ff66'
export default () => (<LfFlowChart config={lfConfig} themeColor={theme} />)``
```

![image-2023-02-05-20-10-28](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/image-2023-02-05-20-10-28.png)

先修改下样式文件，让拖拽面板和编辑面板的大致样式先显示出来，方便后续修改

```css
.side_bar {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 120px;
  background-color: $boxBg;
}

.edit_bar {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: 120px;
  background-color: $boxBg;
}
```

![image-2023-02-05-20-10-50](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/image-2023-02-05-20-10-50.png)

主题设置也生效了，接下来就是功能实现了控制面板上提供的功能，除了控制拖拽面板的显示与否的功能，其他功能 logic-flow 都为我们提供了对应的插件或者 api，而要启用这些功能，需要手动导入并使用插件才行，所以我们在 helper.ts 文件里面把需要的所有插件统一导入，在 index.tsx 里面在同一注册

```typescript
// lfFlowChart/utils/helper.ts
import { MiniMap, SelectionSelect, Snapshot } from '@logicflow/extension'

/**
 * @desc 插件列表
 */
export const extensionList = [
  SelectionSelect, // 引入框选插件
  MiniMap, // 缩略图
  Snapshot, // 保存为图片
]
```

```tsx
const LfFlowChart: FC<LfFlowChartProps> = (props) => {
  useEffect(() => {
    // 注册插件
    extensionList.forEach((extension) => {
      LogicFlow.use(extension)
    })

    lf.current = new LogicFlow({
      container: lfRef.current as HTMLDivElement,
      ...getLfConfig(props.config),
    })

    const { data = {} } = props
    // 流程图渲染
    lf.current.render(data)

    return () => {
      if (lf.current !== null) {
        lf.current = null
      }
    }
  }, [])
  // .....
  const toggleSidebar = () => {}
  const openMiniMap = () => {}
  const selectMoreNode = () => {}
  const lfUndoOrRedo = (type: boolean) => {}
  const lfZoomInOrOut = (type: boolean) => {}
  const saveLfInfo = (type: SaveLfInfoType) => {}
  // ...
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: props.themeColor || defaultThemeColor,
        },
      }}>
      <div className={s.lf_flowChart} ref={lfBoxRef} style={props?.style}>
        <div ref={lfRef}></div>
        <CtrlBar
          style={props?.styleConf?.ctrlBatStyle}
          toggleSidebar={toggleSidebar}
          selectMoreNode={selectMoreNode}
          openMiniMap={openMiniMap}
          lfUndoOrRedo={lfUndoOrRedo}
          lfZoomInOrOut={lfZoomInOrOut}
          saveLfInfo={saveLfInfo}></CtrlBar>
        <EditBar />
        <SideBar />
      </div>
    </ConfigProvider>
  )
}
```

#### 开启/关闭拖拽面板

.......有点简单，直接看代码把

```typescript
export interface LfFlowChartProps {
  themeColor?: string
  // ....
  showCtrlBar?: boolean
}
```

```typescript
// lfFlowChart/utils/index.tsx
const LfFlowChart: FC<LfFlowChartProps> = (props) => {
  // ...
  const { showCtrlBar = true } = props
  const [openCtrlBar, setOpenCtrlBar] = useState<boolean>(showCtrlBar)

  const toggleSidebar = () => {
    setOpenCtrlBar(!openCtrlBar)
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: props.themeColor || defaultThemeColor,
        },
      }}>
      <div className={s.lf_flowChart} ref={lfBoxRef} style={props?.style}>
        <div ref={lfRef}></div>
        {openCtrlBar && <SideBar />}
        // ....
      </div>
    </ConfigProvider>
  )
}
```

#### 开启/关闭框选功能

```typescript
// lfFlowChart/utils/index.tsx
const LfFlowChart: FC<LfFlowChartProps> = (props) => {
  // ...
  const [openSelectMore, setOpenSelectMore] = useState(false)

  // 开启/关闭 框选
  const selectMoreNode = useCallback(() => {
    if (openSelectMore) (lf.current as LogicFlow).extension.selectionSelect.closeSelectionSelect()
    else (lf.current as LogicFlow).extension.selectionSelect.openSelectionSelect()
    setOpenSelectMore(!openSelectMore)
  }, [lf])

  return (
   // ....
  )
}
```

#### 开启/关闭缩略图

```typescript
// lfFlowChart/utils/index.tsx
const LfFlowChart: FC<LfFlowChartProps> = (props) => {
  // ...
  // 开启缩略图
  const openMiniMap = () => {
    const w = props.styleConf?.miniMapPosition?.width || 1000
    const h = props.styleConf?.miniMapPosition?.height || 10
      ; (lf.current as LogicFlow).extension.miniMap.show(w, h)
  }

  return (
   // ....
  )
}
```

#### 回退到上/下一步

可以使用 ctrl + z 代替

```typescript
// lfFlowChart/utils/index.tsx
const LfFlowChart: FC<LfFlowChartProps> = (props) => {
	// ...
  const [undoAble, setUndoAble] = useState(false) // 是否有上一步
  const [redoAble, setRedoAble] = useState(false) // 是否有下一步

  useEffect(() => {
    extensionList.forEach(extension => {
      LogicFlow.use(extension)
    })

    lf.current = new LogicFlow({
      container: lfRef.current as HTMLDivElement,
      ...getLfConfig(props.config),
    })

    const { data = {} } = props
    // 流程图渲染
    lf.current.render(data)

    // 必须在 render 之后才能监听操作变化
    lf.current.on('history:change', (
      { data: { undoAble: _undoAble, redoAble: _redoAble } }
    ) => {
      setUndoAble(_undoAble)
      setRedoAble(_redoAble)
    })

    return () => {
      if (lf.current !== null) {
        lf.current = null
      }
    }
  }, [])

  // ...
  // 回退上一步/下一步
  const lfUndoOrRedo = (type: boolean) => {
    if (type && undoAble) {
      (lf.current as LogicFlow).undo()
    } else if (!type && redoAble) {
      (lf.current as LogicFlow).redo()
    }
  };


  return (
   // ....
  )
}
```

#### 画布放大/缩小

```typescript
// lfFlowChart/utils/index.tsx

const LfFlowChart: FC<LfFlowChartProps> = (props) => {
  // ...
 // 画布放大或缩小
  const lfZoomInOrOut = useCallback((type: boolean) =>
    (lf.current as LogicFlow).zoom(type),
    [lf]
  )

  return (
   // ....
  )
}
```

#### 保存流程图数据

```typescript
// lfFlowChart/utils/index.tsx
import { lfJson2Xml } from '@logicflow/extension'

const LfFlowChart: FC<LfFlowChartProps> = (props) => {
  // ...
 const saveLfInfo = useCallback((type: SaveLfInfoType) => {
    if (!lf.current) return
    let data: any

    if (type === 'image') {
      // 直接保存到本地
      lf.current.getSnapshot()
      return
    } else if (type === 'json') {
      data = lf.current.getGraphData()
    } else {
      data = lfJson2Xml(lf.current.getGraphData())
    }

    return data
  }, [lf])

  return (
   // ....
  )
}
```

到这，我们基本实现所控制面板的所有功能，但是有个问题，就是功能太过琐碎，松散，logic-flow 为我们提供了一个功能：[自定义插件](http://logic-flow.cn/guide/extension/component-custom.html) 目前最重要的是先实现第一个版本的上线，在后续的迭代升级中，我们在给改造成插件模式由于目前话没有节点，我们能测试的功能只有拖拽面板的显示和隐藏，以及下载图片（目前还是空白的图片，但是下载功能已经实现了不是吗）

![image-2023-02-05-20-11-16](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/image-2023-02-05-20-11-16.png)

### 实现自定义节点

自定义节点这一部分可以说是整个流程图组件的重中之重了，我们将结合官网较详细的描述怎么实现自定义节点 [logic-flow 节点](http://logic-flow.cn/guide/basic/node.html) 首先，logic-flow 为我们提供了 7 种自定义节点

> 矩形 rect、圆形 circle、椭圆 ellipse、多边形 polygon、菱形 diamond、文本 text、Html html

logic-flow 官网实例：

![image-2023-02-05-20-11-37](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/image-2023-02-05-20-11-37.png)

> html 节点： 即我们使用 html 定义节点的外观，可以实现比较复杂的外观和内容，例如下图

![image-2023-02-05-20-11-57](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/image-2023-02-05-20-11-57.png)

而在官网中提到了这上面 7 种基础节点是不支持节点缩放的，要想实现节点缩放，需要用到插件包为我们提供的对应的类

![image-2023-02-05-20-12-52](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/image-2023-02-05-20-12-52.png)

而我们自定义节点的实现，实际上就是依赖这个功能来实现的再开始前先简单说下自定义节点的实现与使用，直接放官网实例：

```javascript
// 自定义节点 UserTaskNode.js
import { RectNode, RectNodeModel } from '@logicflow/core'

class UserTaskModel extends RectNodeModel {}

class UserTaskView extends RectNode {}

export default {
  type: 'UserTask',
  view: UserTaskView,
  model: UserTaskModel,
}

// 实例化 logicflow
const lf = new LogicFlow({
  container: document.querySelector('#container'),
})

// 注册节点，必须在 render 之前
lf.register(UserTask)

lf.render()
```

### 实现拖拽面板

### 实现编辑面板

编辑面板需要实现的功能

- 文本样式修改：颜色、大小、行高、字重、是否使用倾斜字体、字体下方是否显示下划线、显示位置（居中，靠左，靠右）
- 连线的样式：虚线、直线、点状线、颜色、粗细
- 节点：边框颜色、背景颜色、层级

### 最终实现效果

## 发布上线
