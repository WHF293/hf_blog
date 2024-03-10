# 简单实现 vue 的数据劫持

## vue2

> vue2 数据初始化的时候就需要递归将数据变成响应式数据
>
> 每个组件都有自己的 watcher

```js
// 数组需要重写的变异方法
const ArrayMethods = [
  'push', 'pop', 'shift', 'unshift',
  'splice', 'sort', 'reverse'
]

// 保存原有的数组属性、方法
let oldArrayProto = Array.prototype;
let newArrayProto = Object.create(Array.prototype);

// 数组方法的重写逻辑
ArrayMethods.forEach(method => {
  newArrayProto[method] = function(...args) {
    oldArrayProto[method].call(this, ...args)
  }
})

function observer(data) {
  if (typeof data !== 'object' || typeof data === null) {
    return data
  }
  if (Array.isArray(data)) {
    // 数组通过重写 push、pop、shift、unshift、 sort、splice、reverse
    data.__proto__ = newArrayProto
  } else {
    for (let key in data) {
      defineReactive(data, key, data[key])
    }
  }
}

// 对象的响应式处理
function defineReactive(target, key, value) {
  observer(value)
  Object.defineProperty(target, key) {
    get() {
      // 收集 watcher
      return value
    },
    set(newValue) {
      if (value === newValue) return
      // 触发 watcher 更新
      value = newValue
      observer(newValue)
    }
  }
}
```

## vue3

> vue3 是只有去获取数据的时候才开始代理数据

```js
let handler = {
  get(target, key) {
    // 收集 effect
    const targetValue = target[key]
    if (typeof targetValue === 'object') {
      return new Proxy(target[key], handler)
    }
    return targetValue
  },
  set(target, key, value) {
    // 触发 effect 更新
    target[key] = value
  },
}

function reactive(target) {
  return new Proxy(target, handler)
}
```
