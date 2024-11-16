# HXKlineChart 使用分享

2023.09.15

## 目录

- 前言
- 概念篇
- 实操篇
- 踩坑篇

## 前言

背景：k 线页面的日活（4000-5000）占账本 app 的 10% 左右，而进入 k 线页面的路径中有 60% 是从用户持仓页进入的，所以产品希望 k 线页能提供查看历史分时的功能，方便用户对自己过往的交易进行复盘。而原本老的 k 线组件只支持当日分时，不支持历史分时，所以才有这个需求。

新 k 线优势

- 新 k 线体积小
- 历史分时这个功能老版本不支持
- 高性能，类似虚拟列表，之渲染可视区域的数据

新老 k 线包对比

|              | 未压缩体积体积 | 压缩后体积 |
| ------------ | -------------- | ---------- |
| D3Chart      | --             | 715kb      |
| HXKlineChart | 721kb          | 88kb       |
| HXKline      | 442kb          | 50kb       |

HXKlineChart 跟进记录

- HXkline 0.1.1-beta.11 -> 0.1.1-beta.26 -> 0.1.2-beta.15
- HXklineChart 2.0.3-beta.4 → 2.0.3-beta.8

## 概念篇

### 架构设计

- [klinecharts](https://klinecharts.com/)
- [HXklineChart](https://khtest.10jqka.com.cn/kodexplorer/data/User/wangyifan/home/HXKlineChart/docs/)

![](https://cdn.nlark.com/yuque/0/2023/jpeg/2586551/1694675322658-9df3f81b-4bd5-4607-899a-fe5466e113ec.jpeg)

> 开发负责人： HXKline 穆 xx HXKlineChart 林 xx 数据源 朱 xx

HXklineChart 目录结构

> - @ths-m 0.1.2-beta.4 之后的版本
>   - HXKline
>     - lib
>       - HXKline.common.js
>       - HXKline.umd.js
>   - HXKlineChart
>     - dist
>       - plugin
>         - drawin.js
>         - indicator.js
>       - index.js
>       - index.d.ts

![](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/202403112353319.png)

### 数据获取方式

> - 今日分时：
>   - 00：00-08：30 http，获取昨天的分时数据
>   - 08：30-15：00 ws 实时推送，推送时机——每 3 秒推送一次或者发生交易立即推送
>   - 15：00-24：00 http
> - 历史分时：http 一次性请求 241 个数据点
> - k 线：init 时先通过 http 获取 300 个数据，后续如果滑倒后面的数据，触发 loadmore 再次加载 300 个数据点

### 覆盖物

覆盖物是由

[figures 基础图形](https://khtest.10jqka.com.cn/kodexplorer/data/User/wangyifan/home/HXKlineChart/docs/guide/figure.html)

组合生成的一种特殊图形，具备一定功能性，通过覆盖物模板来定义。

覆盖物： 一个或多个基础图形拼接而成的

如我们 k 线上面的 BS 点就是一个自定义的覆盖物

![](https://cdn.nlark.com/yuque/0/2023/jpeg/2586551/1694671108060-42de0daf-4a6c-4892-8e5a-2c165ca3908c.jpeg)

![](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/202411161523428.jpeg)

另外还有十字光标的标签等都是覆盖物


### 技术指标

技术指标诸如 MA、AVP、VOL 等...HXKlineChart 的内置指标和 Klinechart9.x 一模一样

![](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/202403112355914.png)


### 光标监听事件

- PC 鼠标的移动事件
- 移动端 touch 事件

### 网络

- 使用公司 wifi 访问，服务端是五常服务器
- 使用流量或者非公司 wifi 网络，访问的是华为云服务

理论上这两个服务器上的数据应该是一致的，但实际测试下来是不完全一致的特别是对于历史分时数据的获取，五常服务器这边返回最早的数据是 2021.01.04，在早的数据就无法获取，但是华为云服务器实测是 2016 年的历史分时数据都拿的到


## 实操篇

> 备注：目前接口不支持内外访问，所以现在如果要用到这个组件，需要到外网开发

### host 配置

```shell
# 外网电脑 host 修改

116.63.37.113 w-base-common.10jqka.com.cn
116.63.34.8 quota-h.10jqka.com.cn

# npm 源修改
npm set registry https://miniapp.10jqka.com.cn/npmserver/

# 然后安装文档安装 HXkline 即可
```

### 创建实例

先安装

```shell
npm i @ths-m/HXKline
npm i @ths-m/HXklineChart

# 备注 0.1.2-beta.4 之前只需要安装 HXkline
```

> 0.1.2-beta.4 之后 HXKlineChart 拆包成 HXKline + HXKlineChart，引用方式需要修改，但是文档并没有更新（截至到 2023.09.14 日，文档还是保持之前的写法）

#### 分时图

```javascript
import HXKline from '@ths-m/HXKline/lib/HXKline.common';
import HXKlineChart from '@ths-m/HXKlineChart'; // 拆包后需要额外引入

// 手动挂载一下，设置之后可以在 window 上看到 HXKlineChart 这个属性
HXKline.setHXKlineChart(HXKlineChart);

const config = { // 主要是用于接口设置和区分显示分时图还是k线图
  stockCode: `${stockCode}`,
  marketId: `${marketId}`, // 同花顺市场代码，不是小财神的市场代码
  chartType: 'trend', // 分时图
  timePeriod: 'min_1', // 分时默认仅支持min_1
  tradeDate: Date.now(), // 日期，时间戳格式
  key: Date.now(),
}

const options = { // 图的具体样式
  dateFormat: {
    XAxis: 'HH:mm',
    Crosshair: 'HH:mm',
  };
}
const kline = HXKline.init('hq_hxkline', config, options)
```

#### k 线图

```javascript
import HXKline from '@ths-m/HXKline/lib/HXKline.common';
import HXKlineChart from '@ths-m/HXKlineChart';

HXKline.setHXKlineChart(HXKlineChart);
const config = {
  stockCode: `${stockCode}`,
  marketId: `${marketId}`,
  chartType: 'kline', // k 线图
  timePeriod: 'day_1' // 'week_1' | 'month_1',
  key: Date.now(),
}

const options = {
  dateFormat: {
    XAxis: 'YYYY-MM-DD',
    Crosshair: 'YYYY-MM-DD HH:mm',
  };
}
const kline = HXKline.init('hq_hxkline', config, options)
```

### 布局设置

k 线的样式设置需要在实例化之后，调用实例的 [setStyles](https://khtest.10jqka.com.cn/kodexplorer/data/User/wangyifan/home/HXKlineChart/docs/guide/instance-api.html#setstyles-styles) 才能生效例如 k 线，如果不修改默认样式的话，那么它长这样

![](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/202403112356679.png)

#### 网格设置

- k 线图，水平网格四等分，垂直方向三等分
- 分时图，网格三等分，垂直方法五等分

[X 轴等分设置](https://khtest.10jqka.com.cn/kodexplorer/data/User/wangyifan/home/HXKlineChart/docs/guide/styles.html#xaxis-x-%E8%BD%B4)

```javascript
// x轴
const xAxis = {
  // ...
  splitNum: 2, // x 轴3等分，splitType 必须设置为 both_side 才生效
  splitType: 'both_side',
}

// y轴
const yAxis = {
  // .....
  splitNum: 4, // y轴4等分，splitType 必须设置为 both_side 才生效
  splitType: 'both_side',
}
```

#### 蜡烛图分时图颜色设置

[蜡烛图和分时图颜色设置](https://khtest.10jqka.com.cn/kodexplorer/data/User/wangyifan/home/HXKlineChart/docs/guide/styles.html#candle-%E8%9C%A1%E7%83%9B%E5%9B%BE)

```javascript
		bar: {
			upColor: '#FF4134',
			downColor: '#07AB4B',
			noChangeColor: '#888888',
			upBorderColor: '#FF4134',
			downBorderColor: '#07AB4B',
			noChangeBorderColor: '#888888',
			upWickColor: '#FF4134',
			downWickColor: '#07AB4B',
			noChangeWickColor: '#888888',
		},
```

### BS 点覆盖物创建

- 自定义覆盖物实现
- 注册自定义覆盖物
- 使用自定义覆盖物
- 更新自定义覆盖物样式
- 移除自定义覆盖物

我们以 BS 点覆盖物为例子

#### 自定义覆盖物实现

```javascript
export const BsTextUp = {
  name: 'BsTextUp',
  totalStep: 0,
  zLevel: 5,
  createPointFigures: (config) => {
    const { overlay, coordinates } = config
    const { text = '', isFs = false } = overlay.extendData ?? {}
    const startX = coordinates[0].x
    const startY = coordinates[0].y + (isFs ? 0 : five)

    return [
      {
        // 原型
        type: 'circle',
        attrs: {
          x: startX,
          y: startY,
          r: 2,
        },
        styles: {
          style: 'fill',
        },
        ignoreEvent: true,
      },
      {
        // 线
        type: 'line',
        attrs: {
          coordinates: [
            { x: startX, y: startY + 5 },
            { x: startX, y: startY },
          ],
        },
        styles: {
          color: '#999999',
          style: 'dashed',
        },
        ignoreEvent: true,
      },
      {
        // 多边形
        type: 'polygon',
        attrs: {
          coordinates: [
            { x: startX, y: startY + 5 },
            { x: startX - 2, y: startY + 9 },
            { x: startX + 2, y: startY + 9 },
          ],
        },
        ignoreEvent: true,
      },
      {
        // 矩形
        type: 'rect',
        attrs: {
          x: startX - 6,
          y: startY + 9,
          text: text ?? '',
          width: 12,
          height: 12,
        },
        styles: {
          style: 'fill',
          borderRadius: 2,
        },
        ignoreEvent: true,
      },
      {
        // 文字
        type: 'text',
        attrs: {
          size: 8,
          x: startX,
          y: startY + (isIos ? 22 : 20),
          text: text ?? '',
          color: '#fff',
          align: 'center',
          baseline: 'bottom',
          paddingBootom: 2,
        },
        ignoreEvent: true,
      },
    ]
  },
}
```

#### 注册自定义覆盖物

```javascript
import HXKline from '@ths-m/HXKline/lib/HXKline.common';
import HXKlineChart from '@ths-m/HXKlineChart';

1.先配置好 HXKlineChart
HXKline.setHXKlineChart(HXKlineChart);

2. 注册覆盖物
const registerCustomOverlay = () => {
	HXKlineChart?.registerOverlay(BsTextUp); // 注册 BS 点覆盖物
	...
};

registerCustomOverlay();

3. 覆盖物注册之后再去实例化
const kline = HXKline.init() //....
```

![](https://cdn.nlark.com/yuque/0/2023/jpeg/2586551/1694795243322-0499103a-fcb1-4fce-9598-009c58a145c6.jpeg)

#### 使用自定义覆盖物

```javascript
const klineInstance = kline?.getChart?.()

klineInstance?.createOverlay?.({
  name,
  // 用于区分同一类型的覆盖物，方便调用 removeOverlay 可以指定删除那个覆盖物
  id: timestamp,
  extendData: {
    text,
    isFs: _isFs,
  },
  points: [{ timestamp, value }],
  styles: {
    rect: {
      color: backgroundColor,
    },
    circle: {
      color: backgroundColor,
    },
    polygon: {
      color: backgroundColor,
    },
    text: {
      color: '#fff',
    },
  },
})
```

#### 更新覆盖物

```javascript
klineInstance?.overrideOverlay?.({
  id: value.timestamp,
  styles: {
    rect: {
      color: backgroundColor,
    },
    circle: {
      color: backgroundColor,
    },
    polygon: {
      color: backgroundColor,
    },
    text: {
      color: '#fff',
    },
  },
})
```

#### 移除自定义覆盖物

```javascript
klineInstance?.removeOverlay({
  name: 'BsTextUp',
})
```

### 技术指标使用

- VOL 使用
- 覆写 MA
- 覆写 AVP

技术指标的使用有几个点需要注意：

- 是否需要重写
- 是否需要自定义 paneId
- 覆写技术指标必须在创建之后调用

#### VOL 使用

```javascript
/**
 * @desc 创建 VOL 成交量
 * @param {Chart} klineInstance HXLineCHarts 实例
 * @param {string} paneId 主图 / 副图的 paneId
 */
export const createVol = (klineInstance, paneOptions, calcParams = []) => {
  // 1. 先创建
  klineInstance?.createIndicator?.('VOL', false, paneOptions)
  // 2. 覆写
  klineInstance?.overrideIndicator?.({
    name: 'VOL',
    calcParams,
  })
}
```

#### 覆写 MA

```javascript
const defaultMaCalcParams = [5, 10, 30] // NOSONAR
/**
 * @desc 创建 MA
 * @param {Chart} klineInstance HXLineCHarts 实例
 * @param {number[]} calcParams 计算参数
 * @param {string} paneId 主图 / 副图的 paneId
 */
export const createMa = (klineInstance, calcParams = defaultMaCalcParams, paneId = MAIN_CHART_ID) => {
  klineInstance?.createIndicator?.('MA', true, { id: paneId })
  // 更改 MA 技术指标必须在创建 MA 技术指标之后，否则设置无效
  klineInstance?.overrideIndicator?.(
    {
      name: 'MA',
      calcParams,
    },
    paneId,
  )
}
```

#### 覆写 AVP

```javascript
/**
 * @desc 创建 AVP 分时均线
 * @param {Chart} klineInstance HXLineCHarts 实例1
 * @param {string} paneId 主图 / 副图的 paneId
 */
export const createAvp = (klineInstance, paneId = MAIN_CHART_ID) => {
  klineInstance?.createIndicator?.('AVP', false, { id: paneId })
}

export const overrideAvp = (klineInstance) => {
  klineInstance?.overrideIndicator?.({
    name: 'AVP',
    calc: (dataList) => {
      let totalTurnover = 0
      let totalVolume = 0
      return dataList.map((kLineData) => {
        if (typeof kLineData.close === 'number' && !isNaN(kLineData.close)) {
          const avp = {}
          const turnover = kLineData?.turnover ?? 0
          const volume = kLineData?.volume ?? 0
          totalTurnover += turnover
          totalVolume += volume
          if (totalVolume !== 0) {
            avp.avp = totalTurnover / totalVolume
          }
          return avp
        }
      })
    },
  })
}
```

AVP 覆写前后对比

<div style="display:flex">
<img src="https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/202403112357331.png" width="45%" height="auto"/>
<img src="https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/202403112357925.png" width="45%" height="auto"/>
</div>


### 唤起分时弹窗实现

- 透明层实现
- 透明层位置获取

首先，HXklineChart 的光标标签本身时没有点击回调的，但是我们要的效果是点击标签会唤起历史分时所以目前的实现方案是盖一层透明层在光标标签上方，如图：（这里我给加了个颜色）

![](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/202403120001418.png)

那边点击光标标签后的一系列操作就变成了点击我们设置的透明层之后的操作，也就相当于变相支持了那剩下的问题就是怎么动态设置这个透明层的位置信息了 HXKlineChart 为了提供了光标移动的监听事件，所以我们可以从中获取到光标的 x 和 y，再给透明层加上贴边吸附的效果即可

```javascript
/**
 * @desc 监听十字光标移动事件
 * @param {Chart} klineInstance HXLineCHarts 实例
 * @param {CrosshairChangeCallback} callback 回调函数
 */
export const onCrosshairChange = (klineInstance, callback) => {
  klineInstance?.subscribeAction?.('onCrosshairChange', (event) => {
    console.log('..............watch...........', event)
    callback?.(klineInstance, event)
  })
}
```

具体设置

```javascript
/**
 * @desc 设置透明层滚动事件
 * @param {CrosshairChangeEvent} event
 */
const setTooltipPosition = (event) => {
  if (isFs()) {
    return
  }
  const { x = 0 } = event
  const dom = DOMS.crosshair_xAis_overlay()
  if (dom) {
    const width = dom.width()
    const two = 2
    let position_x = x - width / two

    const max_width = DOMS.modal_main().width()
    const max_position_X = max_width - width
    const min_position_x = 0

    position_x = position_x < min_position_x ? min_position_x : position_x
    position_x = position_x > max_position_X ? max_position_X : position_x

    dom.css('left', `${position_x}px`)
    dom.show()
  }
}
```

### BS 点位置优化

遮挡问题具体看下图

---

[手抄 BS 点位置优化方案](http://cf.myhexin.com/pages/viewpage.action?pageId=1028312215)

1. 针对日 k 上下 BS 点存在出界的问题
   1. 调用 HXKlineChart 提供的 api setPaneOptions 设置日 k 画布的上下留白区域为 50px（默认 10px）
   2. 修改覆盖物的线的长度，原本线的长度是 15px，改为 5px（需要重新调整整个 BS 点的样式布局）
2. 针对日 k 相邻 BS 点互相遮挡问题
   1. 修改为相邻 BS 点上下交错（目前已有逻辑）
3. 针对日 k 当日 BS 点被遮挡问题（在画布最右侧）
   1. 通过调用 api setLeftMinVisiableBarCount 设置画布右侧最小留白区域为一根柱子或两根柱子的宽度（具体看实现后的显示效果在确定）
4. 针对分时图集合竞价（09：25-09：30）期间的 BS 点显示问题
   1. 无论多个还是一个买卖记录，都在 09：30 这个分时点上显示一个【点】
   2. 如果 09：30 有买卖记录，那么集合竞价的 BS 点和原本 09：30 的 BS 点位置错开一点，能看出是两个【点】即可
5. 针对分时图存在多个 BS 点遮挡问题修改
   1. 为避免在左右边界 BS 点被遮挡，分时图最左边和最右边的 10 个点，如果有 BS 点，不显示 BS 文字，只显示一个【点】
   2. 分时图上只展示一个带文字的【B 点】和【S 点】，其余 BS 点均显示为 【点】
6. 针对分时图上下出界问题修改
   1. BS 点文字方向，小于昨收朝上，大于昨收朝下


<div style="display:flex">
<img src="https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/202403120002801.png" width="33%" height="auto"/>
<img src="https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/202403120003220.png" width="33%" height="auto"/>
<img src="https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/202403120004588.png" width="33%" height="auto"/>
</div>


### 数据获取

对于数据的获取目前总共有 3 中方式

- getDataList
- onLoadmoreData
- init 回调

#### getDataList

这个是最靠谱的数据获取方式，是实时获取的，无论 k 线还是分时，都可以使用这个 api

#### onLoadmoreData

这个 api 有点小坑，它只有一个参数，接受一个回调，回调的唯一参数就是格式化 http 请求返回的结果，但是对于今日分时，由于走的是 wesocket，所以在今日分时图上无法实时获取到最新的数据列表，只会回去到第一次的数据列表，后续 ws 发生推送数据的行为并不会触发

#### init 回调

回到我们创建实例的时候，如果我们给传了第四个参数（回调函数），那么这个回调函数没在每次非 http 数据请求导致的数据变更的时候执行，也就是说他是给今日分时使用的

![](https://cdn.nlark.com/yuque/0/2023/jpeg/2586551/1694796705042-a6897c83-a8f7-4d59-a4d4-a6dba189d6bd.jpeg)


## 踩坑篇

只列举部分问题，完整踩坑记录在这 [账本支持历史分时——HXKlineCharts 踩坑记录](http://cf.myhexin.com/pages/editpage.action?useDraft=true&spaceKey=zhanghu&draftId=1011537045&pageId=1011537018&&)，因为部分坑 / bug 在后面版本的升级中已经被修复了，所以就不再说了

### 实例销毁在重新创建报错

问题描述：进入 k 线 页面，默认实例化的是日 k，在切换为分时在切回来的时候就报错问题原因：HXKlinechart 内部维护了一个 Map，key 就是 init 时传入的 options 字符串化，value 就是创建出来的实例，用于缓存已经创建过的实例，用以提升性能但是在切换 k 线时，由于分时图类型变了，所以需要先销毁老的实例在创建新的分时图实例，但是在调用销毁实例的 api dispose 时， HXKlineChart 那边会有两个操作

- 把实例从挂载节点上移除
- 把 map 的 value 清空

问题就出在把 value 清空这一步，那边只是清空了 value，但是并没有把 key 移除，导致下次在切换到之前创建的实例的时候，由于传入的 options 在字符串化后在 map 中有相同的 key，所以 HXklineChart 并不会创建实例，而是取缓存，但是由于之前的实例已经被销毁了，所以这里返回的就是 null，从而导致报错问题修复：

- 早期版本：在 options 里面新增一个字段 key，value 为当前时间戳
- 后期版本已修复，没这个问题

---

### 市场代码转换

问题描述：HXKKline 那边 init 创建实例的时候，有两个必须要给他们的参数

> stockCode： 股票代码 marketId： 同花顺市场代码

但是账本这边的市场代码和同花顺的市场代码不一致在前端项目里面原本有封装了一个转换的方法，但是在测试阶段发现存在个别股票在转换之后的市场代码是错误的，导致页面白屏例如 688500 这个股票，我们这边转换之后的市场代码是 17，但是实际是 22


问题修复：我们这边提供一个接口用于转换市场代码 

[yapi 接口地址](http://yapi.myhexin.com/yapi/service/311467/interface/api/463908)

目前存在问题：

- 接口目前不支持批量查询
- 接口目前只能转换 A 股的市场代码，对港股不支持

---

### 断网切换白屏

问题描述：断网切换股票或者 kline 接口报错，由于那边没有做兜底处理，所以会导致 k 线页面白屏问题修复：在 kline 由于网络或其他组件自身原因导致报错时进行异常处理

- 针对实例化时的异常：使用 try...catch...进行捕获

```javascript
try {
  klineRef.current = HXKline.init('hq_hxkline', config, options, () => {
    getYAxis()
    if (isFs()) {
      const list = klineRef.current?.getChart?.()?.getDataList?.() || []
      loadMoreKlineDataCallback(list)
    }
  })
  // ...
} catch (err) {
  Toast.show('出现异常', Toast.SHORT, false)
  return
}
```

- 针对 kline 崩溃导致页面白屏，使用 errorBoudary 进行兜底处理

```javascript
// A 股 k 线
renderHxklinechart = () => {
  return (
    <ErrorBoundary>
      <KlineComponent
      // ...
      />
    </ErrorBoundary>
  )
}
```

处理前全白的，连返回按钮都没有，处理后效果：



<img src="https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/202403120006095.png" width="33%" height="auto"/>



### 光标联动

- 历史分时日期切换，日 k 光标联动
- 边界处理
- 今日分时光标位置限制

##### 分时时间切换日 k 光标联动

问题描述：十字光标出现，点击光标标签出现历史分时弹窗，点击分时弹窗切换时间，光标跟着移动实现：封装一个 map，数据格式类似这样

```json
{
  ...
	"20230709" : { ...., dataIndex: 100 },
  "20230710" : { ...., dataIndex: 101 },
  ...
}
```

```javascript
/**
 * @desc 十字光标跟随移动到指定位置
 * @param {Chart} klineInstance
 * @param {object} config
 * @param {string} config.paneId 主图 / 副图id
 * @param {number} config.dataIndex 数据下标， 决定垂直线额位置
 * @param {number} config.value 数据的值，决定水平线额位置
 */
export function changeCrosshairPosition(klineInstance, { paneId = MAIN_CHART_ID, dataIndex, value }) {
  const { x, y } = klineInstance?.convertToPixel?.(
    {
      dataIndex,
      value,
    },
    {
      paneId,
    },
  )
  klineInstance?.executeAction?.('onCrosshairChange', { x, y })
}
```

##### 边界处理

问题描述：分时弹窗出现的时候画布锁定不能滚动，但是分时时间切换到画布边界的时候，会出现光标过去了，但是画布没有滚动，导致光标看不见问题解决：添加左右边界判断，临时放开画布滚动锁定，将目标时间滚动到可视区域的左右边界，然后在锁定画布坑点：

- HXKlineChart 提供了两个滚动画布的 api scrollToDataIndex, scrollToTimestamp ,这两个 api 都是将指定点移动到画布左右侧，右侧边界的点无需特殊处理，但是对于左边界的点，我们需要滚动的点的位置应该是该点的位置+画布能显示的点的位置
- 新股处理

```javascript
const changeFsDateScrollCrosshair = (targetIndex, type, targetData) => {
  const klineInstance = getChart(klineRef)
  // isFullScreen 新股判断
  if (!klineInstance || !targetData || isFullScreen.current) {
    return
  }
  // 获取可视区域的数据（包含左右2个被隐藏的数据）
  const inViewDatas = klineInstance?.getVisibleDataList()
  if (!isFs()) {
    klineInstance?.setScrollEnabled(true)
  }
  // 判断是否需要解锁并滚动画布
  beforeUpdate(klineInstance, type, inViewDatas, targetIndex)
  // 移动光标
  updateAction(klineInstance, targetIndex, targetData)
}

const beforeUpdate = (klineInstance, type, inViewDatas, targetIndex) => {
  if (type === 'prev') {
    // 前一天
    const __index = 2,
      step = 3
    if (inViewDatas?.[__index].dataIndex > targetIndex && !isFullScreen.current) {
      const nextIndex = targetIndex + inViewDatas.length - step
      klineInstance?.scrollToDataIndex(nextIndex > 0 ? nextIndex : 0)
    }
  } else {
    // 后一天
    const step = 2
    const laseInViewIndex = inViewDatas[inViewDatas.length - 1]?.dataIndex
    if (targetIndex > laseInViewIndex - step) {
      const __index =
        laseInViewIndex + 1 > klineDataList.current.length ? klineDataList.current.length : laseInViewIndex + 1
      klineInstance?.scrollToDataIndex(__index)
    }
  }
}
```

##### 今日分时光标位置限制

问题描述：光标默认随时跟随手指位置的，但是我们这边要求分时图十字光标的点只能在分时线上，且不能划出最新的位置，如图所示：

<img src="https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/202403120007349.png" width="33%" height="auto"/>


问题解决：监听光标位置，动态修改光标位置

```javascript
/**
 * @desc 十字光标移动事件回调
 * @param {Chart} klineInstance
 * @param {CrosshairChangeEvent} event
 */
const crosshairChangeEvent = (klineInstance, event) => {
  if (!event || !klineInstance) {
    return
  }
  const { x, y } = event
  const isNeedResetCrosshair = updateFsCrosshair(klineInstance, event)
  // ...
}

const updateFsCrosshair = (klineInstance, event) => {
  // 光标显示，会有 x, y, 光标隐藏没有这两字段
  const { x, y, kLineData = {} } = event
  if (!isNumber(x) || !isNumber(y)) {
    return false
  }
  // 获取分时图最后一个点有真实数据的点
  const realKlineDataList = fsDataListRef.current.filter((item) => isNumber(item.close))
  const lastFsData = realKlineDataList?.[realKlineDataList.length - 1] || {}

  // 计算最后一个点的x轴坐标
  const { x: newX } = klineInstance?.convertToPixel?.(
    {
      dataIndex: lastFsData.dataIndex,
      value: lastFsData.close,
    },
    {
      paneId: MAIN_CHART_ID,
    },
  )
  // 计算当前位置所在点的y轴坐标
  const { close, timestamp } = kLineData
  const { y: newY } = klineInstance?.convertToPixel?.(
    {
      timestamp,
      value: close,
    },
    {
      paneId: MAIN_CHART_ID,
    },
  )
  // 设置光标位置
  if (y !== newY || newX < x) {
    const realX = Math.min(x, newX)
    klineInstance?.executeAction?.('onCrosshairChange', {
      x: realX,
      y: newY,
    })
    return true
  } else {
    return false
  }
}
```

---

### 机型兼容

- 目前只有大华为不支持

样式兼容主要指的是覆盖物样式，IOS、安卓、PC 上对于覆盖物的样式，如果采用一样的配置，会出现显示效果不一致的情况目前的解决方案是给 IOS 和 安卓传不同的样式配置如下图，传入相同的配置参数，ios 文字已经居中，但是安卓文字位置靠下

原因的话可以看【文心一言】的回答

![](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/202403120010813.png)


### app 前后台切换数据改变

问题描述：k 线十字光标定位到某个时间点，打开分时弹窗，此时表头数据显示光标所在日期的信息且锁定画布不让滑动，但是手机 app 前后台切换或者浏览器切换标签页，HXKline 在 k 线再次可见时回去自动刷一次数据，而刷数据的操作会把光标等已经显示出来的事件（物体、操作）给重置掉，导致分时图显示的时 xx 月 xx 天，但是表头显示的实时数据，光标也不见了，画布也变成可以滚动的，这个功能时 KlineChart 自带的，目的是为了避免长时间无操作导致的 k 线数据延迟在 0.1.2-beta.3 版本提供了新的 api 用于开启或关闭这个功能问题解决：

```javascript
klineRef.current = HXKline.init('hq_hxkline', config, options)
// 注意必须在组件实例化之后
klineRef.current?.setVisibilitychangeEnable?.(false)
```

> 备注：文档上没写

---

### reszie 导致 k 线显示异常

问题描述：0.1.2-beta.3 之后版本出现，点击折叠成交量副图会导致 k 线部分被挤压，如图所示：问题原因：0.1.2-beta3 之后新增了一个功能，resize ，也就是 k 线节点发生变化，就会重新绘制 k 线

<div style="display:flex">
<img src="https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/202403120010990.png" width="50%" height="auto"/>
<img src="https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/202403120011631.png" width="50%" height="auto"/>
</div>


问题修复：通前后台切换一样，hxklinechart 那边后面提供了新的 api 用于开启光标这个功能

```javascript
klineRef.current?.setResizeEnable?.(false)
```

> 备注：文档上没写

---

### 新股注意点

问题描述：新股（或者说 k 线为占满整个画布的股票），HXKlineChart 的默认设置是蜡烛图靠右贴住，并且默认画布是可滚动的，但我们这边的要求是新股靠左贴住，画布不允许滚动 HXKLineChart：不是通用设置，没有计划修改问题解决：

1. 判断是饭否占满一屏：获取股票全部数据和页面可视数据对比，数量一致，即认为是新股
2. 确定是新股之后，调用 setOffsetRightDistance 给画布右侧填充一个大于画布宽度的数值即可
   > 步骤二原因：HXKlineChart 原本有个 bug 就是可以划出最左侧的蜡烛图，后面版本修复给设置成不允许超过 k 线最左侧的蜡烛图位置，所以给他设置可以通过给他设置一个特别大的数值来解决这个问题

![image.png](https://cdn.nlark.com/yuque/0/2023/png/2586551/1694758560634-57223cef-d283-4a00-b36e-49a256bc8c9f.png#averageHue=%23f6f5f4&clientId=u248cfc3e-4535-4&from=paste&height=709&id=ud74ef006&originHeight=2400&originWidth=1080&originalType=binary&ratio=1&rotation=0&showTitle=false&size=560290&status=done&style=none&taskId=u58f65b73-9f15-4708-8bcb-79b5439fd04&title=&width=319)

```javascript
const setKlineInView = () => {
  if (!isFs()) {
    const klineInstance = getChart(klineRef)
    if (!klineInstance) {
      return
    }

    klineInstance?.setScrollEnabled(true)
    const inViewDatasLen = klineInstance?.getVisibleDataList()?.length || 0
    const allDatasLen = klineInstance?.getDataList()?.length || 0
    if (inViewDatasLen === 0 || allDatasLen === 0) {
      return
    }
    // 未满一屏, 移动到最左侧并且禁止滚动
    if (inViewDatasLen === allDatasLen) {
      klineInstance?.setOffsetRightDistance?.(10000)
      klineInstance?.setScrollEnabled(false)
    }
    isFullScreen.current = inViewDatasLen === allDatasLen
  }
}
```
