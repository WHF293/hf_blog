# useMount、useUnMount

## useMount

> 原理：useEffect 依赖假如为空，只会在组件初始化的时候执行。

### 源码

```jsx
import { useEffect } from 'react'
import { isFunction } from '../utils'
import isDev from '../utils/isDev'

const useMount = (fn: () => void) => {
  if (isDev) {
    if (!isFunction(fn)) {
      console.error(`useMount: parameter \`fn\` expected to be a function, but got "${typeof fn}".`)
    }
  }

  useEffect(() => {
    fn?.()
  }, [])
}

export default useMount
```

### 使用

```jsx
import { useMount, useBoolean } from 'ahooks'
import { message } from 'antd'
import React from 'react'

const MyComponent = () => {
  useMount(() => {
    message.info('mount')
  })

  return <div>Hello World</div>
}

export default () => {
  const [state, { toggle }] = useBoolean(false)

  return (
    <>
      <button type="button" onClick={toggle}>
        {state ? 'unmount' : 'mount'}
      </button>
      {state && <MyComponent />}
    </>
  )
}
```

## useUnMount

> 在组件卸载（unmount）时执行的 Hook。

### 源码

```ts
import { useEffect } from 'react'
import useLatest from '../useLatest'
import { isFunction } from '../utils'
import isDev from '../utils/isDev'

const useUnmount = (fn: () => void) => {
  if (isDev) {
    if (!isFunction(fn)) {
      console.error(`useUnmount expected parameter is a function, got ${typeof fn}`)
    }
  }

  const fnRef = useLatest(fn)

  useEffect(
    () => () => {
      fnRef.current()
    },
    [],
  )
  // 相当于这样
  // useEffect(() => {
  //   return () => fnRef.current()
  // }, [])
}

export default useUnmount
```

### 使用

```jsx
import { useBoolean, useUnmount } from 'ahooks'
import { message } from 'antd'
import React from 'react'

const MyComponent = () => {
  // 组件卸载时执行
  useUnmount(() => {
    message.info('unmount')
  })

  return <p>Hello World!</p>
}

export default () => {
  const [state, { toggle }] = useBoolean(true)

  return (
    <>
      <button type="button" onClick={toggle}>
        {state ? 'unmount' : 'mount'}
      </button>
      {state && <MyComponent />}
    </>
  )
}
```
