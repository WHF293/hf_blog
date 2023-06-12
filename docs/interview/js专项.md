# js 专项

## typeof null 结果是什么？为什么？

js 的数据类型是根据 3 个字节判断的，

```
000: object   - 当前存储的数据指向一个对象。
001: int      - 当前存储的数据是一个 31 位的有符号整数。
010: double   - 当前存储的数据指向一个双精度的浮点数。
100: string   - 当前存储的数据指向一个字符串。
110: boolean  - 当前存储的数据是布尔值。
```

而 null 值是机器码 NULL 指针，它的值也是 000，所以 typeof 是就是 object

## 浅拷贝和深拷贝的实现

- 浅拷贝
  - Object.assign
  - [...arr]
  - concat 拷贝数组
- 深拷贝
  - JSON,parse(JSON.Stringify(data))
  - 手写深拷贝

```js
function cloneDeep(obj, map = new WeakAMap()) {
  if (obj === null) return obj
  if (obj instanceof Date) return new Date(obj)
  if (obj instanceof RegExg) return new RegExg(obj)
  if (typeof obj !== 'object') return obj
  if (map.has(obj)) return map.get(obj)

  const cloneObj = new obj.constructor()
  map.set(obj, cloneObj)
  Reflect.ownKeys(obj).forEach((key) => {
    cloneObj[key] = cloneDeep(obj[key], map)
  })
  return cloneObj
}
```

## js 的 this 指向

- 函数直接调用时，this 指向 window
- 函数作为对象的方法指向时，this 指向这个对象
- 函数使用 new 调用时（作为构造函数）,this 指向新创建出来的对象
- 使用 call、apply、bind 可以改变 this 指向

## object.is 和 === 区别

object.is 内部和 === 的判断逻辑一致，只是有两个判断不一样

|            | object.is | ===    |
| ---------- | --------- | ------ |
| +0 和 -0   | 不相等    | 相等   |
| NaN 和 NaN | 相等      | 不相等 |

## for in 和 for of 区别

for…of 遍历获取的是对象的键值，for…in 获取的是对象的键名；

|               | for of           | for in                                     |
| ------------- | ---------------- | ------------------------------------------ |
| 遍历 obj 取值 | value            | key                                        |
| 遍历范围      | 遍历当前对象属性 | 遍历当前对象整个原型链上的属性（性能较差） |

```js
for (let key in obj) {
}

for (let value of obj) {
}
```

## 执行上下文

### js 执行上下文分类

- 全局执行上下文：它是为运行代码主体而创建的执行上下文，也就是说它是为那些存在于函数之外的任何代码而创建的。
- 函数执行上下文：每个函数会在执行的时候创建自己的执行上下文。
- Eval 函数执行上下文：使用 eval() 函数也会创建一个新的执行上下文。

### 执行上下文创建过程

- 确定 this，即我们所熟知的 this 绑定。
- 创建 词法环境（LexicalEnvironment） 组件。
- 创建 变量环境组件（VariableEnvironment） 组件。

### 执行上下文管理(执行栈)

![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ec15c6656d844805a498a7070d57803f~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)

## with 