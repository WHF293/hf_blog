# 实现简单的 loader

## 实现简单的 markdown loader

目录结构

```shell
- src
    - index.js
- index.html
- webpack.config.js
- markdown-loader.js
```

安装 marked，这是用来将 markdown 预发转化成 html 的

loader 实际上就是一个函数，而 loader 是发生在 webpack 编译之前的，即

项目源文件 ---> loader1 ---> loader2 --> .... ---> loader n ---> webpack 可识别的 js / json 文件  ---> 编译 compltie

方式一：

所以编写一个 loader 的时候，这个 loader 的返回结果必须是一个 js 可识别的东西， 如下：


```js
// webpack.config.js
module.exports = {
    entry: './src/index.js',
    // ...
    module: {
        rules: {
            test: '/\.md$/',
            loader: [
                './markdown-loader.js'
            ]
        }
    }
}
```


```js
// markdown-loader.js
const marked = required('marked')
module.exports = source => {
    // 解析 markdown 为 html 语法格式的字符串
    const str = marked(source) 
    // 必须使用 JSON.stringify, 避免换行符等特殊符号被转义导致的异常
    const res = JSON.stringify(str)

    return `module.exports = {${res}}`
}
```

方式二：

markdown-loader 导出字符串，并交由其他 loader 进行进一步处理

```js
// webpack.config.js
module.exports = {
    entry: './src/index.js',
    // ...
    module: {
        rules: {
            test: '/\.md$/',
            loader: [
                'html-loader',
                './markdown-loader.js'
            ]
        }
    }
}
```


```js
// markdown-loader.js
const marked = required('marked')
module.exports = source => {
    // 解析 markdown 为 html 语法格式的字符串
    const str = marked(source) 
    // 必须使用 JSON.stringify, 避免换行符等特殊符号被转义导致的异常
    const res = JSON.stringify(str)

    return res
}
```