# css 专项

## 盒模型

- 标准盒

  - width = content 的宽度
  - height = content 的高度

- 怪异盒
  - width = content 的宽度 + padding + border
  - height = content 的高度 + padding + border

设置盒子

```css
.box {
  /* 标准盒 */
  box-sizing: content-box;
  /* 怪异盒 */
  box-sizing: border-box;
  /* 继承父节点盒子类型 */
  box-sizing: inherit;
}
```

## link 和 @import 区别

|         | 加载内容            | 加载时机                 |
| ------- | ------------------- | ------------------------ |
| link    | css 和其他 Rss 事务 | 在页面载入时同时加载     |
| @import | 只能加载 CSS        | 页面网页完全载入以后加载 |

使用

```html
<link rel="stylesheet" href="./demo.css" />
```

```css
@import './demo.css';
```

## css 权重

- 标签选择器、伪元素选择器：1
- 类选择器、伪类选择器、属性选择器：10
- id 选择器：100
- 内联样式：1000
- !important 声明的样式的优先级最高

> 如果优先级相同，则最后出现的样式生效

## 为什么有时候⽤ translate 来改变位置⽽不是定位？

translate 是 transform 属性的⼀个值。

`改变 transform 或 opacity 不会触发浏览器重新布局（reflow）或重绘（repaint），只会触发复合（compositions）, ⽽改变绝对定位会触发重新布局，进⽽触发重绘和复合。`

transform 使浏览器为元素创建⼀个 GPU 图层，但改变绝对定位会使⽤到 CPU。

因此 translate() 更⾼效，可以缩短平滑动画的绘制时间。

⽽ translate 改变位置时，元素依然会占据其原始空间，绝对定位就不会发⽣这种情况。

## z-index 属性在什么情况下会失效

- 父元素 relative
- 设置 z-index 的元素不是 relative、absolute、
- 元素设置了 z-index 有设置了 float

## 两栏布局的实现

### 使用浮动

```css
.outer {
  height: 100px;
}
.left {
  float: left;
  width: 200px;
  background: tomato;
}
.right {
  margin-left: 200px;
  width: auto;
  background: gold;
}
```

### 使用 flex

```css
.outer {
  display: flex;
  height: 100px;
}
.left {
  width: 200px;
  background: tomato;
}
.right {
  flex: 1;
  background: gold;
}
```

## 水平垂直居中的实现

### absolute-1

```css
.parent {
  position: relative;
}

.child {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
}
```

### absolute-2

```css
.parent {
  position: relative;
}

.child {
  position: absolute;
  top: 50%;
  left: 50%;
  margin-top: -50px; /* 自身 height 的一半 */
  margin-left: -50px; /* 自身 width 的一半 */
}
```

### absolute-3

```css
.parent {
  position: relative;
}
.child {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
```

### flex

```css
.parent {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

## flex

```
flex 属性
- flex-direction: row | row-reverse | column | column-reverse 主轴方向
- flex-wrap：nowrap | wrap | wrap-reverse  换行
- flex-flow： 是上面两个的简写
- justify-content: flex-start | flex-end | center | space-between | space-around 主轴上的对齐方式
- align-items:  flex-start | flex-end | center | baseline | stretc 交叉轴上的对齐方式
- align-content： 是上面两个的简写

flex
- flex-grow： 定义项目的放大比例，默认为0，即如果存在剩余空间，也不放大
- flex-shrink： 项目的缩小比例，默认为1，即如果空间不足，该项目将缩小
- flex-basis： 定义了在分配多余空间之前，项目占据的主轴空间（main size）。浏览器根据这个属性，计算主轴是否有多余空间。它的默认值为auto，即项目的本来大小
- order： 数值越小，排列越靠前，默认为0
```

## grid

```css
.grid-box {
  /* 栅格布局三行三列 */
  display: grid;
  /* 3 是多少行列 后面 100px 是列宽，行的设置同理 */
  grid-template-columns: repeat(3, 100px);
  grid-template-rows: repeat(3, 100px);
  /* 行列间距 */
  column-gap: 10px;
  row-gap: 10px;
}
```

[grid 栅格/网格布局学习笔记](https://blog.csdn.net/weixin_44832362/article/details/128064953)

## 如何清除浮动

> 浮动的定义： 非IE浏览器下，`容器不设高度且子元素浮动时，容器高度不能被内容撑开`。 此时，内容会溢出到容器外面而影响布局。这种现象被称为浮动（溢出）。

清除浮动方法

- 父元素设置 height
- 父元素设置 overflow hidden / scroll
- 最后一个浮动元素之后添加一个空的div标签，并添加clear:both样式


## BFC

BFC是一个独立的布局环境，可以理解为一个容器，在这个容器中按照一定规则进行物品摆放，并且不会影响其它环境中的物品。如果一个元素符合触发BFC的条件，则BFC中的元素布局不受外部影响。

块格式化上下文（Block Formatting Context，BFC）是Web页面的可视化CSS渲染的一部分，是布局过程中生成块级盒子的区域，也是浮动元素与其他元素的交互限定区域。

### 创建 BFC

- 根元素：body；
- 元素设置浮动：float 除 none 以外的值；
- 元素设置绝对定位：position (absolute、fixed)；
- display 值为：inline-block、table-cell、table-caption、flex等；
- overflow 值为：hidden、auto、scroll；

### BFC 作用

- 解决 margin 重叠
- 解决父元素高度塌陷

## 对 sticky 定位的理解
