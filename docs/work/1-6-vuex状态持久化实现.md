# vuex 状态持久化插件原理

- [vuex-persistedstate](https://www.npmjs.com/package/vuex-persistedstate)
- [vuex - 插件实现](https://vuex.vuejs.org/zh/guide/plugins.html)

## 数据持久化的处理方案

首先 vuex 的持久化一般有两种处理方式

1. 用手动在创建时写入相关操作，如初始化时从 localStorage 获取， state 改变时 在手动保存到 localStorage。缺点： 每个store 都需要手动添加
2. 利用vuex 插件实现自动我们上面说的方案


## vuex 插件是什么

Vuex 插件就是一个函数，它接收 store 作为唯一参数：

```js
const myPlugin = (store) => {
  // 当 store 初始化后调用
  store.subscribe((mutation, state) => {
    // 每次 mutation 之后调用
    // mutation 的格式为 { type, payload }
  })
}

// 使用
const store = createStore({
  // ...
  plugins: [myPlugin]
})
```

> 在插件中不允许直接修改状态——类似于组件，只能通过提交 mutation 来触发变化。

## vuex-persistedstate 具体实现


源码简单，分析直接写里面了

```ts
import { Store, MutationPayload } from 'vuex'
// deepmerge： 深度合并两个对象可枚举属性
import merge from 'deepmerge'
// 类似过滤器，用于获取对象中符合要求的属性
import * as shvl from 'shvl'


interface Storage {
  getItem: (key: string) => any
  setItem: (key: string, value: any) => void
  removeItem: (key: string) => void
}

interface Options<State> {
  key?: string
  paths?: string[]
  reducer?: (state: State, paths: string[]) => object
  subscriber?: (store: Store<State>) => (handler: (mutation: any, state: State) => void) => void
  storage?: Storage
  getState?: (key: string, storage: Storage) => any
  setState?: (key: string, state: any, storage: Storage) => void
  filter?: (mutation: MutationPayload) => boolean
  arrayMerger?: (state: any[], saved: any[]) => any
  rehydrated?: (store: Store<State>) => void
  fetchBeforeUse?: boolean
  overwrite?: boolean
  assertStorage?: (storage: Storage) => void | Error
}

export default function <State>(
  options?: Options<State>
): (store: Store<State>) => void {
  options = options || {}
  // 判断用户是否有手动传入状态获取、保存、删除的逻辑
  const storage = options.storage || (window && window.localStorage)
  // 存到 storage 时的 key
  const key = options.key || 'vuex'

  // 获取 state
  function getState(key, storage) {
    const value = storage.getItem(key)

    try {
      return typeof value === 'string'
        ? JSON.parse(value)
        : typeof value === 'object' ? value : undefined
    } catch (err) {}

    return undefined
  }

  // 保存数据
  function setState(key, state, storage) {
    return storage.setItem(key, JSON.stringify(state))
  }

  function filter() {
    return true
  }

  function reducer(state, paths) {
    // 如果有传 path， 需要过滤一下，没有直接返回state
    return Array.isArray(paths)
      ? paths.reduce(function (substate, path) {
          // 从store 中获取 path 里面记录的 module
          return shvl.set(substate, path, shvl.get(state, path))
        }, {})
      : state
  }

  // 发布-订阅，store 的 state 被修改时触发 handler
  function subscriber(store) {
    return function (handler) {
      return store.subscribe(handler)
    }
  }


  //。。。。。。这部分应该时测试下设置和删除有没有问题。。。。。。。
  const assertStorage =
    options.assertStorage ||
    (() => {
      storage.setItem('@@', 1)
      storage.removeItem('@@')
    })

  assertStorage(storage)
  //。。。。。。。。。。。。。

  // 获取之前保存的状态
  const fetchSavedState = () => {
    return (options.getState || getState)(key, storage)
  }

  //
  let savedState

  if (options.fetchBeforeUse) {
    savedState = fetchSavedState()
  }

  // 这部分才是插件， vuex 插件规定是一个入参只有 store 的函数
  return function (store: Store<State>) {
    if (!options.fetchBeforeUse) {
      savedState = fetchSavedState()
    }

    if (typeof savedState === 'object' && savedState !== null) {
      store.replaceState(
        // 是否重写，是的化直接覆盖，不是的化合并 storage 的数据和 store 的数据
        options.overwrite
          ? savedState
          : merge(store.state, savedState, {
              arrayMerge:
                options.arrayMerger ||
                function (store, saved) {
                  return saved
                },
              clone: false,
            }),
      )
      ;(options.rehydrated || function () {})(store)
    }

    // vuex 规定插件修改 state 的方式和我们正常修改 state 一样，必须使用 mutation
    // 所以这一步就是调用 mutation， 将store 的 state 修改为我们合并之后的 数据
    ;(options.subscriber || subscriber)(store)(
      // 这个函数实际上就是前面说到的 handler
      function (mutation, state) {
        if ((options.filter || filter)(mutation)) {
          // store 中的数据发生变动时保存到 storage
          ;(options.setState || setState)(
            key,
            (options.reducer || reducer)(state, options.paths),
            storage
          )
        }
      },
    )
  }
}
```
