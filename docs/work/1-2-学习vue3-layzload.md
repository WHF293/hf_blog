# 学习 vue3-lazy

:::warning 
今天开新坑，学习 vue3 中怎么通过自定义指令实现图片懒加载 
:::

- [vue3-lazy](https://github.com/ustbhuangyi/vue3-lazy)

## 怎么使用

```js
// src/main.js
import { createApp } from 'vue'
import App from './app'
import lazyPlugin from 'vue3-lazy'

const app = createApp(App)
app.use(lazyPlugin, {
  loading: 'loading.png',
  error: 'error.png',
})
app.mount('#app')
```

```html
<!-- demo.vue -->
<template>
  <ul>
    <li v-for="img in list">
      <img v-lazy="img.src" />
    </li>
  </ul>
</template>
```

ok, 了解完怎么使用后，老王开始和你们一块来学源码了

不想看源码的直接跳到【总结】部分查看就行

## 项目目录结构

```
- src
    - core
        - lazy.ts
        - imageManage.ts
    - helper
        - debug.ts
        - dom.ts
        - loadImage.ts
        - utils.ts
    - types
        - index.ts
    - index.ts
```

## 入口文件

```ts
// index.ts
import { App } from 'vue'
import { LazyOptions } from './types'
import Lazy from './core/lazy'

const lazyPlugin = {
	// install： 使用插件就会调用这个方法
	// app: vue 实例
	// options: app.use(name, options) 用户传入的配置
	install(app: App, options: LazyOptions) {
		// 实例化了一个 Lazy 实例
    const lazy = new Lazy(options)

    app.directive('lazy', {
			// vue3 中自定义指令的函数入参为 （el，binding， vnode， preNode）
      mounted: lazy.add.bind(lazy),
      updated: lazy.update.bind(lazy),
      unmounted: lazy.update.bind(lazy),
    })
  },
}

export default lazyPlugin


// types/index.ts
export interface LazyOptions {
  error?: string
  loading?: string
}
```

> 注意：vue2 和 vue3 的自定义指令生命周期不一致, 但钩子的入参都一样
>
> [vue2](https://v2.cn.vuejs.org/v2/guide/custom-directive.html): bind inserted update componentUpdate unbind 
>
> [vue3](https://cn.vuejs.org/guide/reusability/custom-directives.html): created beforeMount mounted beforeUpdate updated beforeUnmount unmounted


## Lazy 类

先看下 

```ts
export default class Lazy {
  error: string // 加载异常显示的照片
  loading: string // 图片加载时显示的照片
  cache: Set<string> // 缓存
  managerQueue: ImageManager[] // 管理器队列
  observer?: IntersectionObserver // 观察者
  targetQueue?: Target[] // 目标队列
  throttleLazyHandler: Function // 节流函数

  constructor (options: LazyOptions) {
    this.error = options.error || DEFAULT_URL
    this.loading = options.loading || DEFAULT_URL

    this.cache = new Set() // cache 定义为 set 确保里面的图片不会重复
    this.managerQueue = []

    // 节流函数
    this.throttleLazyHandler = throttle(this.lazyHandler.bind(this), THROTTLE_DELAY)

    this.init()
  }
	// 。。。。
}
```

所以我们看下 init 函数

### init

```ts
export default class Lazy {
	// ....
	private init (): void {
		// 判断浏览器是不是支持 IntersectionObserver，如果支持，懒加载通过这个 api 来判断是否显示图片
		// 否则的化使用前面定义的节流函数来处理
		if (hasIntersectionObserver) {
			this.initIntersectionObserver()
		} else {
			this.targetQueue = []
		}
	}
	// ...
}
```


```js
export default class Lazy {
	// ...
	// 定义观察者
  private initIntersectionObserver (): void {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
				// 当前元素可见
        if (entry.isIntersecting) {
					// 从图片管理队列里找出对应数据
          const manager = this.managerQueue.find((manager) => {
            return manager.el === entry.target
          })
					// 如果管理队列里存在该数据，加载对应图片并从管理队列里移除该数据
          if (manager) {
            if (manager.state === State.loaded) {
              this.removeManager(manager)
              return
            }
            manager.load()
          }
        }
      })
    }, {
      rootMargin: '0px',
      threshold: 0
    })
  }
	// ....
}
```

ok，根据我们学过的知识（什么，没学过，那怪我？？？）结合上面的内容，我们可以先这么推测：

- mounted 的时候把通过 v-lazy 绑定的信息保存到 managerQueue 中， 同时使用前面生成的 observer 观察管理队列里的全部元素
- updated 的时候取更新 managerQueue 的信息， 同时使用前面生成的 observer 观察管理队列里的全部元素
- unMounted 的时候取消观察，清空管理队列

so，我们往下看 add update 这两个函数

### add update

```ts
export default class Lazy {
	// ....
  add (el: HTMLElement, binding: DirectiveBinding): void {
		// binding.value ==> 就是 v-lazy="xxxx" 里面的 xxx，也就是图片要显示的 url 地址
    const src = binding.value 

		// 寻找父级元素中 overflow 为 auto 或 scroll 的元素，因为图片懒加载显不显示是要用到这个的
    const parent = scrollParent(el)

		// 为每使用 v-lazy 的元素实例化一个 ImageManager 实例
    const manager = new ImageManager({
      el,
      parent,
      src,
      error: this.error,
      loading: this.loading,
      cache: this.cache
    })

		// 将生成的实例保存到队列中
    this.managerQueue.push(manager)

		// 如果当前环境支持 IntersectionObserver ，则使用这个 api 判断
    if (hasIntersectionObserver) {
      this.observer!.observe(el)
    } else {
			// 不支持的化通过监听前面获取到 overflow 符合的父元素和 window 的滚动事件
      this.addListenerTarget(parent)
      this.addListenerTarget(window)
			// 节流加载图片
      this.throttleLazyHandler()
    }
  }

	// 如果图片 url 发生改变
  update (el: HTMLElement, binding: DirectiveBinding): void {
    const src = binding.value
		// 从管理队列里面找
    const manager = this.managerQueue.find((manager) => {
      return manager.el === el
    })
		// 如果存在说明图片还没开始加载
    if (manager) {
			// 调用 ImageManager 实例里面的 update 函数更新 src
      manager.update(src)
    }
  }
	// ....
}
```

不支持 IntersectionObserver 的场景我们先不管，后面在看，先找到 scrollParent 和 ImageManager 这两货,
看到 lazy.ts 最上面，找到他们，如下:


```ts
import { hasIntersectionObserver, scrollParent } from '../helpers/dom'
import ImageManager from './imageManager'
```

ok，按顺序分析

## scrollParent

```ts
// helpers/dom
// 判断是不是浏览器环境，避免代码是在 node 环境中使用而导致的错误
const inBrowser = typeof window !== 'undefined'

export const hasIntersectionObserver = checkIntersectionObserver()

// 判断 window 里面存不存 IntersectionObserver 这个api
function checkIntersectionObserver (): boolean {
  if (inBrowser &&
    'IntersectionObserver' in window &&
    'IntersectionObserverEntry' in window &&
    'intersectionRatio' in IntersectionObserverEntry.prototype) {
    if (!('isIntersecting' in IntersectionObserverEntry.prototype)) {
      Object.defineProperty(IntersectionObserverEntry.prototype,
        'isIntersecting', {
          get: function (this: IntersectionObserverEntry) {
            return this.intersectionRatio > 0
          }
        })
    }
    return true
  }
  return false
}

// 获取元素样式
const style = (el: HTMLElement, prop: string): string => {
  // getComputedStyle是一个可以获取当前元素所有最终使用的CSS属性值。返回的是一个CSS样式声明对象
  return getComputedStyle(el).getPropertyValue(prop)
}

// 获取元素的 overflow overflow-x overflow-y 3个样式的值
const overflow = (el: HTMLElement): string => {
  return style(el, 'overflow') + style(el, 'overflow-y') + style(el, 'overflow-x')
}

export function scrollParent (el: HTMLElement): HTMLElement | Window {
  let parent = el

  // 循环遍历获取父节点
  while (parent) {
    // 如果是 body / html 标签了，就 break
    if (parent === document.body || parent === document.documentElement) {
      break
    }

    // 如果元素没有父节点了， break
    if (!parent.parentNode) {
      break
    }

    // 如果元素存在 scroll | auto，返回该元素
    if (/(scroll|auto)/.test(overflow(parent))) {
      return parent
    }

    // 继续向上追溯
    parent = parent.parentNode as HTMLElement
  }

  // 若找不到，就设置为 window
  return window
}
```

额，则个还是比较简单的，接着看 ImageManager

## ImageManager

```ts
// types/index.ts
// 枚举
export enum State {
  loading, // --> 0: 加载中
  loaded, // --> 1：加载完成
  error， // --> 2：加载失败
}

// core/imageManager.ts
import { ImageManagerOptions, State } from '../types'
import loadImage from '../helpers/loadImage'
import { warn } from '../helpers/debug'

export default class ImageManager {
  el: HTMLElement
  parent: HTMLElement | Window
  src: string
  error: string
  loading: string
  cache: Set<string>
  state: State

  constructor (options: ImageManagerOptions) {
    this.el = options.el
    this.parent = options.parent
    this.src = options.src
    this.error = options.error
    this.loading = options.loading
    this.cache = options.cache
    this.state = State.loading
		// 一开始就先执行 render 函数，此时图片显示内容为 loading 时的图片
    this.render(this.loading)
  }

  load (next?: Function): void {
		// 判断当前状态
    if (this.state > State.loading) {
      return
    }
		// 判断缓存中是否已存在，如果存在即以通过网络加载过该照片，直接使用把 url 设置上去即可
    if (this.cache.has(this.src)) {
      this.state = State.loaded
      this.render(this.src)
      return
    }
		// 如果缓存中没有，需要请求该 url，判断该 url 是否可以成功加载
    this.renderSrc(next)
  }

	// 是否处于可见区域
  isInView (): boolean {
		// 获取当前元素位置
    const rect = this.el.getBoundingClientRect()
		// 如果元素距离顶部距离小于视窗高度同时距离视窗左侧距离小于视窗宽度，则认为元素可见
    return rect.top < window.innerHeight && rect.left < window.innerWidth
  }

	// 图片 src 发生变化，更新当前的 src
  update (src: string): void {
    const currentSrc = this.src
    if (src !== currentSrc) {
      this.src = src
			// 同时设置当前照片状态为 loading
      this.state = State.loading
      this.load()
    }
  }

	// 判断 src 是否可以正常获取到，用户判断图片是否显示正常照片或者时发生异常时的照片
  private renderSrc (next?: Function): void {
    loadImage(this.src).then(() => {
      this.state = State.loaded
      this.render(this.src)
      this.cache.add(this.src)
      next && next()
    }).catch((e) => {
      this.state = State.error
      this.render(this.error)
      warn(`load failed with src image(${this.src}) and the error msg is ${e.message}`)
      next && next()
    })
  }

	// 图片正常，直接把 url 设置到 src 上就行
  private render (src: string): void {
    this.el.setAttribute('src', src)
  }
}
```

所以接下来就是分析 loadImage 了

## loadImage

```ts
// helpers/loadImage.ts
export default function loadImage (src: string): Promise<any> {
  return new Promise((resolve, reject) => {
		// 利用原生的 Image 构造函数，通过 onload 和 onerror 判断 url 是否正常
    const image = new Image()

    image.onload = function () {
      resolve()
			// 执行之后设置对应的操作为 null
      dispose()
    }

    image.onerror = function (e) {
      reject(e)
			// 执行之后设置对应的操作为 null
      dispose()
    }

    image.src = src

    function dispose () {
      image.onload = image.onerror = null
    }
  })
}
```
---

总算讲完了

草，还有不支持 IntersectionObserver 的清空没说

## 不支持 IntersectionObserver 的情况

```ts
// 要监听的事件
const events = [
	'scroll', 'wheel', 'mousewheel', 
	'resize', 'animationend', 'transitionend', 
	'touchmove', 'transitioncancel'
]

export default class Lazy {
	// ...

	// 添加事件监听
	private addListenerTarget (el: HTMLElement | Window): void {
    let target = this.targetQueue!.find((target) => {
      return target.el === el
    })

    if (!target) {
      target = {
        el,
        ref: 1
      }
      this.targetQueue!.push(target)
      this.addListener(el)
    } else {
      target.ref++
    }
  }

	// 移除事件监听
  private removeListenerTarget (el: HTMLElement | Window): void {
    this.targetQueue!.some((target, index) => {
      if (el === target.el) {
        target.ref--
        if (!target.ref) {
          this.removeListener(el)
          this.targetQueue!.splice(index, 1)
        }
        return true
      }
      return false
    })
  }

	// 添加原生的监听事件
  private addListener (el: HTMLElement | Window): void {
    events.forEach((event) => {
      el.addEventListener(event, this.throttleLazyHandler as EventListenerOrEventListenerObject, {
        passive: true,
        capture: false
      })
    })
  }

	// 移除原生的监听事件
  private removeListener (el: HTMLElement | Window): void {
    events.forEach((event) => {
      el.removeEventListener(event, this.throttleLazyHandler as EventListenerOrEventListenerObject)
    })
  }
	//....
}
```

所以重点只有这个 

```ts
export default class Lazy {
	// ...
  private lazyHandler (e: Event): void {
    for (let i = this.managerQueue.length - 1; i >= 0; i--) {
      const manager = this.managerQueue[i]
			// 判断是否可见
      if (manager.isInView()) {
        if (manager.state === State.loaded) {
          this.removeManager(manager)
          return
        }
        manager.load()
      }
    }
  }
	// ...
}
```

## 总结

- 判断浏览器是否支持 IntersectionObserver 
	- 支持使用 IntersectionObserver + 获取父级 overflow 为 scroll | auto 作为是否可见的判断
	- 不支持使用 getBoundingClientRect + 原生的滚动事件监听 判断是否可见

- 使用缓存，如果缓存中存在，直接使用缓存数据，如果不存在，在图片可见的时候显示有 Image 的 onload 和 onerror 去判断图片 url 是否正常
	- 正常的化就正常显示
	- 不正常显示配置项里的图片