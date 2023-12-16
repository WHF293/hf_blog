# vue-router3 / 4 的区别

## 全局前置守卫

### vue-router-3

```js
const router = new VueRouter({ ... })

router.beforeEach((
  to, // 目标路径
  from, // 当前路径
  next // 一定要调用该方法来 resolve 这个钩子
) => {
  // ...
})
```

next

- next(): 进入下一个管道钩子
- next(false): 中断导航
- next('/') 或者 next({ name: 'xxx' }): 跳转到目标路径

### vue-router-4

4.x 版本全局前置守卫不强制使用第三个入参 next， 但仍可以兼容 3.x 的写法

```js
const router = createRouter({ ... })

router.beforeEach((
  to, // 目标路径
  from, // 当前路径
) => {
  // ...
  // 返回 false 以取消导航
  return false

  // return { name: 'xxx' }
})
```

## 路由过度效果

### vue-router-3

```html
<transition>
  <router-view></router-view>
</transition>
```

### vue-router-4

```html
<router-view v-slot="{ Component }">
  <transition name="fade">
    <component :is="Component" />
  </transition>
</router-view>
```

## 路由元信息 ts 定义

```ts
// vite-env.d.ts
import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    a: string
    b: number
    // ...路由元信息里的内容
  }
}
```

## 动态路由

> 一般用于路由权限判断

```js
const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/:articleName', component: Article }],
})

router.addRoute({ path: '/about', component: About })
```

> 扩展：
>
>删除路由： removeRoute
>
>查看现有路由： getRoutes、hasRoute