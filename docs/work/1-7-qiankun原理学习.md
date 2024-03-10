# qiankun 原理学习

- [qiankun 官网](https://qiankun.umijs.org/zh/guide)

## qiankun 的特点

- 📦 基于 single-spa 封装，提供了更加开箱即用的 API。
- 📱 技术栈无关，任意技术栈的应用均可 使用/接入。
- 💪 HTML Entry 接入方式，让你接入微应用像使用 iframe 一样简单。
- 🛡​ 样式隔离，确保微应用之间样式互相不干扰。
- 🧳 JS 沙箱，确保微应用之间 全局变量/事件 不冲突。
- ⚡️ 资源预加载，在浏览器空闲时间预加载未打开的微应用资源，加速微应用打开速度。

### qiankun 和 single-spa 的区别

> qiankun 是基于 single-spa 封装的

:::warning

- single-spa 的思想： single-spa 认为任何一个 web 前端应用都可以被打包成一个 js 模块，这样的话对于一个巨石应用来说，就可以拆分成一个主应用 + 若干个子应用（js 模块），在主应用通过 jsonp 的方式请求对应的 js 模块(子应用), 并将其插入到主应用即可实现巨石应用的拆分

- qiankun 的思想：qiankun 是基于 single-spa 实现的，底层的 api 用的都是 single-spa 的 api，但是针对 single-spa 的缺点进行了优化。
  1. qiankun 认为打包后的入口文件不应该是 js 模块，而是一个 html 文件
  2. 针对 single-spa 没有 js 隔离和 css 隔离的缺陷，为我们提供了 3 种 js 沙箱和 2 种 css 沙箱用于隔离 js 和 css
  3. 简化了主应用和子应用的接入成本，为我们提供更简便的 api
  4. 为我们提供了子应用预加载和子应用缓存的功能 
:::

|            | 注册子应用的 api    | 请求的资源 | 支持子应用预加载 | 支持子应用缓存 |
| ---------- | ------------------- | ---------- | ---------------- | -------------- |
| single-spa | registerApplication | js         | 不支持           | 不支持         |
| qiankun    | registerMicoApp     | html       | 支持             | 支持           |

registerMicoApp 是对 registerApplication 进行了一次封装

### qiankun registerMicoApp

首先就是 registerMicoApp 的使用

```js
registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:8080',
    container: '#container',
    activeRule: '/react',
    props: {
      a: 1,
    },
  },
])
```

```ts
let microApps: Array<RegistrableApp<Record<string, unknown>>> = []

export function registerMicroApps<T extends ObjectType>(
  apps: Array<RegistrableApp<T>>,
  lifeCycles?: FrameworkLifeCycles<T>,
) {
  // 获取还没有注册过的 子应用
  // 每个应用只需要注册一次，避免多次调用 registerMicroApps 函数同时注册了相同的应用
  const unregisteredApps = apps.filter(
    (app) => !microApps.some((registeredApp) => registeredApp.name === app.name), //
  )

  microApps = [...microApps, ...unregisteredApps]

  unregisteredApps.forEach((app) => {
    const { name, activeRule, loader = noop, props, ...appConfig } = app

    registerApplication({
      name, // 子应用名称，必须唯一
      app: async () => {
        // 1. 加载和解析`html`资源，获取页面、样式资源链接、脚本资源链接三种数据
        // 2. 对外部样式资源（css）进行加载处理，生成`render`函数
        // 3. 生成 `js`沙箱
        // 4. 加载外部脚本资源（js），且进行包装、执行
        // 5. 从入口文件里获取生命周期钩子函数：`bootstrap`、`mount`、`unmount`，
        // 然后当作registerApplication的app形参中的返回数据，如下所示

        loader(true)
        await frameworkStartedDefer.promise

        const { mount, ...otherMicroAppConfigs } = (
          await loadApp(
            { name, props, ...appConfig },
            frameworkConfiguration,
            lifeCycles, //
          )
        )()

        return {
          mount: [
            async () => loader(true),
            ...toArray(mount), //
            async () => loader(false),
          ],
          ...otherMicroAppConfigs,
        }
      },
      // 子应用激活路径
      activeWhen: activeRule,
      // 需要传递给子应用的数据
      customProps: props,
    })
  })
}
```

## 快速学习乾坤实现流程

- [不懂 qiankun 原理?这篇文章五张图片带你迅速通晓](https://juejin.cn/post/7202246519080304697)

### qiankun 的整个流程

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3d0eb49c886b496e8ff36fb5060ba00d~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp?)

### 加载解析 html

qiankun 使用了 import-html-entry 这个库去处理 html 资源，并通过正则将 html 解析为下面几个模块

- template
- scripts
- entry
- styles

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e6440eadfdde409ebf67e7949e25e14c~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp?)

### css 外部样式处理

比如入口的 html 文件中引入了 main.css, 在 html 解析的时候，对应的 css 文件引入代码在 template 里面会先被注释掉并打上标记

等第一步解析完成之后，再去请求 styles 里面的资源信息，在成功获取后在插入到 template 中标记的地方

成功合并之后生成新的 template，在根据新的 template 生成响应的 render 函数

render 在把我们的子应用挂载到父应用上对应的节点上

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/67ffc1e220624a91a92b9176e5e7c82b~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp?)

### js 沙箱处理

js 沙箱 `用于隔离应用间的 window 环境，防止子应用在执行代码期间影响了其他应用设置在 window 上的属性`

qiankun 为我们提供了 3 种 js 沙箱

|                   | 名称     | 原理简述                                 |
| ----------------- | -------- | ---------------------------------------- |
| `SnapshotSandbox` | 快照沙箱 | 保存快照，diff                           |
| `LegacySandbox`   | 单例沙箱 | window 变化监听 + diff                   |
| `ProxySandbox`    | 多例沙箱 | proxy 代理和 window 相同属性方法的纯对象 |

> 具体差别可以看下文的 沙箱实现思路 部分

ProxySandbox：

1. window 上的全部属性复制到一个纯对象里面
1. 使用 proxy 代理这个纯对象
   - 子应用如果访问的属性是在设置的白名单（比如 window 上原本就有的属性、方法）里面的话，那会先把 window 上原先的值复制一份，子应用可以直接访问/修改 window 上对应的属性，子应用销毁时再把备份的数据重新给 window 上对的对应属性赋值
   - 如果不在白名单里面，访问 / 修改的就是纯对象里的数据，window 上的属性不会被访问 / 改变

> ProxySandbox 缺点：这种沙箱只能隔离 Window 的一级属性。因为 Proxy 只会捕获到一级属性的增删改，不能捕获到二级以上属性的变动

### 加载外部 js 资源

使用上一步的沙箱对请求到的 js 资源进行包装

例如我们要请求一个 `http://xxxx:xxx/main.bunlde.xxx.js` 文件

```js
// main.bunlde.xxx.js
function a() {
  // ...
  b()
}
function b() {
  // ...
}
a()
```

使用沙箱封装

```js
;(function(window, self, globalThis){
	// with 语句的主要作用是将代码的作用域设置到一个特定的对象中，简化多次编写同一个对象的工作
  with(window){
		function a() {
			// ...
			b()
		}
		function b() {
			// ...
		}
		a()
  }
).bind(window.proxy)(
	window.proxy,
	window.proxy,
	window.proxy
);
```

![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4613f4f4e96c4b569ed929d81d8842db~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp?)

### 从入口文件获取生命周期钩子函数

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/44b96e3a18114c88ab0621db2cf4f103~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp?)

## qiankun js 沙箱具体实现思路

qiankun 沙箱发展时间线

- [Qiankun 原理——JS 沙箱是怎么做隔离的](https://juejin.cn/post/7148075486403362846)

qiankun 为我们提供了 3 种 js 沙箱

> `SnapshotSandbox` --> 优化 --> `LegacySandbox` --> es6 的 proxy 普及，再次优化 --> `ProxySandbox`

### `SnapshotSandbox` 快照沙箱

- 将原本的 window 上的属性复制出来一份另外保存
- 子应用修改 window 上的属性
- 子应用卸载，diff window 和之前另外保存的那份数据，找出 diff 结果，保存 diff 结果
- 使用备份数据恢复原先 window 上的属性
- 子应用再次挂载时，将之前保存的 diff 结果重新赋值到 window 上

> 缺点：如果给 window 上自定义了上千个属性，那么每次子应用挂载、卸载每次 diff 都要花费较大的性能开销，而且同一时间内只能有存在一个子应用，若页面需要同时出现两个子应用则会出现异常，简单概括会`污染全局 window`

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/20621cb0fcad4b079473bba57cbece43~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)

### `LegacySandbox` 单例沙箱

针对上面每次都需要大量 diff 操作带来的性能消耗，qiankun 提供了另一种沙箱实现方式，就是监听 window 上的修改来记录 diff 内容

- 子应用修改 window 属性
  - 修改的是原本就有的属性
    - 分别记录新的值和旧的值
  - 新增的属性
    - 记录下来
- 子应用卸载时
  - 直接从 window 上把前面新增的属于移除
  - 对于原本就有的属性，使用保存的旧值直接替换

> 缺点：和快照沙箱一样，同样是会 `污染全局 window` 且只能存在单例子应用

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f7ad2165ee3a4c68aab88a59a303d182~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)

### `ProxySandbox` 多例沙箱

为了解决只能使用单例的问题，qiankun 又提出了另一种沙箱形式——代理沙箱

为每个子应用单独代理一个 window 对象，大致实现可以看前面 `[js 沙箱处理]` 部分

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a6aebde8492943bba6420a0027f09027~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)

### js 沙箱总结

- SnapshotSandbox：记录 window 对象，每次 unmount 都要和微应用的环境进行 Diff
- LegacySandbox：在微应用修改 window.xxx 时直接记录 Diff，将其用于环境恢复
- ProxySandbox：为每个微应用分配一个 fakeWindow，当微应用操作 window 时，其实是在 fakeWindow 上操作

## qiankun css 沙箱具体实现思路

> `qiankun 的沙箱可以确保单实例场景子应用之间的样式隔离，但是无法确保主应用跟子应用、或者多实例场景的子应用样式隔离。`

### `shadow Dom` 沙箱

`strictStyleIsolation: true`

- [MDN-shadow DOM](https://developer.mozilla.org/zh-CN/docs/Web/Web_Components/Using_shadow_DOM)
- [深入理解 Shadow DOM v1](https://segmentfault.com/a/1190000019115050)

:::warning shadow Dom

- 封装

封装是面向对象编程的基本特性，它使程序员能够限制对某些对象组件的未授权访问。

在此定义下，对象以公共访问方法的形式提供接口作为与其数据交互的方式。这样对象的内部表示不能直接被对象的外部访问。

- Shadow DOM

Shadow DOM 将此概念引入 HTML，它允许你将隐藏的，分离的 DOM 链接到元素，这意味着你可以使用 HTML 和 CSS 的本地范围。

现在可以用更通用的 CSS 选择器而不必担心命名冲突，并且样式不再泄漏或被应用于不恰当的元素。 
:::

通常我们将正常的 dom 节点叫做 light dom，用于区分正常 dom 和 shadow dom

缺点：

- 组件库问题，比如常见的弹窗、提示条等，组件库一般都是挂载到 body 下面的，但是 shadow 会隔离 css，导致子应用里对这些挂载在 body 下的组件失去样式控制
- 事件代理问题，如 react 是通过自己的合成事件机制处理事件的，即所有事件都要冒泡到 body 元素来进行处理，但 shadow dom 包裹的元素其对应的事件不会冒泡到 body

### `scoped Css` 沙箱

`experimentalStyleIsolation: true`

qiankun 会改写子应用所添加的样式，为所有样式规则增加一个特殊的选择器规则来限定其影响范围

类似如下：

```css
/* 我们自己写的 css 类名 */
.app-main {
  font-size: 14px;
}

/* 转化之后的 css 类名 */
div[data-qiankun-子应用名称] .app-main {
  font-size: 14px;
}
```

这个就有点想 vue 的 css scoped 了

缺点：

- @keyframes , @font-face , @import , @page 不被支持
- 子应用 css 中的 var 变量会丢失
- 同 shadow dom，组件库那些挂载在 body 下的组件样式丢失

### qiankun css 解决方案

- vue：可以使用自己的 css scoped 减少样式冲突，针对少部分异常样式可以针对性修改
- react： 使用 css module 代替，如 xxx.module.less / xxx.module.scss / xxx.module.css
- 使用 tailwind / windicss / unocss 等原子化的 css 框架
