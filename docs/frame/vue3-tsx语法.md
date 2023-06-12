<!--
 * @Author: hfWang
 * @Date: 2022-07-19 23:33:25
 * @LastEditTime: 2022-07-25 19:12:57
 * @Description: file content
 * @FilePath: \hf-blog-2\docs\vue3\vue3-tsx.md
-->

# vue-tsx 具体使用

:::warning 概要
本文主要介绍了 vue3 中怎么使用 tsx
:::

> 在搭建 vue 项目中已经说了如何搭建一个 vite+vue3+tsx 的项目环境了，这篇文章就来介绍一下怎么在 vue3 中使用 tsx

## 为什么使用 jsx 而不使用 SFC

### 使用 jsx

- 优点：

  - vue3 原生支持 jsx 语法，结合 ts 之后在开发过程中全程享受类型提示
  - 相对灵活的书写方式，代码复用性高
  - 和别人说的时候可以装装 13

- 缺点：
  - 相比 sfc 少了静态模板编译，性能相对弱一点（除非页面复杂度巨大，否则没啥大的性能区别， 毕竟有这么多的组件库采用这种开发模式）
  - 一些 vue 社区为 setup 语法专门开发的插件无法使用（如 自动导入 api、自动导入组件库组件等）
  - 语法相对于 sfc 的变化巨大，需要一定的上手时间
  - vue devtools 中无法捕获 setup + jsx 下的变量，具体可以看这个 [issue](https://github.com/vuejs/devtools/issues/1295)

### 一些使用 vue3 + tsx 的开源案例

- [devui](https://github.com/DevCloudFE/vue-devui)
- [naive-ui](https://github.com/TuSimple/naive-ui)

## tsx 组件的基本文件结构

一个基本的组件一般有以下文件组成

```shell
--comp
  --comp.tsx // 组件本身
  --comp.module.scss // 使用 module 避免样式冲突
  --comp.types.ts // 类型提示文件，也可单独创建一个 types 文件夹 用于保存
  --useComp.ts // 可选，composable / hooks
```

1. `comp.tsx`

```tsx
import { defineComponent } from "vue";
import { type IProps, Props } from "comp.types.ts";
import s from "./comp.module.scss";

export default defineComponent({
	name: "youCompName",
	props: Props,
	emits: [],
	setup(props: IProps, ctx: SetupContent) {
		return () => <div class={s.customStyle}>xxx</div>;
	},
});
```

2. `comp.types.ts`

```ts
import { ExtractPropTypes } from "vue";

interface ICustomConfig {
	a: string;
	b: number;
	c?: ICustomConfig[];
}

export const Props = {
	width: {
		type: Number,
		default: 40,
	},
	customConfig: {
		type: Object as PropTypes<ICustomConfig>,
	},
} as const;

export type IProps = ExtractPropTypes<typeof Props>;
```

3. `comp.module.scss`

```scss
.customStyle {
	width: 50%;
}
```

## 变量和事件

|     | 变量   | 事件    |
| --- | ------ | ------- |
| sfc | :a="a" | @click  |
| jsx | a={a}  | onClick |

> sfc 变量传递 通过使用 v-on 传递，事件通过 @事件名, 如 @click、@scroll、@dbClick

> jsx 变量传递 变量名={变量} 传递，事件通过 on 事件名， 如 onChange、onClick、onScroll

具体使用如下：

```ts
const a = ref<number>(0);
const clickChild = () => {};
```

### SFC

```html
<template>
	<parent>
		<child :a="a" @click="clickChild"></child>
	</parent>
</template>
```

### Tsx

```tsx
setup(){
  const a = ref<number>(0)

  return () => {
    <parent>
      <child a={a} onClick={clickChild}></child>
    </parent>
  }
}
```

## v-show/if/for 的替换

```ts
const _if = ref(true);
const _show = ref(true);
const list = ref([1, 2, 3, 4, 5]);
```

### SFC

```html
<template>
	<a v-if="_if"> v-if </a>
	<a v-show="_show"> v-show </a>
	<a v-for="item in list"> {{ item }} </a>
</template>
```

### Tsx

```tsx
setup(){
  const a = ref<number>(0)

  return () => (
    <>
      { _if.value && <a> if </a> }
      <a style={{ display: _show.value ? 'block' : 'none' }}> show </a>
      {
        list.value.map(item => <a>{item}</a>)
      }
    </>

}
```

## 插槽

```ts
// 通用数据
const datalist = ref([
  {slot: 'a', id: 1}
  {slot: 'b', id: 2}
  {slot: 'c', id: 3}
])
```

### SFC

```html
<!--子组件定义插槽-->
<!--child.vue-->
<template>
	<div>
		<slot></slot>
		<slot name="slotFlag"></slot>
		<template v-for="(item, index) in props.datalist">
			<slot :name="item.slot" :item="item" :index="index"> </slot>
		</template>
	</div>
</template>

<!--父组件使用插槽-->
<!--parent.vue-->
<template>
	<child :datalist="datalist">
		<template>我是默认插槽</template>
		<template slot="slotFlag">我是具名插槽 slotFlag</template>
		<template slot="a" slot-scope="{ item, index }">{{ item.id }}</template>
		<template slot="b" slot-scope="{ item, index }">{{ item.id }}</template>
		<template slot="c" slot-scope="{ item, index }">{{ item.id }}</template>
	</child>
</template>
```

### tsx

```tsx
// 子组件定义插槽
// child.tsx
setup(props, ctx) {
  return () => (
    <div>
      {ctx.slots.default?.()}
      {ctx.slots.slotFlag?.()}
      {
        props.datalist.map((item,index) => ctx.slots[item.slot]?.(item, index))
      }
    </div>
  )
}

// 父组件使用插槽
// parent.tsx
setup() {
  const slots = {
    default: () => '我是默认插槽',
    slotFlag: () => '我是具名插槽',
    a: (item, index) => item.id,
    b: (item, index) => item.id,
    c: (item, index) => item.id,
  }
  return () => (
    <div>
      <child datalist={datalist} v-slots={slots}></child>
    </div>
  )
}
```

## 父子通信

### 父传子

> 父传子无论 sfc 还是 tsx 都是通过 props 传给子组件的，对于常量传递方法基本一致，变量稍稍不同

```js
// sfc
<parent><child str="我是字符串" :data="data"></child></parent>
// tsx
<parent><child str="我是字符串" data={data}></child></parent>
```

### 子传父

我们知道 sfc 中，子传父是通过 emit 是实现的，如下：

子组件：

```html
<template>
	<div @click="talkParent">...</div>
</template>
<script>
export default {
	emits: ["doSomeThing"],
	setup(props, ctx) {
    const data = 0
		const talkParent = () => ctx.emit("doSomeThing", data);
		return {
			talkParent,
		};
	},
};
</script>
```

父组件：

```html
<template>
	<div>
		<child @doSomeThing="doSomeThing"></child>
	</div>
</template>
<script>
export default {
	setup() {
		const doSomeThing = (data) => console.log("子组件通知我了", data);
	},
};
</script>
```

而在 tsx 中通常需要同时使用两种方式，分别来应对 sfc 或 jsx 组件本身

同样使用 emits （使用这种方式的话，该组件可以被 sfc / jsx 写法的组件使用）

子组件

```tsx
// props 要接受一个 onDoSomeThing 的函数
export default {
	emits: ["doSomeThing"],
	setup(props, ctx) {
    const data = 0
		const talkParent = () => {
      ctx.emit("doSomeThing", data)
      props.onDoSomeThing(data)
    };
    return () => <div onClick={talkParent}>...</div>
	},
};
```

+ 父组件为 sfc 格式无特别需要注意的，同 sfc 开发时一致

+ 父组件为 jsx

```jsx
export default {
	emits: ["doSomeThing"],
	setup(props, ctx) {
		const doSomeThing = (data) => console.log("子组件通知我了", data);

    return () => <div><child onDoSomeThing={doSomeThing}></child></div>
	},
};
```

ok, 到这里基本解决了 vue3 + tsx 与 sfc 80% 的语法区别了，最后再说下一些需要注意的点，其余的各位再去慢慢学习。

## 注意

- jsx 要用 defineComponent 包裹，并且只使用 setup（没有 data、methods、computed 等一级声明），返回值要是一个 render function，里面采用 JSX 的写法

- jsx 组件中 components、props、emits 等的声明是省不了的，且目前无法通过一些自动导入的插件

- setup 里面的 render 函数中，使用 ref / computed 都需要通过 .value 获取