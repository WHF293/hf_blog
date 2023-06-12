# useLatest

## useLatest

### 源码

```ts
// hooks/packages
import { useRef } from 'react';

function useLatest<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;

  return ref;
}

export default useLatest;
```

### 应用场景

```tsx
function CountDemo() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setInterval(() => {
      console.log('setInterval:', count);
    }, 1000);
  }, []);

  return (
    <div>
      <button onClick={() => setCount(count++)}>+1</button>
    </div>
  )
}
```

如上代码，点击更新的时候，我们的述求是想要打印出 1 的，但是实际情况是会输出 0

原因是因为在 useEffect 中，setTimeout 使用 count 的时候实际上是形成了闭包，所以 count 更新的时候并不会打印最新的值

### 解决方式

```tsx
// 解决方法一: 给 useEffect 设置依赖项，重新执行函数，设置新的定时器，拿到最新值
useEffect(() => {
  if (timer.current) {
    clearInterval(timer.current);
  }
  timer.current = setInterval(() => {
    console.log('setInterval:', count);
  }, 1000);
}, [count]);


// 解决方法二: 使用 useRef 在，使每次渲染时返回同一个 ref 对象，当我们变化它的 current 属性的时候，对象的引用都是同一个，所以定时器中能够读到最新的值
const lastCount = useRef(count);
useEffect(() => {
  setInterval(() => {
    console.log('setInterval:', lastCount.current);
  }, 1000);
}, []);
```

而将方式二提取出来就是 ahooks 中的 useLatest

而存在同样的闭包问题的还有 useCallback, 如下代码，打印出来的结果也是 0

```ts
const [count, setCount] = useState(0);

const callbackFn = useCallback(() => {
  console.log(`Current count is ${count}`);
}, []);
```

ahooks 同样也为我们提供了如何处理这种情况的 hooks ——  useMemoizedFn

## useMemoizedFn

### 使用


```ts
const memoizedFn = useMemoizedFn(() => {
  console.log(`Current count is ${count}`);
});
```

### 源码

```ts
function useMemoizedFn<T extends noop>(fn: T) {
  // 每次拿到最新的 fn 值，并把它更新到 fnRef 中。这可以保证此 ref 能够持有最新的 fn 引用
  const fnRef = useRef<T>(fn);
  fnRef.current = useMemo(() => fn, [fn]);
  // 保证最后返回的函数引用是不变的-持久化函数
  const memoizedFn = useRef<PickFunction<T>>();
  if (!memoizedFn.current) {
    // 每次调用的时候，因为没有 useCallback 的 deps 特性，所以都能拿到最新的 state
    memoizedFn.current = function (this, ...args) {
      return fnRef.current.apply(this, args);
    };
  }

  return memoizedFn.current as T;
}
```