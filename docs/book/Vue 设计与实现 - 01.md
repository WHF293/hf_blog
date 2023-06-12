# vue 异步组件


:::tip
本文是 《Vue 的设计与实现》 霍春阳  第十三章 `异步组件与函数式组件` 学习笔记
:::

## 基本使用

- 什么是异步组件： [vue-异步组件](https://cn.vuejs.org/guide/components/async.html#async-components)

### vue2

```html
<template>
  <div>
    <!-- 动态组件 -->
    <CommonComponent></CommonComponent>
    <!-- 异步组件 -->
    <AsyncComponent1></AsyncComponent1>
    <!-- 普通组件 -->
    <AsyncComponent2></AsyncComponent2>
  </div>
</template>
<script>
  import CommonComponent from './CommonComponent'
  import LoadingComponent from './LoadingComponent'
  import ErrorComponent from './ErrorComponent'

  export default {
    components: {
      CommonComponent,
      AsyncComponent1: () => import('./CommonComponent2'),
      AsyncComponent2: () => ({
        component: import('./CommonComponent3.vue'),
        loading: LoadingComponent,
        error: ErrorComponent,
        delay: 200, // 展示加载时组件的延时时间。默认值是 200 (毫秒)
        timeout: 2000, // 如果超时，则使用 error 组件
      }),
    },
  }
</script>
```

### vue3

> vue3 中一般搭配 suspence 使用

```vue
<template>
  <div>
    <!-- 普通组件 -->
    <CommonComponent></CommonComponent>
    <!-- 简单的异步组件 -->
    <AsyncComponent1></AsyncComponent1>
    <!-- 复杂异步组件 -->
    <AsyncComponent2></AsyncComponent2>
    <!-- 异步组件搭配 Suspence 组件 -->
    <Suspence>
      <AsyncComponent1 />
      <template #fallback>
        <LoadingComponent />
      </template>
    </Suspence>
  </div>
</template>
<script setup>
  import { defineAsyncComponent } from 'vue'
  import CommonComponent from './CommonComponent'
  import LoadingComponent from './LoadingComponent'

  const AsyncComponent1 = defineAsyncComponent(() => import('./CommonComponent2.vue'))

  const AsyncComp = defineAsyncComponent({
    // 加载函数
    loader: () => import('./CommonComponent3.vue'),
    // 加载异步组件时使用的组件
    loadingComponent: LoadingComponent,
    // 加载失败后展示的组件
    errorComponent: ErrorComponent,
    // 展示加载组件前的延迟时间，默认为 200ms
    delay: 200,
    // 如果提供了一个 timeout 时间限制，并超时了
    // 也会显示这里配置的报错组件，默认值是：Infinity
    timeout: 3000,
  })
</script>
```

### 应用场景

例如常见的后台管理页面中，经常出现的场景比如点击某个按钮，弹出一个弹窗或者其他东西，这部分功能通常是独立封装成另一个组件的，针对这种场景，对于部分用户来说可能都不会去操作这个按钮，那么对于这部分的组件就可以使用异步组件来减少页面初次渲染需要加载的资源大小（如果文件逻辑比较简单，那就不要使用异步组件，毕竟接口请求也是需要消耗时间的）

## 实现原理

> 后面我们将模仿 vue 的源码实现一个异步组件

```vue
<template>
  <AsyncComp></AsyncComp>
</template>
<script>
export default {
  components: {
    AsyncComp: defineAsyncComponent(() => import('./comp.vue')),
  },
}
</script>
```

异步组件本质上是一个`高阶组件`，它接受一个 loader 参数，用于异步加载相应的组件

### 基本异步实现

基本实现就是我们接受一个 promise 去加载一个组件，返回一个新的组件

- 如果加载成功就返回 promise 返回的组件
- 如果失败，那么返回的组件就是一个空的字符串节点组件

```ts
import { ref, defineComponent } from 'vue'

type Loader = () => promise<defineComponent>

function defineAsyncComponent(loader: Loader) {
  let InnerComp = null

	// 返回一个新的组件
  return {
    name: 'AsyncComponentWrapper',
    setup() {
      const loaded = ref(false)
      loader().then((comp) => {
        InnerComp = comp
        loaded.value = true
      })

      // 如果加载成功，返回对应的组件，否则返回一个空的字符串节点
      return () => (loaded.value 
        ? { type: InnerComp } 
        : { type: Text, children: '' }
      )
    },
  }
}
```

### 超时和 error 组件

有的时候，我们希望在规定时间内，如果组件还是无法动态加载出来或者组件加载直接报错的时候，我们希望有个能兜底的组件，避免应用报错，这个时候就需要显示异常的组件

```ts
import { ref, onMounted, defineComponent, shallowRef } from 'vue'

type Loader = () => promise<defineComponent>
interface Options {
  loader: Loader
  timeout?: number // 超时时间
  errorComponent?: defineComponent // 加载异常/加载超时时显示的组件
}

type AsyncCompOptions = Loader | Options
function defineAsyncComponent(options) {
  // 参数归一化
  if (typeof option === 'function') {
    options = {
      loader: options,
    }
  }

  const { loader } = options

  let InnerComp = null
  return {
    name: 'AsyncComponentWrapper',
    setup() {
      const loaded = ref(false)
      const error = shallowRef(null) // 用于存储异常对象

      options
        .loader()
        .then((comp) => {
          InnerComp = comp
          loaded.value = true
        })
        .catch((err) => {
          error.value = err
        })

      let timer = null
      // 如果传入了 timeout 配置，则开启定时器
      if (options.timeout) {
        timer = setTimeout(() => {
          const err = new Error('异步组件加载超时')
          error.value = err
        }, options.timeout)
      }

      // 组件挂载的时候清除定时器
      onMounted(() => clearTimeout(timer))

      // 通过这个组件兜底
      const placeholder = { type: Text, children: '' }

      // 超时时判断是否有传入异常组件，没有的话使用空的文本节点代替
      const errorComponent = options.errorComponent
				// // 把异常原因通过 props 传递给异常组件
        ? { type: options.errorComponent, props: { error: error.value } }
        : placeholder

      return () => ({
        if (loaded.value) {
          return { type: InnerComp }
        } else if (error.value && options.errorComponent) {
          return errorComponent
        } else {
          return placeholder
        }
      })
    },
  }
}
```

### 延迟和 Loading 组件

一般使用异步组件的场景，要么是这个组件在初始渲染时用不到（即需要一定条件才会触发），但是异步组件加载的同时可能也会伴随其他多的网络请求，所以针对这种情况，我们有时需要异步组件延迟几秒后在加载

先修改下类型提示

```ts
type Loader = () => promise<defineComponent>
interface Options {
  loader: Loader
  timeout?: number // 超时时间
  errorComponent?: defineComponent // 加载异常/加载超时时显示的组件
  delay?: number // 是否开启延迟加
  loadingComponent?: defineComponent // 延迟加载时显示的 loading 组件（一般骨架屏用的就是这个属性）
}
```

```ts
function defineAsyncComponent(options) {
  // 参数归一化
  if (typeof option === 'function') {
    options = {
      loader: options,
    }
  }

  const { loader } = options

  let InnerComp = null
  return {
    name: 'AsyncComponentWrapper',
    setup() {
      const loaded = ref(false)
      const error = shallowRef(null) // 用于存储异常对象

      const loading = ref(false) // 标识组件是否处于 loading 状态，默认不是
      let loadingTimer = null
      if (options.delay) {
        loadingTimer = setTimeout(() => {
          loading.value = true
        }, options.delay)
      } else {
        loading.value = true
      }

      options
        .loader()
        .then((comp) => {
          InnerComp = comp
          loaded.value = true
        })
        .catch((err) => {
          error.value = err
        })
        .finally(() => {
          loading.value = false
          clearTimeout(loadingTimer)
        })

      let timer = null
      // 如果传入了 timeout 配置，则开启定时器
      if (options.timeout) {
        timer = setTimeout(() => {
          const err = new Error('异步组件加载超时')
          error.value = err
        }, options.timeout)
      }

      // 组件挂载的时候清除定时器
      onMounted(() => clearTimeout(timer))

      // 通过这个组件兜底
      const placeholder = { type: Text, children: '' }

      // 超时时判断是否有传入异常组件，没有的话使用空的文本节点代替
      const errorComponent = options.errorComponent
        ? { type: options.errorComponent, props: { error: error.value } }
        : placeholder

      return () => ({
        if (loaded.value) {
          return { type: InnerComp }
        } else if (error.value && options.errorComponent) {
          return errorComponent
        } else if (options.loading && options.loadingComponent) {
          return options.loadingComponent
        } else {
          return placeholder
        }
      })
    },
  }
}
```

### 重试机制

重试机制，在 ahooks、vue-request 等目前常用的接口请求工具中都为我们提供了这一功能，即当我们的某一操作出现请求异常的时候，能够重新发起请求，在连续 N 次请求都失败后在运行出现异常时的具体逻辑

同样的， vue 的异步组件也提供了类似的能力

修改 interface

```ts
type Loader = () => promise<defineComponent>
interface Options {
  // ....和前面的一样，忽略
  onError: (
    retry: () => Promise<any>, // 重试函数
    fail: () => Promise<any>, // 失败函数
    retryNum: number, // 重试次数
  ) => void
}
```

我们先实现重试机制

```ts
function defineAsyncComponent(options) {
	// 参数归一化
  if (typeof option === 'function') {
    options = {
      loader: options,
    }
  }

  const { loader } = options

  let InnerComp = null

	let retryNum = 0
	const load = () => {
		// 执行传进来的加载组件的逻辑
		return loader()
			.catch(err => {
				// 如果加载异常，并且传入了 onError，则执行 onError，否则直接抛出异常
				if (options.onError) {
					return new Promise((resolve, reject) => {
						const retry = () => {
							resolve(load())
							retryNum++
						}
						const fail = () => reject(err)
						options.onError(retry, reject, retryNum)
					})
				} else {
					throw err
				}
			})
		}

	return () => {
		name: 'AsyncComponentWrapper',
		setup() {
			// 逻辑和之前的基本一致，处理执行 loader 的逻辑改成 执行 load 函数
			// 原来这里是 options.loader().then().catch().finally()
			load()
				.then((comp) => {
          InnerComp = comp
          loaded.value = true
        })
        .catch((err) => {
          error.value = err
        })
        .finally(() => {
          loading.value = false
          clearTimeout(loadingTimer)
        })
			// 后面逻辑不变
		}
	}
}

```

## 完整代码

```ts
import { ref, onMounted, defineComponent, shallowRef } from 'vue'

type Loader = () => promise<defineComponent>
type ErrorFun = (
    retry: () => Promise<any>, // 重试函数
    fail: () => Promise<any>, // 失败函数
    retryNum: number, // 重试次数
  ) => void
interface Options {
  loader: Loader
  timeout?: number // 超时时间
  errorComponent?: defineComponent // 加载异常/加载超时时显示的组件
  delay?: number // 是否开启延迟加
  loadingComponent?: defineComponent // 延迟加载时显示的 loading 组件（一般骨架屏用的就是这个属性）
  onError?: ErrorFun
}

function defineAsyncComponent(options) {
	// 参数归一化
  if (typeof option === 'function') {
    options = {
      loader: options,
    }
  }

  const { loader } = options

  let InnerComp = null

	let retryNum = 0
	const load = () => {
		// 执行传进来的加载组件的逻辑
		return loader()
			.catch(err => {
				// 如果加载异常，并且传入了 onError，则执行 onError，否则直接抛出异常
				if (options.onError) {
					return new Promise((resolve, reject) => {
						const retry = () => {
							resolve(load())
							retryNum++
						}
						const fail = () => reject(err)
						options.onError(retry, reject, retryNum)
					})
				} else {
					throw err
				}
			})
		}

	return () => {
		name: 'AsyncComponentWrapper',
		setup() {
			const loaded = ref(false)
      const error = shallowRef(null) // 用于存储异常对象

      const loading = ref(false) // 标识组件是否处于 loading 状态，默认不是
      let loadingTimer = null
      if (options.delay) {
        loadingTimer = setTimeout(() => {
          loading.value = true
        }, options.delay)
      } else {
        loading.value = true
      }

			load()
				.then((comp) => {
          InnerComp = comp
          loaded.value = true
        })
        .catch((err) => {
          error.value = err
        })
        .finally(() => {
          loading.value = false
          clearTimeout(loadingTimer)
        })

			let timer = null
      // 如果传入了 timeout 配置，则开启定时器
      if (options.timeout) {
        timer = setTimeout(() => {
          const err = new Error('异步组件加载超时')
          error.value = err
        }, options.timeout)
      }

      // 组件挂载的时候清除定时器
      onMounted(() => clearTimeout(timer))

      // 通过这个组件兜底
      const placeholder = { type: Text, children: '' }

      // 超时时判断是否有传入异常组件，没有的话使用空的文本节点代替
      const errorComponent = options.errorComponent
        ? { type: options.errorComponent, props: { error: error.value } }
        : placeholder

      return () => ({
        if (loaded.value) {
          return { type: InnerComp }
        } else if (error.value && options.errorComponent) {
          return errorComponent
        } else if (options.loading && options.loadingComponent) {
          return options.loadingComponent
        } else {
          return placeholder
        }
      })
		}
	}
}
```
