# css 变量实现主题切换

:::warning
这里是记录一下怎么使用纯 css 使用主题切换，如果想结合 less / scss, 可以看我另一篇文章 **实现系统主题切换功能**
:::

- 实战记录： 可以使用我的 create-whf 脚手架创建完整的 vue3 项目，里面已经内置了主题切换功能

## gogogo

从头开始实现

```shell
pnpm create vite
# 选择 vue3 + ts
```

src 下新建以下目录

```
- src
    - hooks
        - useTheme.ts
    - theme
        - index.ts
        - theme-default.ts
        - theme-blue.ts
        - types.ts
    - assets
        - global.css
    - App.vue
    - main.ts
```

## 定义主题

```ts
// theme/types.ts
export type Theme = Record<string, string>
export type Themes = Record<ThemeType, Theme>[]
export type ThemeType = 'default' | 'blue'

// theme/index.ts
import type { Theme } from './types'
import defaultTheme from './default'
import blueTheme from './blue'

const themes = {
    default: defaultTheme,
    blue: blueTheme
} as Themes

export default themes


// theme/theme-default.ts
export default {
    primaryColor: 'yellow',
    activeTextColor: 'orange'
}

// theme/theme-blue.ts
export default {
    primaryColor: 'skyBlue',
    activeTextColor: 'green'
}
```

## 封装自定义 hook

```ts
// hooks/useTheme.ts
import { ref } from 'vite'
import type { ThemeType } from '@/theme/types'
import themes from '@/theme'

type LocalThemeType = ThemeType | null
const THEME_KEY = 'sys-theme'

const useTheme = () => {
    const theme = ref<ThemeType>(
        localStorage.getItem(THEME_KEY) as LocalThemeType || 'default'
    )

    const setTheme = (type: ThemeType) => {
        const html = document.getElementByTagName('html')[0] as HTMLHtmlElement

        themes[type].entries(([key, value]) => {
            html.style.setProperty(`--${key}`, value)
        })

        theme.value == type
        localStorage.setItem(THEME_KEY, type)
    }

    setTheme()

    return {
        theme,
        setTheme
    }
}
```


## 使用

```css
.my-bg {
    background-color: var(--primaryColor);
}

.active-text {
    color: var(--activeTextColor)
}
```

```html
<!-- App.vue -->

<template>
    <div class="my-bg">
        <p class="active-text">我是文字</p>
        <p>当前主题色是 {{ theme }}</p>
        <button @click="handleChange">我是按钮</button>
    </div>
</template>
<script setup lang="ts">
import useTheme from '@/hooks/useTheme'
import { ref } from 'vue'
const { theme, setTheme } = useTheme()
const num = ref<number>(0)

const handleChange = () => {
    num.value ++
    setTheme(num.value % 2 === 0 ? 'default' : 'blue')
}
</script>
```

ok, 主题切换实现