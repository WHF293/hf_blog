# webpack 专项

:::tip
老王 webpack 学习笔记
:::

## cjs、esm、umd 区别

- cjs
    - 运行在 node 环境，不能直接在浏览器环境使用
    - 使用 module 和 exports 进行导入导出
    - 输出的是值的拷贝
      - 也就是说，一旦输出一个值，模块内部的变化就不会影响到这个值了
    - 运行时加载
      - 输入时先加载整个模块，生成一个对象，使用时在从这个对象上读取方法
- esm
    - node 和 浏览器环境都支持
    - 使用 export 和 import 导入导出
    - 输出的是值的引用
      - 遇到 import 时只会生成一个只读引用，只有脚本执行时，才回去加载的模块里面取值
    - 编译时加载
      - es 模块不是对象，使用时只加载指定的对象，不用加载整个模块

> 如何在 node 中使用 esm
>
> 1. 文件后缀使用 .mjs（不推荐）
>
> 2. package.json 设置 type 为 module (推荐)

![](https://img-blog.csdnimg.cn/f5acaf7f1e574f90a98b2804a7f581a7.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBA5LiA5p2h6IKl6bK26bG8,size_20,color_FFFFFF,t_70,g_se,x_16#pic_center)


- umd
    - 兼容 cjs 和 amd

## webpack 打包原理

本质上,webpack 是一个现代 JavaScript 应用程序的静态模块打包器(module bundler)。

当 webpack 处理应用程序时,它会`递归地构建一个依赖关系图(dependency graph), 其中包含应用程序需要的每个模块, 然后将所有这些模块打包成一个或多个 bundle`。

webpack 就像一条生产线,要经过一系列处理流程后才能将源文件转换成输出结果。

这条生产线上的每个处理流程的职责都是单一的,多个流程之间有存在依赖关系,只有完成当前处理后才能交给下一个流程去处理。 

插件就像是一个插入到生产线中的一个功能,在特定的时机对生产线上的资源做处理。


## webpack 构建流程

:::warning 省流
核心： module，在 webpack 中，可以认为一个文件就是一个 module

初始化参数 -> 开始编译 -> 确定入口 -> 编译模块 -> 完成模块编译 -> 输出资源 -> 输出完成
:::

1. `初始化参数`：解析webpack配置参数，合并shell传入和webpack.config.js文件配置的参数，形成最后的配置结果。
2. `开始编译`：上一步得到的参数初始化compiler对象，注册所有配置的插件，插件监听webpack构建生命周期的事件节点，做出相应的反应，执行对象的 run 方法开始执行编译。
3. `确定入口`：从配置的entry入口，开始解析文件构建AST语法树，找出依赖，递归下去。
4. `编译模块`：递归中根据文件类型和loader配置，调用所有配置的loader对文件进行转换，再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理。
5. `完成模块编译`：在经过第4步使⽤ Loader 翻译完所有模块后，得到了每个模块被翻译后的最终内容以及它们之间的依赖关系；
6. `输出资源`：根据⼊⼝和模块之间的依赖关系，组装成⼀个个包含多个模块的 Chunk，再把每个 Chunk 转换成⼀个单独的⽂件加⼊到输出列表，这步是可以修改输出内容的最后机会；
7. `输出完成`：在确定好输出内容后，根据配置确定输出的路径和⽂件名，把⽂件内容写⼊到⽂件系统。

> rollup 、vite 都是基于 ESM, 开发阶段无需构建，浏览器直接使用

## loader 是什么？常见的 loader

loader 用于对模块的源代码进行转换。

loader 可以使你在 import 或 "load(加载)" 模块时预处理文件

loader 可以将文件从不同的语言（如 TypeScript）转换为 JavaScript 或者将内联图像转换为 data URL。

### loader 特性

- loader `支持链式调用`。链中的每个 loader 会将转换应用在已处理过的资源上。一组链式的 loader 将按照相反的顺序执行。链中的第一个 loader 将其结果（也就是应用过转换后的资源）传递给下一个 loader，依此类推。最后，`链中的最后一个 loader，返回 webpack 所期望的 JavaScript`。
- loader `可以是同步的，也可以是异步的`。
- loader `运行在 Node.js 中`，并且能够执行任何操作。
- loader 可以通过 options 对象配置
- 插件(plugin)可以为 loader 带来更多特性。
- loader `能够产生额外的任意文件`。

多数情况下，loader 将从 模块路径 加载（通常是从 npm install, node_modules 进行加载）。

### 常见的 loader

- css-loader
- style-loader
- sass-loader
- less-loader
- babel-loader
- ts-loader
- file-loader
- url-loader
- html-minify-loader

> parse -> ast -> transform -> ast -> genCode -> target Code

## plugin 是什么？常见的 plugin

webpack 插件是一个具有 `apply` 方法的 JavaScript 对象。

apply 方法会被 `webpack compiler 调用`，并且在整个编译生命周期都可以访问 compiler 对象。

### 常见 plugin

-

### loader 和 plugin 的区别

1. loader 用于加载某些资源文件。因为 webpack 只能理解 JavaScript 和 JSON 文件，对于其他资源例如 css，图片，或者其他的语法集，比如 jsx， coffee，是没有办法加载的。 这就需要对应的 loader 将资源转化，加载进来。从字面意思也能看出，loader 是用于加载的，它作用于一个个文件上。

2. plugin 用于扩展 webpack 的功能。目的在于解决 loader 无法实现的其他事,它直接作用于 webpack，扩展了它的功能。当然 loader 也是变相的扩展了 webpack ，但是它只专注于转化文件（transform）这一个领域。而 plugin 的功能更加的丰富，而不仅局限于资源的加载。


## sourceMap 是什么？怎么用？

### 什么是 Sourcemap

Sourcemap 本质上是一个信息文件，里面储存着代码转换前后的对应位置信息。`它记录了转换压缩后的代码所对应的转换前的源代码位置，是源代码和生产代码的映射`。 Sourcemap 解决了在打包过程中，代码经过压缩，去空格以及 babel 编译转化后，由于代码之间差异性过大，造成无法debug的问题。

### 怎么使用

```js
// package.json
const path = require("path")

module.exports = {
  entry: 'main.js',
  output: {
    // ...
  },
  // 不推荐
  devtool: "source-map"
}
```

source 字段说明
- cheap: 只能定位到对应的 js 文件，生成单独的 .js.map 文件（外连）
- cheap-module：可以定位到源代码的第几行，生成单独的 .js.map 文件（外连）
- inline：source-map 放在打包后的 js 文件内部（内连）
- eval: 同上，但是每个 js 文件单独生成对应的 map 文件

- 开发环境： `devtool: cheap-module-eval-source-map`
- 生产环境： `devtool: cheap-module-source-map`


## webpack 的 module、chunk、bundle 又怎么区别

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6ae2804df7064ee183b64c391e229f09~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)

1. 对于一份同逻辑的代码，当我们手写下一个一个的文件，它们无论是 ESM 还是 commonJS 或是 AMD，他们都是 module ；
1. 当我们写的 module 源文件传到 webpack 进行打包时，webpack 会根据文件引用关系生成 chunk 文件，webpack 会对这个 chunk 文件进行一些操作；
1. webpack 处理好 chunk 文件后，最后会输出 bundle 文件，这个 bundle 文件包含了经过加载和编译的最终源文件，所以它可以直接在浏览器中运行。

> 我们直接写出来的是 module，webpack 处理时是 chunk，最后生成浏览器可以直接运行的 bundle。

## webpack文件指纹中 hash、chunkhash 和 contenthash 的区别

- hash：一整个项目，一次打包，只有一个hash值
- chunkhash: 根据chunk生成hash值，来源于同一个chunk，则hash值就一样(入口文件及其依赖构成一个 chunk，共享一个chunkhash)
- contenthash: 根据内容生成hash值，文件内容相同hash值就相同

### 文件指纹是什么

文件指纹就是打包后输出的⽂件名的后缀，主要用来对修改后的文件做版本区分。

1. Hash：和整个项⽬的构建相关，只要项⽬⽂件有修改，整个项⽬构建的 hash 值就会更改，一般用于图片设置；
2. Chunkhash：与 webpack 打包的 chunk 有关，不同的 entry 会⽣成不同的 chunkhash 值，一般用于设置JS文件；
3. Contenthash：根据⽂件内容来定义 hash ，⽂件内容不变，则 contenthash 不变，一般用于设置CSS文件；

## webpack HMR 的原理

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6446a659b4064b6a96df451bfe674b43~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)


## babel 的原理？常见的 babel 有哪些？

Babel 是一个JavaScript编译器，主要用于将 ECMAScript 2015+ 版本的代码转换为向后兼容的 JavaScript 语法，以便能够运行在当前和旧版本的浏览器或其他环境中。

- [Babel配置详解](https://juejin.cn/post/7203359540561117240)

## tree-shaking 原理是什么

Tree shaking 是一种通过清除多余代码方式来优化项目打包体积的技术，专业术语叫 Dead code elimination

Tree Shaking 在去除代码冗余的过程中，程序会从入口文件出发，扫描所有的模块依赖，以及模块的子依赖，然后将它们链接起来形成一个 “抽象语法树” (AST)。随后，运行所有代码，查看哪些代码是用到过的，做好标记。最后，再将“抽象语法树”中没有用到的代码“摇落”。经历这样一个过程后，就去除了没有用到的代码。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7bed23d8877d4ddf8ffc249f7cbbf276~tplv-k3u1fbpfcp-zoom-1.image)

> 前提是模块必须采用 ES6 Module 语法，因为 Tree Shaking 依赖 ES6 的静态语法：import 和 export。

### sideEffect

sideEffect(副作用) 的定义是，在导入时会执行特殊行为的代码，而不是仅仅暴露一个 export 或多个 export。

webpack v4 开始新增了一个 sideEffects 特性，通过给 package.json 加入 sideEffects: false 声明该包模块是否包含副作用，从而可以为 Tree Shaking 提供更大的优化空间。

- [带你了解 tree-shaking](http://zoo.zhengcaiyun.cn/blog/article/treeshaking)

:::warning sideEffect
前面说了半天 sideEffect 可以用来声明哪些模块没有副作用？那么这个副作用到底是什么？

比如最简单的，我们在一个 jsx 文件里面导入了一个 css 文件和一个 js 文件，如下

```jsx
import './index1.css' // demo 组件需要的 css 样式
import './index2.css' // demo 组件完全不需要的 css 样式
import { handleClick1, handleClick2 } from './utils'

const Demo = () => <div onClick={handleClick1}>点击</div>
```

安装 tree-shaking 消除无用代码的逻辑， handleClick2 在这个 js 文件中并没有被使用到，所以 `handleClick2 打包时会被移除`，但是对于 css 文件，webpack 就认为其有副作用，即 js 中没有明确使用到 css 文件（无论是不是我们真的需要的），所以在打包时会把`两个 css 文件都打包进去不会被移除`

但是如果我们明确知道这个 index2.css 是没有副作用即移除之后不会对 js 文件有其他影响的话，我们就可以通过 sideEffect 来移除这个文件,通过配置： 

> `sideEffect: ['index2.css']`

配置这个选项之后，webpack 在打包过程遇到这个 css 文件就知道他是无副作用的，就可以在打包阶段给移除掉，从而减少打包体积
:::

## 如何减小打包体积

- 组件库按需引入
- 组件路由懒加载
- 使用 cdn 代替
- 第三方包单独提取
    - splitChunks

```js
splitChunks:{
    cacheGroups:{
        vendors:{//node_modules里的代码
            test:/[\\/]node_modules[\\/]/,
            chunks: "initial",
            name:'vendors', //chunks name
            priority:10, //优先级
            enforce:true 
        }
    }
}
```

- 压缩打包后的js文件
    - uglifyjs-webpack-plugin （webpack 3 使用）
    - terser-webpack-plugin （webpack 4/5 推荐使用这个，5已结默认使用这个了）

```js
//这个配置和module，plugins是同级的
optimization:{
    minimizer:[
        new UglifyJsPlugin({//压缩js
            cache:true,
            parallel:true,
            sourceMap:true
        }),
    ]
},
```
```js
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
};
```

- 压缩css
    - 单独提取 css 为独立文件： mini-css-extract-plugin

```js
//在顶部引入
const MiniCssExtractPlugin=require('mini-css-extract-plugin');

//在plugins里添加
new MiniCssExtractPlugin({//提取css
    filename:'css/main.css'
}),
```
    - 压缩 css 代码体积：optimize-css-assets-webpack-plugin

```js
//这个配置和module，plugins是同级的
optimization:{
    minimizer:[
        new OptimizeCSSAssetsPlugin()//压缩css
    ]
},
```

## 如何提高打包、构建速度

- label-loader 开启缓存

```js
module.exports = {
	module:{
  	rules:[
      {
      	test:/\.js$/,
        // 开启缓存
        use:['babel-loader?cacheDirectory=true'],
        exclude:/node_modules/
      }
    ]
  }
}
```

- 减少文件搜索范围

```js
module.exports = {
	module:{
  	rules:[
      {
      	test:/\.js$/,
        use:['babel-loader?cacheDirectory=true'],
        // 只对src目录下的文件进行babel-loader转换
        include: path.resolve(__dirname, 'src')
      }
    ]
  }
}
```

## main、module、exports 入口的区别

- main： cjs 入口
- module： esm 入口


## webpack style-loader 和 css-loader 区别

- css-loader帮助我们解析css成为js对象
- style-loader可以从css-loader解析的对象中提取css样式挂载到页面当中

## webpack 怎么配置 ts 打包

