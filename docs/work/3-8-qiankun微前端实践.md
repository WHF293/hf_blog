<!--
 * @Author: hfWang
 * @Date: 2023-02-09 20:53:39
 * @LastEditTime: 2023-02-09 20:54:01
 * @Description: file content
 * @FilePath: \whf_blog\docs\work\qiankun 微前端实践.md
-->

# qiankun 微前端实践

- [qiankun](https://qiankun.umijs.org/zh/guide)

## qiankun 的主应用配置

```js
// src/index.js
import { registerMicroApps, start } from 'qiankun'
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.mount()

const microAppList = [
  {
    name: 'reactApp',
    entry: '//localhost:3000',
    container: '#container',
    activeRule: '/app-react',
    props: {
      name: 'kuitos',
    },
  },
  {
    name: 'vueApp',
    entry: '//localhost:8080',
    container: '#container',
    activeRule: '/app-vue',
    props: {
      name: 'kuitos',
    },
  },
]

// 注册微应用
registerMicroApps(microAppList)
// 启动 qiankun, qiankun 启动的时候会在 window 下新增
// __POWERED_BY_QIANKUN__ 和 __INJECTED_PUBLIC_PATH_BY_QIANKUN__两个属性
start()
```

## qiankun 微应用配置

通用

```js
// public-path.js
if (window.__POWERED_BY_QIANKUN__) {
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__
}
```

微应用的 webpack 都要配置

`config.header = { 'Access-Control-Allow-Origin': '*', }`

打包格式为 `umd`

### react 子应用

```jsx
import './public-path'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

function render(props) {
  const { container } = props
  ReactDOM.render(<App />, container
    ? container.querySelector('#root')
    : document.querySelector('#root')
  )
}

// 独立运行
if (!window.__POWERED_BY_QIANKUN__) {
  render({})
}

/**
 * bootstrap 只会在微应用初始化的时候调用一次，下次微应用重新进入时会直接调用 mount 钩子，
 * 不会再重复触发 bootstrap。通常我们可以在这里做一些全局变量的初始化，
 * 比如不会在 unmount 阶段被销毁的应用级别的缓存等。
 */
export async function bootstrap() {
  console.log('[react16] react app bootstraped')
}

/**
 * 应用每次进入都会调用 mount 方法，通常我们在这里触发应用的渲染方法
 */
export async function mount(props) {
  console.log('[react16] props from main framework', props)
  render(props)
}

/**
 * 应用每次 切出/卸载 会调用的方法，通常在这里我们会卸载微应用的应用实例
 */
export async function unmount(props) {
  const { container } = props
  // 移除应用
  ReactDOM.unmountComponentAtNode(container
    ? container.querySelector('#root')
    : document.querySelector('#root')
  )
}

/**
 * 可选生命周期钩子，仅使用 loadMicroApp 方式加载微应用时生效
 */
export async function update(props) {
  console.log('update props', props)
}
```

### vue 子应用

```js
// main.js
import './public-path'
import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import routes from './router'
import store from './store'

Vue.config.productionTip = false

let router = null
let instance = null
function render(props = {}) {
  const { container } = props
  router = new VueRouter({
    // 设置正确的静态资源路径
    base: window.__POWERED_BY_QIANKUN__ ? '/app-vue/' : '/',
    mode: 'history',
    routes,
  })

  instance = new Vue({
    router,
    store,
    render: (h) => h(App),
  }).$mount(container ? container.querySelector('#app') : '#app')
}

// 独立运行时
if (!window.__POWERED_BY_QIANKUN__) {
  render()
}

/**
 * bootstrap 只会在微应用初始化的时候调用一次，下次微应用重新进入时会直接调用 mount 钩子，
 * 不会再重复触发 bootstrap。通常我们可以在这里做一些全局变量的初始化，
 * 比如不会在 unmount 阶段被销毁的应用级别的缓存等。
 */
export async function bootstrap() {
  console.log('[vue] vue app bootstraped')
}

/**
 * 应用每次 切出/卸载 会调用的方法，通常在这里我们会卸载微应用的应用实例
 */
export async function mount(props) {
  console.log('[vue] props from main framework', props)
  render(props)
}

/**
 * 可选生命周期钩子，仅使用 loadMicroApp 方式加载微应用时生效
 */
export async function unmount() {
  // 移除应用
  instance.$destroy()
  instance.$el.innerHTML = ''
  instance = null
  router = null
}
```

## qiankun 父子通信

- [qiankun-api-initGlobalState](https://qiankun.umijs.org/zh/api#initglobalstatestate)

qiankun 为我们提供了 `initGlobalState` 这个 api 用于父子应用通信

initGlobalState 返回一个 MicroAppStateActions 对象，它有三个属性：

- `onGlobalStateChange: (callback: OnGlobalStateChangeCallback, fireImmediately?: boolean) => void`：注册观察者函数 - 响应 globalState 变化，在 globalState 发生改变时触发该 观察者 函数。
- `setGlobalState: (state: Record<string, any>) => boolean`：设置 globalState - 设置新的值时，内部将执行`浅检查`(按一级属性设置全局状态，微应用中只能修改已存在的一级属性)，如果检查到 globalState 发生改变则触发通知，通知到所有的 观察者 函数【深度监听的】
- `offGlobalStateChange: () => boolean`：移除当前应用的状态监听，微应用 umount 时会默认调用

### 父应用

```ts
import { initGlobalState, MicroAppStateActions } from 'qiankun'
const state = {
  a: 1,
  b: 2
}
// 初始化通信池
const actions: MicroAppStateActions = initGlobalState(state)
// 监听通讯池的变化
actions.onGlobalStateChange((state, prev) => {
  // state: 变更后的状态; prev 变更前的状态
  console.log(state, prev)
})

actions.setGlobalState(state);
actions.offGlobalStateChange();
```

### 子应用

```js
// /src/qiankun/action.js
function emptyAction() {
  console.warn('当前使用的是空 Action')
}

class Actions {
  actions = {
    onGlobalStateChange: emptyAction,
    setGlobalState: emptyAction,
  }

  setActions(actions) {
    this.actions = actions
  }

  onGlobalStateChange() {
    return this.actions.onGlobalStateChange(...arguments)
  }

  setGlobalState() {
    return this.actions.setGlobalState(...arguments)
  }
}

export default new Actions()
```

vue 子应用入口文件引入 action

```js
// src/main.js
import action from './qiankun/action'
export async function mount(props) {
  console.log('[vue] props from main framework', props);
  action.setActions(props)
  render(props);
}
```

具体使用

```js
// demo.vue
import action from '@/qiankun/action'
export default {
  name: 'Home',
  mounted() {
    // 接收state
    action.onGlobalStateChange((state) => {
      console.log(state)
    }, true);
  },
  methods:{
    changeValue(){
      // 修改state
      action.setGlobalState({ abc: 789 })
    }
  }
}
```

子应用可以修改通讯池，修改完会被主应用监听到。


## 部署


