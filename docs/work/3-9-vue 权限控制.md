# vue 权限控制

- [面试官问我按钮级别权限怎么控制，我说 v-if，面试官说再见](https://mp.weixin.qq.com/s/DrYCkRHdg0Vd1Yg-kEFzhg)

## 背景

> vue 项目大部分存在一个权限校验的过程，包括页面权限，组件权限，按钮权限等这种一般会去请求后端接口获取对应的权限，比如：
>
> - 请求接口 getPrivCode
>   - 页面权限： [pageACode, pageBCode, .....]
>   - 组件权限： [compACode, compBCode, ....]
>   - 按钮权限： [codeA, codeB,....]

## 实现权限控制

> 只针对 vue3 版本做实现，vue2 可以参考实现

```typescript
// src/store/privStore.ts
import { defineStore } from 'pinia'

export interface PrivStoreState {
  pagePrivCodes: string[]
  compPrivCodes: string[]
  btnPrivCodes: string[]
}

export type CodeType = typeof PrivStoreState

export const usePricStore = defineStore({
  state: (): PrivStoreState => ({
    pagePrivCodes: [],
    compPrivCodes: [],
    btnPrivCodes: [],
  }),
  action: {
    getPrivCodes: async (params): void => {
      // 这里可以使用 axios 或其他请求方式
      const res = await fetch.post('xxxxx', params)
      const { pagePrivCodes = [], compPrivCodes = [], btnPrivCodes = [] } = res.data.json()

      this.state.pagePrivCodes = pagePrivCodes as string[]
      this.state.compPrivCodes = compPrivCodes
      this.state.btnPrivCodes = btnPrivCodes
    },
    hasBtnCodePriv: (code: string): boolean => {
      return state.compPrivCodes.includes(code)
    },
    hasPageCodePriv: (code: string): boolean => {
      return state.pagePrivCodes.includes(code)
    },
    hasCompCodePriv: (code: string): boolean => {
      return state.compPrivCodes.includes(code)
    },
  },
})
```

### 页面权限控制

> 使用 addRoute

```typescript
// src/router/index.js
```

### 组件权限控制

```html
// privComp.vue
<template>
  <div>
    <slot v-if="showComp"></slot>
  </div>
</template>
<script setup>
  import { usePrivStore } from '@/store/privStore'
  const store = usePrivStore()

  const props = defineProps<{
    code: string
  }>()
  const showComp = computed<boolean>(() => store.compPrivCodes.includes(props.code))
</script>
```

使用

```html
// demo.vue
<template>
  <div>
    <privComp code="aaa">
      <testComp />
    </privComp>
  </div>
</template>
<script setup>
  import privComp from './privComp.vue'
  import testComp from './testComp.vue'
</script>
```

### 按钮权限控制

```typescript
// vPriv.ts
import { App, watchEffect } from 'vue'
import { usePrivStore } from '@/store/privStore'

const vPriv = {
  install: (app: App) => {
    app.direactive('priv', {
      mounted: (el, binding) => {
        const code = binding.value
        if (!code) return

        const store = usePrivStore()
        if (!store.hasBtnCodePriv(code)) {
          removeEl(el)
        }
      },
      update: (el, binding) => {
        if (el._pricCode_watchEffect) {
          update()
        } else {
          el._privCode_watchEffect = watchEffect(() => update())
        }
      },
    })
  },
}

const removeEl = (el) => {
  // 在绑定元素上存储父级元素
  el._parentNode = el.parentNode
  // 在绑定元素上存储一个注释节点
  el._placeholderNode = document.createComment('auth')
  // 使用注释节点来占位
  el.parentNode?.replaceChild(el._placeholderNode, el)
}

const addEl = (el) => {
  // 替换掉给自己占位的注释节点
  el._parentNode?.replaceChild(el, el._placeholderNode)
}

const update = (el, binding) => {
  // 按钮权限码没有变化，不做处理
  if (binding.value === binding.oldValue) return
  const store = usePrivStore()
  // 判断用户本次和上次权限状态是否一样，一样也不用做处理
  let oldHasPermission = store.hasBtnCodePriv(binding.oldValue)
  let newHasPermission = store.hasBtnCodePriv(binding.value)
  if (oldHasPermission === newHasPermission) return
  // 如果变成有权限，那么把元素添加回来
  if (newHasPermission) {
    addEl(el)
  } else {
    // 如果变成没有权限，则把元素删除
    removeEl(el)
  }
}
```
