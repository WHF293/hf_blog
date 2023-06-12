# pnpm yarn npm 区别

## npm1.x 和 npm2.x

会出现依赖里面又有依赖，如下：

```
- node_modules
    - express
        - node_modules
            - 依赖包A
            - 依赖包B
        - libs
    - lodash
        - libs
        - node_modules
            - 依赖包A
            - 依赖包B
```

这样，当出现多个依赖使用到相同的依赖包的，会出现重复安装同一个依赖包的情况

## yarn 和 npm3.x

将依赖平铺, 假设项目依赖了 A包 和 B包， 而 A、B 两个包都依赖了 lodash（相同版本），
那么 yarn 会把 lodash 平铺出来和 A、B 同级别

```
- node_modules
    - A
    - B
    - lodash
```

那如果 A、B 都依赖了 lodash，但是这两个包依赖的 lodash 版本不一致会怎么样

```
- node_modules
    - A
    - B
        - lodash@xx.xx.b
    - lodash@xx.xx.a
```

但是这种方式就会造成 `幽灵依赖`，即我项目里实际上没有安装 lodash，但是因为 yarn / npm3 把依赖给平铺了，所以我们在项目里是可以正常使用 lodash 提供的能力的。

假若我们使用了 lodash 提供的能力并应用在我们的项目中，那如果某一天 A、B 包都都移除了 lodash 作为他们的依赖，但是我们项目中有使用了 lodash，这个时候就会出现异常

而 pnpm 的出现就是为了解决上面说到的这两个问题的 - `重复安装相同的依赖包` 和 `幽灵依赖`

## pnpm

- [pnpm 中文网](https://www.pnpm.cn/)

pnpm 的实现思路是这样的，当你安装依赖的时候，它会帮你将依赖安装到电脑全局去，然后使用依赖包的时候通过软链 link 链接到依赖去

pnpm 官方配图

![](https://www.pnpm.cn/assets/images/node-modules-structure-8ab301ddaed3b7530858b233f5b3be57.jpg)

即 pnpm 只会在全局保存一份，当其他依赖包用到以保存的依赖包时，通过软连接找到之前保存的依赖包就行了

这样就可以极大的节约磁盘内存又避免了幽灵依赖的问题

## pnpm 局限

- [pnpm 官网 - pnpm 的局限](https://pnpm.io/zh/limitations)

npm-shrinkwrap.json 和 package-lock.json 被忽略