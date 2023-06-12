# React Hooks 学习

- [react@18.2.0 - hooks](https://react.dev/reference/react)

## 基础 hooks

### useState

- [使用 useState 需要注意的 5 个问题](https://juejin.cn/post/7154612026738737166)

最简单的 hooks，简单带过即可

```tsx
import { useState } from 'react'

function Demo() {
  const [show, setShow] = useState<boolean>(false)

  return (
    <div>
      <div onClick={() => setShow(!show)}>{show ? 'Y' : 'N'}</div>
      <div onClick={() => setShow((e) => !e)}>{show ? 'Y' : 'N'}</div>
    </div>
  )
}
```

### useEffect

```ts
import { useEffect } from 'react'

function Demo() {
  // 每次更新都会执行
  useEffect(() => {
    // doSomeThing...
  })

  // 初次选执行
  useEffect(() => {
    // doSomeThing...
  }, [])

  // 依赖项变化执行, 依赖项必须是 props 里的值，
  // 或者是通过 hooks 生成的值（包括官方hooks或者自定义hooks）
  useEffect(() => {
    // doSomeThing...
  }, [a, b])

  // 清除上一次的值/结果
  useEffect(() => {
    timer = setTimeout(() => {
      // doSomeThing...
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return <div></div>
}
```

### useLayoutEffect

用法和 useEffect 一模一样，这两的区别如下：

- useEffect 中的 effect 函数会在 Dom 更新之后 `异步调用`
- useLayoutEffect 中的 effect 函数会在 Dom 更新之后 `同步调用`

:::warning 注意

1. useLayoutEffect 的调用时机和 类组件 的 componentDidMount、componentDidUpdate 一样
2. useLayoutEffect 是在 Dom 更新后同步执行的，所以在 SSR 应用中，初次渲染时服务端生成对应的 html 模板，并没有真正生成 Dom，所以在 SSR 应用中初次执行的时候会报错，所以 react 官方也不推荐在 SSR 中使用这个 hooks 
:::

```ts
import { useLayoutEffect } from 'react'

function Demo() {
  // 每次更新都会执行
  useLayoutEffect(() => {
    // doSomeThing...
  })

  // 初次选执行
  useLayoutEffect(() => {
    // doSomeThing...
  }, [])

  // 依赖项变化执行, 依赖项必须是 props 里的值，
  // 或者是通过 hooks 生成的值（包括官方hooks或者自定义hooks）
  useLayoutEffect(() => {
    // doSomeThing...
  }, [a, b])

  // 清除上一次的值/结果
  useLayoutEffect(() => {
    timer = setTimeout(() => {
      // doSomeThing...
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return <div></div>
}
```

### useRef

- [React useRef 指南](https://juejin.cn/post/7160215726773501965)

react 组件在更新的过程中，实际上是会将组件里的所有属性、对象、函数重新生成，而有时候我们需要一些数据在更新前后保持原先的数据引用地址，针对这种场景，react 提供了 useRef 这个 hooks

> useRef 在绑定数据之后，在下一次更新的时候会返回相同的对象

- 绑定 dom

```tsx
function Demo() {
  const domRef = useRef<null | HTMLDivElement>(null)

  useEffect(() => {
    console.log(domRef.current)
  }, [])

  return <div ref={domRef}></div>
}
```

- 设置为不可变数据变量， 比如常见的 流程图、富文本编辑器等都可以使用这个来保存对应类实例化之后的实例

```ts
import Car from 'Car'

function Demo() {
    const car = useRef<Car>(new Car())

    useEffect(() => {
        car.current.footerNum = 4
    }, [])

    // .....
}
```

### useReducer

对于函数组件来说，大部分的响应式数据都是通过 useState 构造的，但对于部分场景 useState 可能不太合适，比如对于一个比较复杂的 form 表单来说，假设表单上有 30 个字段，如果都要 useState 来实现的话，就过于松散了，所以针对这种场景，我们一般使用 useReducer 来实现响应式数据

```tsx

```

### useContext

### useMemo

先看下面这个场景

```tsx
function Demo() {
  const [count, setCount] = useState<number>(100)
  const [show, setShow] = useState<boolean>(false)
  const cacheData = () => count * 2

  return (
    <div>
      <span onClick={() => setShow((e) => !e)}>{show ? 'Y' : 'N'}</span>
      <span>{count}</span>
      <span>{cacheData()}</span>
    </div>
  )
}
```

如果我们修改 show 变量，show 的变化触发组件更新，但是对于 cacheData 来说，show 的变化并不会使 cacheData 的运算结果发生变化，所以针对这种场景，我们可能需要缓存 cacheData 这个值，不让 react 重新生成 cacheData

而 react 中，我们通常使用 useMemo 来对数据进行缓存, 对上面的数据进行改造

```tsx
function Demo() {
  const [count, setCount] = useState<number>(100)
  const [show, setShow] = useState<boolean>(false)
  const cacheData = useMemo<number>(() => {
    // 根据 count 霹雳扒拉的一顿计算，这里简单是乘以 2 代替复杂的计算逻辑
    const resData = count * 2

    return resData
  }, [count])

  return (
    <div>
      <span>{show ? 'Y' : 'N'}</span>
      <span>{count}</span>
      <span>{cacheData}</span>
    </div>
  )
}
```

useMemo 接受两个参数，第一个参数是运算逻辑，也就是 effect 函数，第二个参数是依赖项，即依赖项改变了才会触发前面的 effect 函数

### useCallback

和 useMemo 的使用基本一致，不过 useMemo 缓存的是数据，而 useCallback 缓存的是函数

useMemo 也可以改造成和 useCallback 类似的作用

```js
const cacheFn = useCallback(() => {
  // doSomeThing...
}, [xxx])

const cacheFn = useMemo(() => {
  return () => {
    // doSomeThing...
  }
}, [xxx])
```

## 进阶 hooks

### useDebugValue

### useDeferredValue

### useId

### useImperativeHandle

### useInsertionEffect

### useSyncExternalStore

### useTransition

## 自定义 hooks

能否写出功能比较完善的自定义 hooks，是区分一个 react 开发者是否真正掌握 react 用法的标识之一

目前 react 社区比较出名的 react 自定义库主要有这么两个:

- [ahooks](https://ahooks.gitee.io/zh-CN)
- [reactUse](https://www.reactuse.com/)
