# qiankun 沙箱简单实现

- [Qiankun 实践——实现一个 JS 沙箱](https://juejin.cn/post/7153046840231854087#heading-0)

## 快照沙箱

```js
class SnapshotSandbox {
  windowSnapshot = {}
  modifiedMap = {}
  proxy = window

  constructor() {}

  active() {
    // 记录 window 旧的 key-value
    Object.entries(window).forEach(([key, value]) => {
      this.windowSnapshot[key] = value
    })

    // 恢复上一次的 key-value
    Object.keys(this.modifiedMap).forEach((key) => {
      window[key] = this.modifiedMap[key]
    })
  }

  inactive() {
    this.modifiedMap = {}

    Object.keys(window).forEach((key) => {
      // 如果有改动，则说明要恢复回来
      if (window[key] !== this.windowSnapshot[key]) {
        // 记录变更
        this.modifiedMap[key] = window[key]
        window[key] = this.windowSnapshot[key]
      }
    })
  }
}

module.exports = SnapshotSandbox
```

## 单例沙箱

```js
class SingularProxySandbox {
  /** 沙箱期间新增的全局变量 */
  addedMap = new Map()
  /** 沙箱期间更新的全局变量 */
  originMap = new Map()
  /** 持续记录更新的(新增和修改的)全局变量的 map，用于在任意时刻做 snapshot */
  updatedMap = new Map()

  constructor() {
    const fakeWindow = Object.create(null)
    const { addedMap, originMap, updatedMap } = this

    this.proxy = new Proxy(fakeWindow, {
      set(_, key, value) {
        // 记录以前的值
        const originValue = window[key]

        if (!window.hasOwnProperty(key)) {
          // 如果不存在，那么加入 addedMap（添加）
          addedMap.set(key, value)
        } else if (!originMap.has(key)) {
          // 如果当前 window 对象存在该属性，且 originMap 中未记录过，
          // 则记录该属性初始值（修改）
          originMap.set(key, originValue)
        }

        // 记录修改后的值
        updatedMap.set(key, value)

        // 修改值
        window[key] = value
      },
      get(_, key) {
        return window[key]
      },
    })
  }

  setWindowKeyValues(key, value, shouldDelete) {
    if (value === undefined || shouldDelete) {
      // 删除 key-value
      delete window[key]
    } else {
      window[key] = value
    }
  }

  active() {
    // 激活时，把上次微应用做更新/新增的 key-value 覆盖到 window 上
    this.updatedMap.forEach((value, key) => {
      this.setWindowKeyValues(key, value)
    })
  }

  inactive() {
    // 删除新增的 key-value
    this.addedMap.forEach((_, key) => {
      this.setWindowKeyValues(key, undefined, true)
    })
    // 覆盖上次全局变量的 key-value
    this.originMap.forEach((value, key) => {
      this.setWindowKeyValues(key, value)
    })
  }
}

module.exports = SingularProxySandbox
```

## 多例沙箱

```js
let activeSandboxCount = 0

class MultipleProxySandbox {
  proxy = {}

  constructor(props) {
    const { fakeWindow, keysWithGetters } = this.createFakeWindow()

    this.proxy = new Proxy(fakeWindow, {
      set(target, key, value) {
        // 对于一些非原生的属性不做修改，因这些属性可能是用户自己改的
        // 这里只需要判断 target[key] 即可， 因为只有原生属性才会复制到 target 上
        if (!target[key] && window[key]) {
          return
        }
        target[key] = value
      },
      get(target, key) {
        // 判断从 window 取值还是从当前 fakeWindow 取值
        const actualTarget = keysWithGetters[key] ? window : key in target ? target : window
        return actualTarget[key]
      },
    })
  }

  createFakeWindow() {
    const fakeWindow = {}
    const keysWithGetters = {}

    Object.getOwnPropertyNames(window)
      .filter((key) => {
        // 只要不可配置的的属性，这些不可配置属性也可以理解为原生属性（一般情况下）
        const descriptor = Object.getOwnPropertyDescriptor(window, key)
        return !descriptor?.configurable
      })
      .forEach((key) => {
        // 复制 key-value
        fakeWindow[key] = window[key]
        // 同时记录这些 key
        keysWithGetters[key] = true
      })

    return { fakeWindow, keysWithGetters }
  }

  active() {
    activeSandboxCount += 1
  }

  inactive() {
    activeSandboxCount -= 1
  }
}

module.exports = MultipleProxySandbox
```
