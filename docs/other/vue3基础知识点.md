# vue3 基础知识点

:::warning
主要记录 [vue3](https://staging-cn.vuejs.org/) 的一些使用技巧
:::

<!--more-->

## 基本概念

1. 顶层的绑定会被暴露给模板

```html
<script setup>
// 导入的模块
import { capitalize } from "./helpers";
// 变量
const msg = "Hello!";
// 函数
function log() {
    console.log(msg);
}
</script>

<template>
    <button @click="log">{{ msg }}</button>
    <div>{{ capitalize("hello") }}</div>
</template>
```

所以，在使用 setup 语时，对于不需要暴露给模板使用的变量，比如用于计算、比较等场景的临时变量或和业务逻辑无关的变量，需要注意下变量所在的作用域是否正确

2. 组件使用

```html
<script setup>
import Foo from "./Foo.vue";
import Bar from "./Bar.vue";
// 命名空间组件，form-components 对外导出 input 和 label 两个组件
import * as Form from "./form-components";
</script>

<template>
    <!-- 常规组件使用 -->
    <Foo />
    <!-- 动态组件使用 -->
    <component :is="someCondition ? Foo : Bar" />
    <!-- 命名空间组件 -->
    <Form.Input>
        <Form.Label>label</Form.Label>
    </Form.Input>
</template>
```

3. 顶层 await

> async setup() 必须与 Suspense 组合使用

```html
<!-- vue 3.0 -->
<script>
export default defineComponent({
    async setup() {
        const data = await fetch("xxxx.xxxx.xxxx");
        return {};
    },
});
</script>
<!-- vue 3.2 -->
<script setup>
const post = await fetch(`/api/post/1`).then((r) => r.json());
</script>
```

## props 使用

[官方文档——TypeScript 与组合式 API](https://staging-cn.vuejs.org/guide/typescript/composition-api.html)

### vue3.0

```html
<script lang="ts">
import { ExtractPropTypes, PropType, SetupContext } from "vue";

interface IObj {
    name: string;
    age: number;
}

// 将 props 定义为常量
const Props = {
    str: {
        type: String,
        default: "",
        required: true,
    },
    obj: {
        type: Object as PropType<IObj>,
        default: () => {},
    },
} as const; // as const 让深层结构的 props 依旧只保留只读属性

// ExtractPropTypes： 类型反推， 根据上面定义的 props 常量反推出常量的类型
const IProps = ExtractPropTypes<typeof Props>;

export default defineComponent({
    props: Props,
    setup(props: IProps, ctx: SetupContext) {
        // 。。。。。
    },
});
</script>
```

### vue3.2

-   [单文件组件 `<script setup>`](https://v3.cn.vuejs.org/api/sfc-script-setup.html)

```html
<script setup lang="ts">
import { withDefault } from "vue";

interface IProps {
    str: string;
    obj: {
        name: string;
        age: number;
    };
}
// 不需要默认值
const props = defineProps({
    foo: String,
});

// 需要默认值
const props = withDefault(defineProps<IProps>(), {
    str: "",
    obj: {},
});
</script>
```

### vue3.2 响应式语法糖

```ts
<script setup lang="ts">
  interface Props {
    msg: string
    count?: number
    foo?: string
  }

  const {
    msg,
    // 默认值正常可用
    count = 1,
    // 解构时命别名也可用
    // 这里我们就将 `props.foo` 命别名为 `bar`
    foo: bar
  } = defineProps<Props>()

  watchEffect(() => {
    // 会在 props 变化时打印
    console.log(msg, count, bar)
  })
</script>
```

## emit 使用

### vue3.0

```html
<template>
    <span @click="update"></span>
    <span @click="update2('1')"></span>
</template>

<script lang="ts">
export default defineComponent({
    props: Props,
    emits: ["update"],
    setup(props: IProps, ctx: SetupContext) {
        const update = () => {
            ctx.emit("update");
        };
        const update2 = () => {
            ctx.emit("update", id);
        };
        return {
            update,
        };
    },
});
</script>
```

### vue3.2

```html
<template>
    <span @click="update"></span>
    <span @click="update2('1')"></span>
</template>

<script setup lang="ts">
const emit = defineEmit<{
    (e: "update"): void;
    (e: "update2", value: string): void;
}>();

const update = () => {
    emit("update");
};
const update2 = (id: string): void => {
    emit("update1", id);
};
</script>
```

## slot 使用

子组件模板：

```html
<!-- Son -->
<template>
    <div>
        <!-- 默认插槽 -->
        <slot></slot>
        <!--具名插槽  -->
        <slot name="name"></slot>
        <slot name="age"></slot>
    </div>
</template>
```

### SFC 写法

```html
<!-- Father -->
<template>
    <Son>
        <template #name>name</template>
        <template #age>age</template>
        <template>xxxxxxxxxxxx</template>
    </Son>
</template>
```

### jsx 写法

```jsx
// 默认插槽
<Son>{() => 'hello'}</Son>

// 具名插槽
<Son>
{{
  default: () => 'default slot',
  name: () => <div>name</div>,
  age: () => [<span>one</span>, <span>two</span>]
}}
</Son>
```

## vue3 类与样式的绑定

### 绑定对象

```html
<template>
    <!-- 不推荐在元素里直接使用 -->
    <div :class="{ active: isActive, 'text-danger': hasError }"></div>
</template>
<script setup>
import { ref } from "vue";

const isActive = ref(true);
const error = ref(null);
</script>
```

```html
<template>
    <!-- 推荐 -->
    <div :class="classObject"></div>
</template>
<script setup>
import { computed } from "vue";
// 利用 计算属性
const classObject = computed(() => ({
    active: isActive.value && !error.value,
    "text-danger": error.value && error.value.type === "fatal",
}));
</script>
```

### 绑定数组

```html
<template>
    <!-- 直接使用 -->
    <div :class="[activeClass, errorClass]"></div>
    <!-- 需要条件判断 -->
    <!-- 方式一：不推荐 -->
    <div :class="[isActive ? activeClass : '', errorClass]"></div>
    <!-- 方式二： 推荐 -->
    <div :class="[{ active: isActive }, errorClass]"></div>
</template>
<script setup>
import { ref } from "vue";

const activeClass = ref("active");
const errorClass = ref("text-danger");
</script>
```

## vue3 条件渲染

> 当 v-if 和 v-for 同时存在于一个元素上的时候，v-if 会首先被执行

### SFC

```html
<template>
    <div v-if="type === 'A'">A</div>
    <div v-else-if="type === 'B'">B</div>
    <div v-else>C</div>
</template>
```

### jsx

```jsx
<div>{type === "A" ? "A" : type === "B" ? "B" : "C"}</div>
```

## vue 事件处理

:::warning
使用修饰符时需要注意`调用顺序`，因为相关代码是以相同的顺序生成的。

因此使用 `@click.prevent.self 会阻止元素内的所有点击事件而 @click.self.prevent 则只会阻止对元素本身的点击事件`。
:::

```html
<template>
    <!-- 单击事件将停止传递 -->
    <a @click.stop="doThis"></a>
    <!-- 提交事件将不再重新加载页面 -->
    <form @submit.prevent="onSubmit"></form>
    <!-- 修饰语可以使用链式书写 -->
    <a @click.stop.prevent="doThat"></a>
    <!-- 也可以只有修饰符 -->
    <form @submit.prevent></form>
    <!-- 仅当 event.target 是元素本身时才会触发事件处理器 -->
    <!-- 例如：事件处理器不来自子元素 -->
    <div @click.self="doThat">...</div>
</template>
```

:::warning
`.capture，.once，和 .passive 修饰符与原生 addEventListener 事件相同:`
:::

```html
<template>
    <!-- 添加事件监听器时，使用 `capture` 捕获模式 -->
    <!-- 例如：指向内部元素的事件，在被内部元素处理前，先被外部处理 -->
    <div @click.capture="doThis">...</div>

    <!-- 点击事件最多被触发一次 -->
    <a @click.once="doThis"></a>

    <!-- 滚动事件的默认行为 (scrolling) 将立即发生而非等待 `onScroll` 完成 -->
    <!-- 以防其中包含 `event.preventDefault()` -->
    <!-- passive: 一般用于触摸事件的监听器，可以用来改善移动端设备的滚屏性能 -->
    <div @scroll.passive="onScroll">...</div>
</template>
```

:::warning 注意
请勿同时使用 `.passive 和 .prevent`，因为 .prevent 会被忽略并且你的浏览器可能会抛出警告。请记住，.passive 是向浏览器表明你不想阻止事件的默认行为。并且如果你这样做，可能在浏览器中收到一个警告。
:::

## vue3 生命周期

当调用 onMounted 时，Vue 会自动将注册的回调函数与当前活动组件实例相关联。

这就要求这些钩子在组件设置时同步注册。例如请不要这样做：

```js
setTimeout(() => {
    onMounted(() => {
        // 这将不会正常工作
    });
}, 100);
```

请注意，这并不意味着对 onMounted 的调用必须放在 setup() 或 `<script setup>` 内的词法环境下。
`onMounted()` 也可以在一个外部函数中调用，只要调用栈是同步的，且最终起源自 setup()。

[composition-api-lifecycle](https://staging-cn.vuejs.org/api/composition-api-lifecycle.html)

## 自定义指令

[官方文档——自定义指令](https://staging-cn.vuejs.org/guide/reusability/custom-directives.html)

### vue3.2

> 在 `<script setup>` 中，任何以 `v` 开头的 `camelCase 格式的变量`都会可以被用作一个自定义指令

```html
<script setup>
const vFocus = {
    mounted: (el: HtmlInputElement) => el.focus,
};
</script>
<template>
    <input v-focus />
</template>
```

### vue3.0

```html
<script>
export default {
    setup() {
        /*...*/
    },
    directives: {
        // 在模板中启用 v-focus
        focus: {
            /* ... */
        },
    },
};
</script>
<template>
    <input v-focus />
</template>
```

### 全局自定义指令

```ts
const app = createApp({});

// 使 v-focus 在所有组件中都可用
app.directive("focus", {
    /* ... */
});
```

> setup 语法下的 directive 不需要显示注册， 但命名规则必须在 v{指令名}Directive, 从其他文件导入的指令如不符合命名规则，则需要重命名

```html
<script setup>
import { myDirective as vMyDirective } from './MyDirective.js'
const vFocusDirective = {
  beforeMount: (el) => {
    el.focus()
  }
}
</script>
<template>
  <input v-focus-directive></input>
  <div v-my-directive></div>
</template>
```

## 插件

> 官方描述： 插件是一种能为 Vue 添加全局功能的工具代码。它可以是一个拥有 `install() `方法的对象，或者就简单地只是一个函数，它自己就是安装函数。

定义一个插件（对象），这个插件必须要有一个 `install` 方法

```js
// plugin/myPlugin/index.ts
const myPlugin = {
    install(app, options) {
        // 配置此应用
    },
};
export default myPlugin;
```

使用插件

```js
import { createApp } from "vue";
import App from "./App.vue";
import myPlugin from "./plugin/myPlugin";

const app = createApp(App);
app.use(myPlugin);
```

```js
// 最常用的插件就是 vue-router 和 Vuex
app.use(router)
app.use(vuex)
```

## getCurrentInstance 获取 vue 实例

vue3 的 setup 中没有 this ，所以无法在 setup 中直接获取到当前组件的实例，所以 vue3 给我们提供了 [getCurrentInstance](https://v3.cn.vuejs.org/api/composition-api.html#provide-inject) 这个方法用于获取组件实例

```js
// 原文地址： https://juejin.cn/post/7080800488915992589

import { getCurrentInstance } from "vue";
// 获取当前组件实例
const instance = getCurrentInstance();

// 获取当前组件的上下文，下面两种方式都能获取到组件的上下文
// 方式一，这种方式只能在开发环境下使用，生产环境下的ctx将访问不到
const { ctx } = getCurrentInstance();
// 方式二，此方法在开发环境以及生产环境下都能放到组件上下文对象（推荐）
const { proxy } = getCurrentInstance();
```

【备注】：

-   vue 官方不推荐在 vue3 项目开发中使用 `getCurrentInstance`, 除非自己非常清楚这个 api 会造成的影响
-   api 一般是在 ui 组件库等开源项目时才会使用、

`getCurrentInstance.proxy` 下面挂载的方法：

```js
// ctx 中包含了组件中由ref和reactive创建的响应式数据对象,以及以下对象及方法;
proxy.$attrs;
proxy.$data;
proxy.$el;
proxy.$emit;
proxy.$forceUpdate;
proxy.$nextTick;
proxy.$options;
proxy.$parent;
proxy.$props;
proxy.$refs;
proxy.$root;
proxy.$slots;
proxy.$watch;
```

## v-model 的新特性

dahkjshd

## v-memo

-   [官方文档 - v-memo](https://staging-cn.vuejs.org/api/built-in-directives.html#v-memo)

> 当搭配 v-for 使用 v-memo，确保它两是用在同一个元素中.
> v-memo 不能用在 v-for 内

```html
<template>
    <div v-for="item in list" v-memo="[item.id === selected]" :key="item.id">
        <p>ID: {{ item.id }} - selected: {{ item.id === selected }}</p>
        <p>...more child nodes</p>
    </div>
</template>
```

## defineExpose

> 在 vue 中，组件可以通过 ref / $parent / $children 来获取或调用其他相关组件的方法或变量，但在 setup 语法中是不允许的，除非组件主动对外暴露自身的属性，defineExpose 就是干这活的

```html
<script setup>
import { ref } from "vue";

const a = 1;
const b = ref(2);
const c = () => {};

// defineExpose 里面的对象外界可以通过 ref / $parent / $children 等方式访问到
defineExpose({
    a,
    b,
    c,
});
</script>
```

## useSlot 和 useAttrs

> 官方原话：useSlots 和 useAttrs 是真实的运行时函数，它的返回与 setupContext.slots 和 setupContext.attrs 等价。它们同样也能在普通的组合式 API 中使用

```html
<script setup>
import { useSlots, useAttrs } from "vue";

const slots = useSlots();
const attrs = useAttrs();
</script>

<!-- 等价于 -->
<script>
export default defineComponent({
    setup(props, { slots, attrs }) {
        return {};
    },
});
</script>
```

### 参考博客

-   [vue2 与 vue3 v-model 实现组件传值的写法](https://juejin.cn/post/6987958410276782094)

## setup 的第二个参数

## 全局变量 global

## 环境变量 env

## 响应式语法糖（实验性）

[官方文档——响应式语法糖](https://staging-cn.vuejs.org/guide/extras/reactivity-transform.html)
