# 学习 VueRequest

:::warning 提示
待完善
:::

<a name="ewZMJ"></a>
## 前言
在前端项目的日常开发中，对于接口请求，难免会对接口请求有以下操作：节流、防抖、轮询 等。<br />有的接口有需要我们在组件挂载的时候就发起请求，有些需要依赖某个响应式数据，在数据变更时重新发起请求<br />这些操作在 hooks 开始流行起来之后，开始有各种各样的 hooks 库帮我们将上面提到的那些功能帮我们封装好，例如最开始的 [ReactUse](https://www.reactuse.com/)（目前 react 使用量最大自定的 hooks 库），再到国内阿里开源的 [ahooks](https://ahooks.gitee.io/zh-CN)（react）。而 vue 在进入 vue3 后，也开始出现类似的 hooks 库，比较流行的有 [vueuse](https://vueuse.org/)。<br />而今天要说的 [VueRequest](https://next.cn.attojs.org/) 就是一个专门用来处理接口请求的 hooks 库
> A：你TM就知道偷懒，自己写一下会死吗，就知道用第三方的库
> 我：啊对对对，老子就是懒

![image.png](https://cdn.nlark.com/yuque/0/2022/png/2586551/1669802053244-b1bebcce-4c57-4e85-ba43-417c1850481c.png#averageHue=%23a8835c&clientId=u05f4cf2f-f0d8-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=130&id=u05d9e5cb&margin=%5Bobject%20Object%5D&name=image.png&originHeight=143&originWidth=818&originalType=binary&ratio=1&rotation=0&showTitle=false&size=223259&status=done&style=none&taskId=uedb9318b-7da3-45ba-b014-2865dd4bafc&title=&width=743.6363475184799)
<a name="SuHJC"></a>
## vue-request 是什么以及它的基本用法
<a name="X9k2k"></a>
### 1、vue-request 是啥
直接看官网的描述：<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/2586551/1669790356897-638d2d3c-c485-4c77-b362-00904261b167.png#averageHue=%23242931&clientId=ua8db1bb5-fc72-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=745&id=u7f095d08&margin=%5Bobject%20Object%5D&name=image.png&originHeight=819&originWidth=1201&originalType=binary&ratio=1&rotation=0&showTitle=false&size=82612&status=done&style=none&taskId=u4bde6739-d3a6-4455-9c05-861ecb9db94&title=&width=1091.8181581536605)<br />查看 vueHooks useRequest 和 VueRequest 的官方文档，我们可以得知这两个库的都是仿照 ahooks useRequest 的版本实现，基本的功能和 api 设计都和 ahooks 的 useRequest 基本一致，但是 VueRequest 是支持 vue2/3的， vueHooks （个人开发者维护，不推荐） 只支持 vue3，因为 api 设计基本一致，所以熟悉其中一个相当于另外两个也基本能熟练使用了<br />相较而言，ahooks-vue 的 useRequest 的功能就有点像是 【低配版】的

具体用法请看官网。。。。（内容太多了，不想打字）
<a name="J7ERN"></a>
### 2、类似 hooks 的相关文档

- [vueHooks -useRequest](http://43.138.187.142:9000/vue-hooks-plus/docs/useRequest/)
- [ahooks-useRequest (react)](https://ahooks.gitee.io/zh-CN/hooks/use-request/index)
- [ahooks-vue useRequest](https://dewfall123.github.io/ahooks-vue/zh/use-request/)
- [vueuse-useFetch](https://vueuse.org/core/usefetch/#usefetch)
<a name="zcykf"></a>
## vue-request 源码分析
[VueRequest github 地址](https://github.com/attojs/vue-request)<br />首先下载 VueRequest 源码，找到 _package.json _文件<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/2586551/1669790275828-d27e236d-13a9-4c85-8653-0fcf12a5ec90.png#averageHue=%23262335&clientId=ua8db1bb5-fc72-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=706&id=u2639ea70&margin=%5Bobject%20Object%5D&name=image.png&originHeight=777&originWidth=527&originalType=binary&ratio=1&rotation=0&showTitle=false&size=87824&status=done&style=none&taskId=u9e3073cd-6836-4fed-9b71-16ba8bfbf22&title=&width=479.09089870689354)<br />可以看出这个库是基于 rollup 和 vite 打包的，文档中的案例有出现 vue-sfc 和 vue-tsx 的写法是基于 vue 官方提供的两个 vite 插件，另外。。没找到 **vue-demi **不知道是作者是怎么实现兼容 vue2/3 的 ？？？？？？？？？？？？？<br />什么是 [vue-demi](https://antfu.me/posts/make-libraries-working-with-vue-2-and-3) 可以看这里
<a name="SFJgp"></a>
### VueRequest 的目录结构
![image.png](https://cdn.nlark.com/yuque/0/2022/png/2586551/1669862092203-ab7712cd-ccbd-4d09-958b-7add1bf96fe8.png#averageHue=%23252033&clientId=u43bae72c-cda2-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=802&id=u08858958&margin=%5Bobject%20Object%5D&name=image.png&originHeight=882&originWidth=1412&originalType=binary&ratio=1&rotation=0&showTitle=false&size=76295&status=done&style=none&taskId=ua6b31b5a-857b-41e3-8fee-ca89a3f2e4f&title=&width=1283.6363358142953)<br />我们先看到 src/index.ts 这个文件里，在里面发现了我们这次的目标 _**useRequest**_
```typescript
export { setGlobalOptions } from './core/config';
export { default as RequestConfig } from './RequestConfig';
export { default as useLoadMore } from './useLoadMore';
export { default as usePagination } from './usePagination';
export { default as useRequest } from './useRequest'; // 这个就是我们本文要重点分析的
```
因为我们要分析的是 useRequest 这个函数，所以看到对应的文件 ，开始分析源码<br />首先，我们要知道整个的请求的生命周期，如图所示：<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/2586551/1669864166754-ebc5d2e7-644e-4ea3-9543-b86af575c7c2.png#averageHue=%23faf9f8&clientId=u43bae72c-cda2-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=415&id=ua43feda6&margin=%5Bobject%20Object%5D&name=image.png&originHeight=457&originWidth=961&originalType=binary&ratio=1&rotation=0&showTitle=false&size=25273&status=done&style=none&taskId=u303caf69-138e-4cc9-b53e-07a065507c7&title=&width=873.6363447008058)<br />然后就正式开始源码阅读
<a name="R6AAx"></a>
### useRquest 源码分析
```typescript
import type { Ref } from 'vue';
import { ref } from 'vue';

// ts 类型
import type {
  BaseOptions,
  BaseResult,
  FormatOptions,
  FRPlaceholderType,
  MixinOptions,
} from './core/types';
import type { IService } from './core/utils/types';

// 异步查询
import useAsyncQuery from './core/useAsyncQuery';
// 生成服务
import generateService from './core/utils/generateService';


// 函数返回结果
export interface RequestResult<R, P extends unknown[]>
  extends Omit<BaseResult<R, P>, 'reset'> {
  reloading: Ref<boolean>;
  reload: () => void;
}

// ts 的函数重载
function useRequest<R, P extends unknown[] = any>(
  service: IService<R, P>,
): RequestResult<R, P>;
function useRequest<R, P extends unknown[] = any, FR = FRPlaceholderType>(
  service: IService<R, P>,
  options: FormatOptions<R, P, FR>,
): RequestResult<FR, P>;
function useRequest<R, P extends unknown[] = any>(
  service: IService<R, P>,
  options: BaseOptions<R, P>,
): RequestResult<R, P>;
function useRequest<R, P extends unknown[], FR>(
  service: IService<R, P>,
  options?: MixinOptions<R, P, FR>,
) {
  // 使用 generateService 接受我们传进来的第一个参数，返回一个 Promise 请求
  const promiseQuery = generateService(service);
  // 异步请求函数接受返回的 Promise 请求和我们传入的其他配置项
  const { reset, run, ...rest } = useAsyncQuery<R, P>(
    promiseQuery,
    (options ?? {}) as any,
  );

  const reloading = ref(false);
  const reload = async () => {
    const { defaultParams = ([] as unknown) as P, manual } = options!;
    reset();
    if (!manual) {
      reloading.value = true;
      await run(...defaultParams);
      reloading.value = false;
    }
  };

  return {
    reload,
    run,
    reloading,
    ...rest,
  };
}

export default useRequest;
```
可以看到，引入的内容出去 ts 的类型提示，就只有两个东西了 

- generateService
- useAsyncQuery

那么接下来的重点就是分析这两个函数到底是怎么实现的了
<a name="KllzY"></a>
### 分析 generateService
直接查看源码
```typescript
import {
  isFunction,
  isPlainObject,
  isPromise,
  isString,
  requestProxy,
  warning,
} from './index';
import type { IService } from './types';

const generateService = <R, P extends unknown[]>(
  service: IService<R, P>,
): (() => Promise<R>) | ((...args: P) => Promise<R>) => {
  return (...args: P) => {
    if (isFunction(service)) {
      // 如果传进来的是一个函数，执行传入函数并将函数返回结果作为入参再次传给 generateService
      return generateService(service(...args))();
    } else if (isPromise(service)) {
      // 如果传进来的是 Promise， 直接返回传进来的参数
      return service;
    } else if (isPlainObject(service)) {
      const { url, ...rest } = service;
      return requestProxy(url, rest);
    } else if (isString(service)) {
      // 如果入参是字符串 （url）,调用 requestProxy
      return requestProxy(service);
    } else {
      // 如果都不符合上面的几种类型，直接报错
      throw warning('Unknown service type', true);
    }
  };
};

export default generateService;
```
到这里只剩  isPlainObject 和 requestProxy 这两货不知道是啥了，接着找到他们对应的源码：
```typescript
// 返回对象
export const isPlainObject = (val: unknown): val is Record<string, any> =>
  toTypeString(val) === '[object Object]';

// 使用 Fetch 发起请求
export const requestProxy = async (...args: [url: string, ...rest: any[]]) => {
  const res = await fetch(...args);
  if (res.ok) {
    return res.json();
  }
  throw new Error(res.statusText);
};
```
> 小结：generateService 函数就是对我们传入 useRequest 的第一个入参进行判断，确保入参在经过 generateService 的处理后能返回一个 Promise，方便后续的处理

<a name="mVIeg"></a>
### useAsyncQuery 初步分析
一样的，找到对应的源码：（源码有 260 行）<br />[不想看分析，直接看总结](#tkq7H)
```typescript
import type {
  BaseOptions,
  BaseResult,
  Query,
	// ....
} from './types';
// ....

function useAsyncQuery<R, P extends unknown[]>(
  query: Query<R, P>,
  options: BaseOptions<R, P>,
): BaseResult<R, P> {
	// .....
  return {
    loading, // 请求是否结束
    data, // 请求的结果
    error, // 接口报错信息
    params,
    cancel, // 用于中断接口请求
    refresh,
    mutate,
    run, // 用于发起接口请求
    reset,
    queries,
  };
}

export default useAsyncQuery;
```
先忽略 useAsyncQuery 函数里面的具体操作，先分析 【入参】是什么
```typescript
function useAsyncQuery<R, P extends unknown[]>(
  query: Query<R, P>, // 经过 generateService 处理后的结果，即一个 Promise
  options: BaseOptions<R, P>, // 我们传入的配置项
): BaseResult<R, P>
```
分别找到 Query、BaseOptions、BaseResult
```typescript
// 配置项接口
export type BaseOptions<R, P extends unknown[]> = GlobalOptions & {
  defaultParams?: P;
  ready?: Ref<boolean>;
  initialData?: R;
  // 依赖数据，当依赖的响应式数据变化时自动重新发起请求
  refreshDeps?: WatchSource<any>[]; 
  // 缓存 key, 拥有相同 key 的请求在设定时间内，会缓存上一次的请求结果，介绍接口请求
  cacheKey?: string; 
  queryKey?: (...args: P) => string;
  onSuccess?: (data: R, params: P) => void; // 接口请求成功的回调
  onError?: (error: Error, params: P) => void; // 接口请求失败的回调
  onBefore?: (params: P) => void; // 接口请求前置操作
  onAfter?: (params: P) => void; // 接口请求后置操作
};

export type Query<R, P extends unknown[]> = (...args: P) => Promise<R>;

// useAsyncQuery 返回值接口
export interface BaseResult<R, P extends unknown[]> extends QueryState<R, P> {
  queries: Queries<R, P>;
  reset: () => void;
}
```
看接口返回的接口是继承 QueryState 的，我们再看看它又是啥
```typescript
export interface QueryState<R, P extends unknown[]> extends State<R, P> {
  run: (...arg: P) => Promise<R | null>;
  cancel: () => void;
  refresh: () => Promise<R | null>;
  mutate: Mutate<R>;
}

export type State<R, P> = {
  loading: Ref<boolean>;
  data: Ref<R | undefined>;
  error: Ref<Error | undefined>;
  params: Ref<P>;
};
```
综上，接口 BaseResult 的全部内容应该如下
```typescript
export interface BaseResult<R, P extends unknown[]> extends QueryState<R, P> {
  queries: Queries<R, P>;
  reset: () => void;
  run: (...arg: P) => Promise<R | null>;
  cancel: () => void;
  refresh: () => Promise<R | null>;
  mutate: Mutate<R>;
  loading: Ref<boolean>;
  data: Ref<R | undefined>;
  error: Ref<Error | undefined>;
  params: Ref<P>;
}
// 刚好就是源码中 useAsyncQuery 返回的结果
```
在知道入参和出参后，我们就可以开始分析 useAsyncQuery 的具体实现了<br />![ (5).jpg](https://cdn.nlark.com/yuque/0/2022/jpeg/2586551/1669794725371-4d48ec58-b80f-41d5-a464-8d10c60e6cce.jpeg#averageHue=%23939dba&clientId=u387541bc-a413-4&crop=0&crop=0&crop=1&crop=1&from=ui&id=u27b7fcf7&margin=%5Bobject%20Object%5D&name=%20%285%29.jpg&originHeight=1080&originWidth=1920&originalType=binary&ratio=1&rotation=0&showTitle=false&size=148671&status=done&style=none&taskId=uef876e24-c349-438e-9187-0c73161fce5&title=)<br />放张图休息休息，接着开整。。。。。。。。。
<a name="rw5pl"></a>
### useAsyncQuery 配置项设置
```typescript
import { 
  inject,
  // ...
} from 'vue';
import { getGlobalOptions, GLOBAL_OPTIONS_PROVIDE_KEY } from './config';
import type {
  GlobalOptions,
	// ....
} from './types';

function useAsyncQuery<R, P extends unknown[]>(
  query: Query<R, P>,
  options: BaseOptions<R, P>,
): BaseResult<R, P> {
  // 全局配置注入，VueRequest 文档-全局配置 哪里有提到
  // 通过 vue 的 inject 将配置注入到每个 vue 实例（组件）中，避免需要重复的书写配置
  // vue 组件中使用时可以手动传入配置覆盖全局配置
  const injectedGlobalOptions = inject<GlobalOptions>(
    GLOBAL_OPTIONS_PROVIDE_KEY,
    {},
  );

  // 结构出所有的配置项
  const {
    cacheKey,
    defaultParams = ([] as unknown) as P,
    manual = false,
    ready = ref(true),
    refreshDeps = [],
    loadingDelay = 0,
    pollingWhenHidden = false,
    pollingWhenOffline = false,
    refreshOnWindowFocus = false,
    refocusTimespan = 5000,
    cacheTime = 600000,
    staleTime = 0,
    errorRetryCount = 0,
    errorRetryInterval = 0,
    queryKey,
    ...rest
  } = {
    ...getGlobalOptions(), // vueRequest 默认配置项
    ...injectedGlobalOptions, // 用户传入的全局配置项
    ...options, // vue 组件内用户手动传入的配置
  };
	// .....
}
```
关于 inject 和 provide 可以查看 vue 的官网文档 [点这里](https://cn.vuejs.org/api/composition-api-dependency-injection.html)
> 小结：解构时采用这个顺序的目的是为了使配置项的优先级如下：
> 组件内的配置项 > 全局配置项 > vueRequest 默认的配置项

<a name="fM5w9"></a>
### useAsyncQuery 功能实现分析
接下来我们按照以下顺序来分析源码:

- 接口请求
- 手动触发请求
- 轮询
- 依赖请求
- 防抖
- 节流
- 缓存与预加载
- 错误重试
<a name="DJhvh"></a>
#### 接口请求
```typescript
import { resolvedPromise } from './utils';
import createQuery from './createQuery';

const QUERY_DEFAULT_KEY = '__QUERY_DEFAULT_KEY__';

function useAsyncQuery<R, P extends unknown[]>(
  query: Query<R, P>,
  options: BaseOptions<R, P>,
): BaseResult<R, P> {
	// ....
  const {
    // ...
    ready = ref(true), // 只有当 ready 为 true 时，才会发起请求
    // ...
  } = {
    ...getGlobalOptions(), // vueRequest 默认配置项
    ...injectedGlobalOptions, // 用户传入的全局配置项
    ...options, // 使用时用户传入的配置
  };

  const latestQueriesKey = ref(QUERY_DEFAULT_KEY);
  const queries = <Queries<R, P>>reactive({
    [QUERY_DEFAULT_KEY]: reactive(createQuery(query, config)),
  });
  const latestQuery = computed(() => queries[latestQueriesKey.value] ?? {});
	
  const tempReadyParams = ref();
  const hasTriggerReady = ref(false);
  
  const run = (...args: P) => {
    if (!ready.value && !hasTriggerReady.value) {
      tempReadyParams.value = args;
      return resolvedPromise;
    }

    const newKey = queryKey?.(...args) ?? QUERY_DEFAULT_KEY;

    if (!queries[newKey]) {
      queries[newKey] = <UnWrapState<R, P>>reactive(createQuery(query, config));
    }

    latestQueriesKey.value = newKey;

    return latestQuery.value.run(...args);
  };
  // ...

  return {
  	// ...
    run
  }
}
```
[配置项 ready 作用](https://next.cn.attojs.org/api/#ready)<br />暂且忽略 run  函数中间的过程，还是先看这个函数执行后返回了啥： latestQuery.value.run(...args);<br />而 latestQuery 根据前面的定义可以知道这是一个用 computed 生成的响应式对象，这个对象里有个 run 函数，所以 run 函数执行实际上是执行了 computed 对象里的 run 函数
```typescript
import createQuery from './createQuery';

const QUERY_DEFAULT_KEY = '__QUERY_DEFAULT_KEY__';

const queries = <Queries<R, P>>reactive({
  [QUERY_DEFAULT_KEY]: reactive(createQuery(query, config)),
});
const latestQuery = computed(() => queries[latestQueriesKey.value] ?? {});
```
将上面的代码转化一下：
```typescript
// 第一步转化
const queries = <Queries<R, P>>reactive({
  '__QUERY_DEFAULT_KEY__': reactive(createQuery(query, config)),
});
const latestQuery = computed(() => queries['__QUERY_DEFAULT_KEY__'] ?? {});

// 第二步转化
const latestQuery = computed(() => reactive(createQuery(query, config)) ?? {});
```
所以可以知道重点就是这个 createQuery 函数了，它的两个入参分别时经过 generateService 处理过的异步函数和最终生成的配置项<br />跳转前我们在看一下 Queries 是啥？
```typescript
export type Queries<R, P extends unknown[]> = {
  [key: string]: UnWrapState<R, P>;
};

export type UnWrapRefObject<T> = {
  [P in keyof T]: UnRef<T[P]>;
};

export type UnWrapState<R, P extends unknown[]> = UnWrapRefObject<
  InnerQueryState<R, P>
>;

export interface InnerQueryState<R, P extends unknown[]>
  extends QueryState<R, P> {
  unmount: () => void;
}

export interface QueryState<R, P extends unknown[]> extends State<R, P> {
  run: (...arg: P) => Promise<R | null>;
  cancel: () => void;
  refresh: () => Promise<R | null>;
  mutate: Mutate<R>;
} 
```
> 提问：为什么要是有 queries 来维护？而不是直接调用？
> 答：我们在使用的时候，一般是在组件内进行导入，同时一个组件内可能会有多个不同的接口请求，如果直接调用，无法实现防抖、节流、数据缓存的操作。对于这种情况有两种处理方式，一种是在组件内每次使用 useRequest 时都生成一个实例，二就是 vue-request 和 ahooks 等的实现方式了，使用队列将每个请求分别保存在队列中，使用 key 做区分

接着往下看 jump against
```typescript
const createQuery = <R, P extends unknown[]>(
  query: Query<R, P>,
  config: Config<R, P>,
  initialState?: UnWrapRefObject<State<R, P>>,
): InnerQueryState<R, P> => {
  	// ....
    const run = (...args: P) => {
      clearAllTimer();
      resetRetriedCount();
      // initial auto run should not debounce
      if (!initialAutoRunFlag.value && debouncedRun) {
        debouncedRun(...args);
        return resolvedPromise;
      }
      if (throttledRun) {
        throttledRun(...args);
        return resolvedPromise;
      }
      return _run(...args);
    };
  
    return {
      errror,
      data,
      run,
      // ....
    };
}
```
先忽略防抖、节流的处理（内容在具体功能时在分析）, run 函数 返回的是这个 _run(...args) 
```typescript
const _run = (...args: P) => {
  // ...
  onBefore?.(args); // 如果有传入前置操作，执行前置操作
  // ...这里才是真正执行我们传入操作的地方
  return query(...args)
    .then(res => {
      const formattedResult = formatResult ? formatResult(res) : res;
      setState({
        data: formattedResult,
        loading: false,
        error: undefined,
      });
      // ....将 res 复制给 data，这样调用 useRequest 时就可以获取到接口的返回值
    }).catch(error => {
      // ....
      setState({
        data: undefined,
        loading: false,
        error: error,
      });
      if (onError) { // 如果有传入失败的回调，执行该回调
 				onError(error, args);
      }
      // ....
    }).finallly(() => {
       onAfter?.(args); // 如果有传入后置操作，执行后置操作
      // ...
    })
}
```
> 小结：useAsyncQuery 里面的 run 函数实际上是执行 createQuery 里面的 run 函数，在 createQuery 里面才是真正实现接口请求，防抖、节流、轮询等功能

<a name="wL761"></a>
#### 手动触发请求
![image.png](https://cdn.nlark.com/yuque/0/2022/png/2586551/1669882374057-df7f5d62-7fff-422a-a45e-40400e930d83.png#averageHue=%231b1f26&clientId=u551d49c8-50a0-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=562&id=u6c7fa2ed&margin=%5Bobject%20Object%5D&name=image.png&originHeight=618&originWidth=1463&originalType=binary&ratio=1&rotation=0&showTitle=false&size=65923&status=done&style=none&taskId=u337a06b2-b1b9-4dec-8e12-22edafb7dba&title=&width=1329.999971173027)<br />从官方文档中我们可以知道，在组建挂载是 useRequest 会把我们自动发起请求，相当于我们平常开发时在 mounted 时去手动调用接口请求，但是大部分情况下我们是希望通过触发某一特定事件采取触发对应的接口请求，而 vueRequest 为我们提供了这个配置项用来手动触发 manual（boolean）<br />回到 useAsyncQuery.ts 这个文件，我们在前面说到【useAsyncQuery 配置项设置】的时候，可以知道他的默认值是什么，如下：
```typescript
// 以下内容都在 useAsyncQuery 函数内部
// 结构出所有的配置项
  const {
    // ...
    manual = false, // 是否手动控制接口调用
    // ...
  } = {
    ...getGlobalOptions(), // vueRequest 默认配置项
    ...injectedGlobalOptions, // 用户传入的全局配置项
    ...options, // vue 组件内用户手动传入的配置
  };

  const initialAutoRunFlag = ref(false); // 是否自动调用标识， false 不自动调用
  const config = {
    initialAutoRunFlag,
  	// ....
  } as Config<R, P>;

  // initial run
  if (!manual) {
    initialAutoRunFlag.value = true;
    
// ..................判断是否开始缓存start......................
    // TODO: need refactor
    const cache = getCache<R, P>(cacheKey!);
    const cacheQueries = cache?.data.queries ?? {};

    const isFresh =
      cache &&
      (staleTime === -1 || cache.cacheTime + staleTime > new Date().getTime());

    const hasCacheQueries = Object.keys(cacheQueries).length > 0;

    if (!isFresh) {
      if (hasCacheQueries) {
        Object.keys(queries).forEach(key => {
          queries[key]?.refresh();
        });
// ..................判断是否开始缓存end......................
      } else {
        run(...defaultParams);
      }
    }

    initialAutoRunFlag.value = false;
  }
```
这里在函数内部维护了一个响应式数据 initialAutoRunFlag，当 initialAutoRunFlag 为 true 时则需要在组件挂载时自动调用接口，默认为 false<br />之后再去判断配置项，判断用户没有设置手动调用接口时，如果用户没有传入 manual 或传入的为 false，则设置<br />initialAutoRunFlag 为 true， 同时调用 run 函数，在 run 函数开始执行时，再把 initialAutoRunFlag 改为 false<br />从而控制接口是否在组件挂载时发起请求
<a name="Lc3KO"></a>
#### 轮询
轮询 VueRequest 为我们提供了 3 种不同情况下的使用

- 普通轮询
- 屏幕不可见轮询：屏幕不可见时可以设置是否停止轮询
- 网络离线轮询：网络离线停止轮询，网络恢复继续轮询

接下来我将逐个分析：<br />第一步，先查看 vueRequest 的官网，查看和轮询相关的 api 都有那些<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/2586551/1670826089227-f05acf2f-70ba-4867-8716-a8f76192045f.png#averageHue=%23232830&clientId=u7e5812fa-bc93-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=744&id=ub3ee2caa&margin=%5Bobject%20Object%5D&name=image.png&originHeight=744&originWidth=1454&originalType=binary&ratio=1&rotation=0&showTitle=false&size=90127&status=done&style=none&taskId=u37dc17b4-18b0-40db-a181-7ca863bd5bd&title=&width=1454)<br />拢共3个配置项

- [pollinginterval](https://next.cn.attojs.org/api/#pollinginterval)：用于设置轮询时间间隔，没有默认值，必须手动传入
- [pollingWhenHidden](https://next.cn.attojs.org/api/#pollingwhenhidden)：用于控制屏幕不可见时是否继续轮询，默认 false
- [pollingWhenOffline](https://next.cn.attojs.org/api/#pollingwhenoffline)：用于控制网络不可用时是否继续轮询， 默认 false
> pollingwhenoffline、pollingwhenhidden 都必须 pollinginterval > 0 的前提下才有效

回到 useAsyncQuery.ts
```typescript
const stopPollingWhenHiddenOrOffline = ref(false); // 用于控制轮询是否继续

const config = {
  pollingWhenHidden,
  pollingWhenOffline,
  stopPollingWhenHiddenOrOffline,
  // ....
  ...omit(rest, ['pagination', 'listKey']),
} as Config<R, P>;

const queries = <Queries<R, P>>reactive({
  [QUERY_DEFAULT_KEY]: reactive(createQuery(query, config)),
});
```
所以还是得回到 createQuery.ts
```typescript
// createQuery.ts
const createQuery = <R, P extends unknown[]>(
  query: Query<R, P>,
  config: Config<R, P>,
  initialState?: UnWrapRefObject<State<R, P>>,
): InnerQueryState<R, P> => {
  // 一进来就解构出我们需要的几个参数
  const {
		// ...
    pollingInterval,
    pollingWhenHidden,
    pollingWhenOffline,
    stopPollingWhenHiddenOrOffline, // 初始值： false
  	// ...
  } = config;
   // ....
}
```
在这个文件里查找一下，很多就能找到只有这几个函数/变量和轮询有关
```typescript
// createQuery.ts
const polling = (pollingFunc: () => void) => {
  // 轮询过程中有任何一次请求发生异常且没有设置异常重试次数的，直接终止轮询
  // 异常重试次数：请求异常时重新发起请求的次数
  if (error.value && errorRetryCount !== 0) return;

  let timerId: number;
  // isNil： 用于判断是否是 null / undefinded
  // isDocumentVisibility：使用 vueRequest 的屏幕是否可见
  // isOnline： 网络是否离线
  // pollingInterval 存在且大于0，否则不开启轮询
  if (!isNil(pollingInterval) && pollingInterval! >= 0) {
    if (
      (pollingWhenHidden || isDocumentVisibility()) &&
      (pollingWhenOffline || isOnline())
    ) {
      // 设置定时器
      timerId = setTimeout(pollingFunc, pollingInterval);
    } else {
      // 停止轮询
      stopPollingWhenHiddenOrOffline.value = true;
      return;
    }
  }

  // 返回并且清除定时器
  return () => timerId && clearTimeout(timerId);
};

  const rePolling = () => {
    if (
      stopPollingWhenHiddenOrOffline.value &&
      (pollingWhenHidden || isDocumentVisibility()) &&
      (pollingWhenOffline || isOnline())
    ) {
      refresh();
      stopPollingWhenHiddenOrOffline.value = false;
    }
  };
```
```typescript
// src/core/index.ts
export const isDocumentVisibility = () =>
  !isServer && window?.document?.visibilityState === 'visible';

export const isOnline = () => (!isServer && window?.navigator?.onLine) ?? true;
```
所以到这，我们就可以知道 vueRequest 是怎么控制屏幕不可见轮询和断网轮询了。<br />那么它的具体调用情况呢，polling 的调用时机呢？入参 pollingFunc 又是啥呢？<br />这就的看到前面我们分析的 _run 方法了
```typescript
// createQuery.ts
const _run = (...args: P) => {
  // ...
  return query(...args)
    .then(res => {
      // ....
    }).catch(error => {
      // ....
    }).finallly(() => {
      // ...
      pollingTimer.value = polling(() => _run(...args));
    })
}
```
所以，每次轮询，实际上都时去调用 _run 方法。<br />那么如果不设置或者设置了屏幕不可时停止轮询，在屏幕重新进入可视区域时怎么恢复轮询呢？<br />同样的页面离线又恢复时怎么恢复轮询？
```typescript
// createQuery.ts

// subscribe polling
  if (!pollingWhenHidden) {
    addUnsubscribeList(subscriber('VISIBLE_LISTENER', rePolling));
  }

  // subscribe online when pollingWhenOffline is false
  if (!pollingWhenOffline) {
    addUnsubscribeList(subscriber('RECONNECT_LISTENER', rePolling));
  }
```
这里涉及到两个函数，我们分别分析他们：

- addUnsubscribeList
- subscriber
<a name="rL02U"></a>
##### addUnsubscribeList
```typescript
  // collect subscribers, in order to unsubscribe when the component unmounted
  const unsubscribeList: (() => void)[] = [];
  const addUnsubscribeList = (event?: () => void) => {
    event && unsubscribeList.push(event);
  };
```
<a name="MpDqb"></a>
##### subscriber
```typescript
// src/core/utils/listener.ts
import { isDocumentVisibility, isServer } from './index';

type EventFunc = () => void;
type ListenersSet = Set<EventFunc>;
type ListenerType =
  | 'FOCUS_LISTENER'
  | 'VISIBLE_LISTENER'
  | 'RECONNECT_LISTENER';
export const FOCUS_LISTENER: ListenersSet = new Set();
export const VISIBLE_LISTENER: ListenersSet = new Set();
export const RECONNECT_LISTENER: ListenersSet = new Set();

const subscriber = (listenerType: ListenerType, event: EventFunc) => {
  let listeners: ListenersSet;
  switch (listenerType) {
    case 'FOCUS_LISTENER':
      listeners = FOCUS_LISTENER;
      break;

    case 'RECONNECT_LISTENER':
      listeners = RECONNECT_LISTENER;
      break;

    case 'VISIBLE_LISTENER':
      listeners = VISIBLE_LISTENER;
      break;
  }
 
  if (listeners.has(event)) return;
  listeners.add(event);
  return () => {
    // 返回一个函数，组件卸载时直接调用即可移除
    listeners.delete(event);
  };
};

// 很明显，这里用的是发布订阅模式
const observer = (listeners: ListenersSet) => {
  listeners.forEach(event => {
    event();
  });
};

/* istanbul ignore else */
if (!isServer && window?.addEventListener) {
  // 监听页面可见性变化
  window.addEventListener(
    'visibilitychange',
    () => {
      /* istanbul ignore else */
      if (isDocumentVisibility()) {
        observer(VISIBLE_LISTENER);
      }
    },
    false,
  );
  window.addEventListener('focus', () => observer(FOCUS_LISTENER), false);
  window.addEventListener('online', () => observer(RECONNECT_LISTENER), false);
}

export default subscriber;
```
> 扩展：[页面可见性改变事件 : visibilitychange 详解](https://www.jianshu.com/p/e905584f8ed2)
> visibilitychange：元素浏览器标签页被隐藏或显示的时候会触发
> 应用场景举例：视频标签页，切换到别的标签页自动停止播放视频，回到视频标签页恢复播放


<a name="UEqf4"></a>
#### 依赖请求
日常开发中还有一种很常见的需求，就是当某一个状态变化时，需要我们重新发起请求，在 vue 中我们的做法一般是通过 watch / watchEffect 监听状态的变化在进行相应的操作，如下：
```tsx
<template>
  <button @click="isTrue = !isTrue">变化</button>  
  <button @click="fetchSomeThing">更新</button> 
  <a>{{text}}</a>
<template>
<script setup lang="ts">
  import { ref, watch } from 'vue'
  const isTrue = ref(false)
  const text = ref<string>('')

  watch(isTrue, () => {
    fetchSomeThing()
  })

  const fetchSomeThing = async () = {
    text.value = await axios.post(xxxxx, xxxxx)
  }
</script>
```
同样的场景使用 vueRequest 是什么样的呢？
```typescript
<template>
  <button @click="isTrue = !isTrue">变化</button>  
  <button @click="fetchSomeThing">更新</button> 
  <a>{{data}}</a>
<template>
<script setup lang="ts">
	import { ref } from 'vue'
	import { useRequest } from 'vue-request';
  const isTrue = ref(false)

  const fetchSomeThing = () = {
    return axios.post(xxxxx, xxxxx)
  }

 	const { data, loading } = useRequest(fetchSomeThing, {
    ready: isTrue,
  });
</script>
```
具体可查看官网（源码比较简单就不分析了）

- [api - ready](https://next.cn.attojs.org/api/#ready)
- [docs - ready](https://next.cn.attojs.org/guide/documentation/ready.html)
<a name="Tj2JI"></a>
#### 防抖
![image.png](https://cdn.nlark.com/yuque/0/2022/png/2586551/1670896327182-19b8ab27-5b8c-4719-aa16-b224672b4aea.png#averageHue=%23242a31&clientId=u7e5812fa-bc93-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=685&id=u31a9a8b6&margin=%5Bobject%20Object%5D&name=image.png&originHeight=753&originWidth=1509&originalType=binary&ratio=1&rotation=0&showTitle=false&size=77630&status=done&style=none&taskId=u286988e8-81f0-43ae-a865-5a7e07a3a12&title=&width=1371.818152084824)<br />因为这里防抖用的是 lodash 提供的 api，所以直接看 lodash 的 api 文档即可 

- [lodahs - debounce](https://www.lodashjs.com/docs/lodash.debounce) 
- [vueRequest - debounce](https://next.cn.attojs.org/guide/documentation/debounce.html)
<a name="BKEGC"></a>
#### 节流
同防抖一样，略过，直接看

- [lodash - throttle](https://www.lodashjs.com/docs/lodash.throttle)
- [vueRequest - throttle](https://next.cn.attojs.org/guide/documentation/throttle.html)
<a name="wYxAn"></a>
#### 缓存
还是先举例吧，在常见的 B 端系统或者后台管理系统中，最常出现的就是各种表单和表格，通常我们会把一些筛选条件封装成独立的组件，在组件内部去调用接口<br />但是这样存在一个问题，就是如果页面出现多个相同的组件，那么在组件渲染的时候就会出现多次同时调用同一接口，而且这样的接口数据在一定时间范围内不会有变化，那么对于这样的一列请求，我们就可以使用缓存来优化网络请求了<br />vueRequest 提供了以下几个和缓存相关的 api：

- [cachekey](https://next.cn.attojs.org/api/#cachekey) ： 缓存的 key，必须唯一

![image.png](https://cdn.nlark.com/yuque/0/2022/png/2586551/1670897471399-34a13148-0dc9-4628-9434-bf9fe22f7d9b.png#averageHue=%23242a32&clientId=u7e5812fa-bc93-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=337&id=u14f409b4&margin=%5Bobject%20Object%5D&name=image.png&originHeight=371&originWidth=747&originalType=binary&ratio=1&rotation=0&showTitle=false&size=25697&status=done&style=none&taskId=u92953b96-2438-4c02-a156-36ef3b04c31&title=&width=679.0908943720103)

- [cachetime](https://next.cn.attojs.org/api/#cachetime) ：缓存过期时间，时间过期自动删除缓存，默认时长 10 分钟
- [staletime](https://next.cn.attojs.org/api/#staletime) ：保鲜时间，0 ：每次组件刷新重新调用接口； -1：缓存永不过期
- [setcache](https://next.cn.attojs.org/api/#setcache) ： 设置自定义缓存
- [getcache](https://next.cn.attojs.org/api/#getcache) ： 获取自定义缓存
- [clearCache](https://next.cn.attojs.org/guide/documentation/cacheKey.html#%E6%B8%85%E9%99%A4%E7%BC%93%E5%AD%98) ：清除缓存（同样的组件，对于有些场景来说，必须保持最新的数据，这时就是能够用一个可以清除缓存的东西）

知道 vueRequest 的缓存都有啥后，正式开始源码之旅<br />首先，先不看自定义缓存，那么实际上就只有 3 个 api 和缓存相关了：cacheKey 、cacheTime、staletime
```typescript
// src/useAsyncQuery.ts
import { getCache, setCache } from './utils/cache';

function useAsyncQuery<R, P extends unknown[]>(
  query: Query<R, P>,
  options: BaseOptions<R, P>,
): BaseResult<R, P> {
  // ....
  const {
    // ....
    cacheKey,
    cacheTime = 600000,
    staleTime = 0,
    // .....
  } = {
    ...getGlobalOptions(), // vueRequest 默认配置项
    ...injectedGlobalOptions, // 用户全局配置项
    ...options, // 用户调用时的实际配置项
  };

  // ....
  // 更新缓存数据
  const updateCache = (state: State<R, P>) => {
    if (!cacheKey) return;

    // 获取之前缓存的数据
    const cacheData = getCache<R, P>(cacheKey)?.data;
    const cacheQueries = cacheData?.queries;
    const queryData = unRefObject(state);
    const currentQueryKey =
      queryKey?.(...state.params.value) ?? QUERY_DEFAULT_KEY;
  
    	setCache<R, P>(
        cacheKey, 
        {
          queries: {
            ...cacheQueries, // 上一次的缓存结果
            [currentQueryKey]: {
              ...cacheQueries?.[currentQueryKey],
              ...queryData,
            },
          },
          latestQueriesKey: currentQueryKey,
        },
        cacheTime,
      );
  };

  // ....

	// init queries from cache
  if (cacheKey) {
    const cache = getCache<R, P>(cacheKey);
    
    // 如果之前已有缓存
    if (cache?.data?.queries) {
      Object.keys(cache.data.queries).forEach(key => {
        // 获取缓存队列
        const cacheQuery = cache.data.queries![key];
  
        queries[key] = <UnWrapState<R, P>>reactive(
          createQuery(query, config, {
            loading: cacheQuery.loading,
            params: cacheQuery.params,	
            data: cacheQuery.data,
            error: cacheQuery.error,
          }),
        );
      });
      /* istanbul ignore else */
      if (cache.data.latestQueriesKey) {
        latestQueriesKey.value = cache.data.latestQueriesKey;
      }
    }
  } 

  // ...
  return {
    // ...
  }
}
```
```typescript
// src/core/utils/types.ts
export type UnWrapRefObject<T> = {
  [P in keyof T]: UnRef<T[P]>;
};

// src/core/utils/cache.ts
import type { State } from '../types';
import { isNil } from './index';
import type { UnWrapRefObject } from './types';

type CacheResultType<T> = {
  data: T;
  timer?: number;
  cacheTime: number;
};
type CacheKey = string;

// 用于缓存数据
const CACHE_MAP = new Map<CacheKey, CacheResultType<any>>();

export type CacheDataType<R, P extends unknown[]> = {
  queries?: { [key: string]: UnWrapRefObject<State<R, P>> };
  latestQueriesKey?: string;
};

type GetCacheReturn<R, P extends unknown[]> =
  | Omit<CacheResultType<CacheDataType<R, P>>, 'timer'>
  | undefined;

// 获取已缓存的数据
export const getCache = <R, P extends unknown[]>(
  cacheKey: CacheKey,
): GetCacheReturn<R, P> => {
  // 如果 cache 为 null / undefinded ,直接 return
  if (isNil(cacheKey)) return;
  // 获取缓存数据
  const data = CACHE_MAP.get(cacheKey);
  if (!data) return;
  // 返回缓存的数据和过期时间
  return {
    data: (data.data as unknown) as CacheDataType<R, P>,
    cacheTime: data.cacheTime,
  };
};

// 设置缓存数据
export const setCache = <R, P extends unknown[]>(
  cacheKey: CacheKey,
  data: CacheDataType<R, P>,
  cacheTime: number,
) => {
  // 获取上一次的缓存结果
  const oldCache = CACHE_MAP.get(cacheKey);
  // 清除上一次的缓存数据中的定时器
  if (oldCache?.timer) {
    clearTimeout(oldCache.timer);
  }
  // 定义新的定时器，在到达缓存过期时间的时候清除缓存
  const timer = setTimeout(() => CACHE_MAP.delete(cacheKey), cacheTime);
  // 保存缓存数据
  CACHE_MAP.set(cacheKey, {
    data,
    timer,
    cacheTime: new Date().getTime(),
  });
};

// 清除缓存数据
export const clearCache = (cacheKey?: CacheKey) => {
  if (cacheKey) {
    // 如果传入了 cacheKey， 则清除对于 key 的缓存和定时器
    clearTimeout(CACHE_MAP.get(cacheKey)?.timer);
    CACHE_MAP.delete(cacheKey);
  } else {
    // 若没有传入 cacheKey， 则清除所有的缓存和定时器
    CACHE_MAP.forEach(i => clearTimeout(i.timer));
    CACHE_MAP.clear();
  }
};
```
<a name="eY4Nt"></a>
#### 错误重试
相关 api

- [errorretrycount](https://next.cn.attojs.org/api/#errorretrycount) ： 最大错误重试次数
- [errorretryinterval](https://next.cn.attojs.org/api/#errorretryinterval) ： 错误重试时间间隔

<a name="iIk4f"></a>
#### 组件卸载
```typescript
// src/useAsyncQuery.ts
import { onUnmounted } from 'vue';

function useAsyncQuery<R, P extends unknown[]>(
  query: Query<R, P>,
  options: BaseOptions<R, P>,
): BaseResult<R, P> {
  // ....
  // unmount queries
  const unmountQueries = () => {
    Object.keys(queries).forEach(key => {
      queries[key].cancel();
      queries[key].unmount();
      delete queries[key];
    });
  };
  
  onUnmounted(() => {
    unmountQueries();
  });

  // ...
  return {
    // ...
  }
}
```
```typescript
// src/createQuery.ts

const createQuery = <R, P extends unknown[]>(
  query: Query<R, P>,
  config: Config<R, P>,
  initialState?: UnWrapRefObject<State<R, P>>,
): InnerQueryState<R, P> => {
  // ....

  // collect subscribers, in order to unsubscribe when the component unmounted
  const unsubscribeList: (() => void)[] = [];
  const addUnsubscribeList = (event?: () => void) => {
    event && unsubscribeList.push(event);
  };
  
  const unmount = () => {
    // 前面将轮询的时候已经说过，unsubscribeList 里的每一个子项都是一个函数，执行后从
    // Set 中把对应的 key 给 delete 掉
    unsubscribeList.forEach(unsubscribe => unsubscribe());
  };

  const cancel = () => {
    count.value += 1;
    setState({ loading: false });

    // 移除防抖功能，同时清除防抖定时器
    if (debouncedRun) debouncedRun.cancel();
   	// 移除节流功能，同时清除节流定时器
    if (throttledRun) throttledRun.cancel();

    clearAllTimer();
  };

  const clearAllTimer = () => {
    // 清除轮询定时器
    if (pollingTimer.value) pollingTimer.value();

    // 清除延迟调用定时器
    if (delayLoadingTimer.value) delayLoadingTimer.value();

    // 清除错误重试定时器
    if (retryTimer.value) retryTimer.value();
  };

  return {
    // ...
    cancel,
    unmount
  }
}
```
<a name="aSYM4"></a>
## vue-request 总结

1. 通过 generateService 保证 useRequest 的第一个参数是一个 Promise
2. 通过 vue 的 provide 提供了全局配置能力，实现  默认配置 < 全局配置 < 使用时传入的配置
3. 防抖、节流功能直接使用了 lodash 提供的方法
4. 通过发布订阅模式实现轮询功能停止与恢复
<a name="Ozzrd"></a>
## 
