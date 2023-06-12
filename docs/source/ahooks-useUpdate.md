# useUpdate、useUpdateEffect、useLayoutEffect


## useUpdate

> 作用： useUpdate 会返回一个函数，调用该函数会 `强制组件重新渲染`。
>
> 原理：返回的函数通过变更 useState 返回的 state，从而促使组件进行更新。

### 源码

```ts
import { useCallback, useState } from 'react';

const useUpdate = () => {
  const [, setState] = useState({});

  return useCallback(() => setState({}), []);
};

export default useUpdate;
```

### 使用

```jsx
import React from 'react';
import { useUpdate } from 'ahooks';

export default () => {
  const update = useUpdate();

  return (
    <>
      <div>Time: {Date.now()}</div>
      {/* 每次点击都会强制渲染 */}
      <button type="button" onClick={update} style={{ marginTop: 8 }}>
        update
      </button>
    </>
  );
};
```

## createUpdateEffect

> 用于封装 `useUpdateEffect` 和 `useUpdateLayoutEffect`


```ts
import { useRef } from 'react';
import type { useEffect, useLayoutEffect } from 'react';

type EffectHookType = typeof useEffect | typeof useLayoutEffect;
type CreateUpdateEffect = (hook: EffectHookType) => EffectHookType

export const createUpdateEffect: CreateUpdateEffect = (hook) => (
  effect,
  deps
) => {
    const isMounted = useRef(false);

    // hook 其实就是 useEffect / useLayoutEffect
    // 初次渲染
    hook(() => {
      return () => {
        isMounted.current = false;
      };
    }, []);

    hook(() => {
      // 初次进入，将 isMounted 设置为 true，并且不执行 effect
      if (!isMounted.current) {
        isMounted.current = true;
      } else {
        // 之后进入的时候就会执行 effect，从而达到第一次进入时不渲染
        return effect();
      }
    }, deps);
  };

export default createUpdateEffect;
```

## useUpdateEffect

> 作用：useUpdateEffect 和 useUpdateLayoutEffect 的用法跟 useEffect 和 useLayoutEffect 一样，只是会 `忽略首次执行，只在依赖更新时执行`。

```ts
// useUpdateEffect
import { useEffect } from 'react';
import { createUpdateEffect } from '../createUpdateEffect';

export default createUpdateEffect(useEffect);
```

## useUpdateLayoutEffect

```ts
// useUpdateLayoutEffect
import { useLayoutEffect } from 'react';
import { createUpdateEffect } from '../createUpdateEffect';

export default createUpdateEffect(useLayoutEffect);
```