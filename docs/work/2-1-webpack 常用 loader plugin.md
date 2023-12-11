# webpack 常用的 loader 和 plugin

:::warning
待完善
:::

- [loader](https://www.webpackjs.com/loaders/)

## balel-loader

```js
{
    test: /\.js$/,
    loader: 'babel-loader',
    exclude: /node_modules/,
},
```

## html-loader

```js
{
    test: /\.html$/,
    loader: 'html-loader'
},
```

## file-loader

```js
{
    test: /\.(jpe?g|png|gif)$/i,
    loaders: [{
        loader: 'file-loader',
        options: {
            name: 'images/[name].[hash:7].[ext]'
        }
    }]
},
```

## url-loader

在文件(一般用于图片)大小（单位 byte）低于指定的限制时，可以返回一个 DataURL（提升网页性能）

```js
{
    test: /\.(woff|svg|eot|ttf)\??.*$/,
    loader: 'url-loader',
    options: {
        name: 'fonts/[name].[hash:7].[ext]'
    }
},
```

## css-loader

webpack 默认能不能处理 CSS 文件, 所以也需要借助 loader 将 CSS 文件转换为 webpack 能够处理的类型。

## style-loader

将 css 文件通过 css-loader 处理之后，将处理之后的内容插入到 HTML 的 HEAD 代码中。

## scss-loader

```js
{
    test: /\.(sass|scss)$/,
    loaders: ["style-loader", "css-loader", "sass-loader"]
},
```

## less-loader

```js
{
    test: /\.less$/,
    loaders: ["style-loader", "css-loader", "less-loader"]
},
```

## vue-loader

```js
{
    test: /\.vue$/,
    use: [
        {
            loader: 'vue-loader',
            options: {
                loaders: {
                    scss: 'style-loader!css-loader!sass-loader',
                    sass: 'style-loader!css-loader!sass-loader'
                }
            }
        },
    ]
},
```

---

- [webpack-plugin](https://www.webpackjs.com/plugins/)

## htmlWebpackPlugin

会在打包结束之后自动创建一个index.html, 并将打包好的JS自动引入到这个文件中

```js
new HtmlWebpackPlugin({
    template: "index.html",
    minify: {
        // 开启压缩
        collapseWhitespace: true
    }
    filename：'index.html'
})
```

## cleanWebpackPlugin 

在打包之前将我们指定的文件夹清空

```js
new CleanWebpackPlugin(
    ['dist'],　 //匹配删除的文件
    {　　
        // 根目录
        root: path.resolve(__dirname,'../'),   
        // 是否启用控制台输出信息  
        verbose: true, 
        //设置为false,启用删除文件                              
        dry: false,                                   
    }
), 
```

## miniCssExtractPlugin 

用于将打包的CSS内容提取到单独文件的插件


## copy-webpack-plugin


## terserWebpackPlugin

压缩js代码

## optimizeCssAssetsWebpackPlugin

压缩css代码

## webpackMerge



## splitChunksPlugin

## webpackBundleAnalyer


## webpackDevServer

