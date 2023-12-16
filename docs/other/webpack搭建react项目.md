---
title: cra 搭建 react 项目
desc: 主要介绍了怎么使用 create-react-app 怎么搭建 react 项目
---

## 使用 cra 创建 ts 项目

- [create-react-app](https://create-react-app.bootcss.com/docs/getting-started)

```
npx create-react-app project-name --template typescript
```

运行 `pnpm start` 可以在 `localhost:3000` 查看

## 安装 craco 管理 项目

- [@craco/craco](https://www.npmjs.com/package/@craco/craco)

```
pnpm add @craco/craco
```

修改 `package.json`

```json
{
  // 更改前。。。。。。
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  // 更改后。。。。。
  "scripts": {
    "start": "craco start",
    "build": "craco build",
    "test": "craco test",
    "eject": "react-scripts eject"
  }
}
```

创建 `craco.config.js`

```js
// craco.config.js
module.exports = {}
```

## 安装 react-router-dom

[react-router-dom v6]()

新增一下文件

- `src/utils/lazyLoadComp.tsx`
- `src/router/index.tsx`
- `src/router/Redirect.tsx`

```ts
// src/utils/lazyLoadComp
import { Suspense } from 'react'

const lazyLoadComp = (children: JSX.Element, loading: JSX.Element = <div>loading</div>) => {
  return <Suspense fallback={loading}>{children}</Suspense>
}

export default lazyLoadComp
```

```ts
// src/router/Redirect
import { useEffect } from 'react'
import { useNavigate, To } from 'react-router-dom'

interface RedirectProps {
  to: To
}

function Redirect(props: RedirectProps) {
  const navigate = useNavigate()
  useEffect(() => {
    navigate(props.to)
  })
  return null
}

export default Redirect
```

```ts
// src/router/index.tsx
// 别名配置在后面
import { lazy } from 'react'
import { RouteObject } from 'react-router-dom'
import lazyLoadComp from '@/utils/lazyLoadComp'

import Redirect from './Redirect'
import AppLayout from '@/layout/AppLayout'

const LoginPage = lazy(() => import('@/layout/LoginPage'))
const NotFound = lazy(() => import('@/pages/NotFound'))
const DocsLayout = lazy(() => import('@/layout/DocsLayout'))

const HomePage = lazy(() => import('@/pages/HomePage'))
const TaskList = lazy(() => import('@/pages/TaskList'))
const TaskDetailPage = lazy(() => import('@/pages/TaskDetailPage'))

const DocsList = lazy(() => import('@/pages/DocsList'))
const DocsDetail = lazy(() => import('@/pages/DocsDetail'))

const MemberManage = lazy(() => import('@/pages/MemberManage'))

const routes = [
  { path: '/', element: <Redirect to="/index" /> },
  { path: '/login', element: <LoginPage /> },
  {
    path: '/index',
    element: <AppLayout />,
    children: [
      { index: true, element: lazyLoadComp(<HomePage />) },
      { path: 'taskList', element: lazyLoadComp(<TaskList />) },
      { path: 'taskDetail/:id', element: lazyLoadComp(<TaskDetailPage />) },
      {
        path: 'docs',
        element: lazyLoadComp(<DocsLayout />),
        children: [
          { index: true, element: lazyLoadComp(<DocsList />) },
          { path: 'docsDetail/:id', element: lazyLoadComp(<DocsDetail />) },
        ],
      },
      { path: 'memberManage', element: lazyLoadComp(<MemberManage />) },
    ],
  },
  { path: '*', element: <NotFound /> },
] as RouteObject[]

export default routes
```

准备工作做好了，开始使用

```tsx
// src/App.tsx
import { ConfigProvider } from 'antd'
import { useRoutes } from 'react-router-dom'
import routes from './router/routes'
import zhCN from 'antd/es/locale/zh_CN' // antd 后面配置

function App() {
  return <ConfigProvider locale={zhCN}>{useRoutes(routes)}</ConfigProvider>
}

export default App
```

```tsx
// src/index.tsx
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import 'dayjs/locale/zh-cn'
import './virtual:windi.css'
import '@icon-park/react/styles/index.css'
import reportWebVitals from './reportWebVitals'

const app = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
app.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)

reportWebVitals()
```

## 配置路由权限

## 配置 mobx 状态管理

- [mobx](https://www.mobxjs.com/)
- [mobx-react-lite](https://www.npmjs.com/package/mobx-react-lite)

```
pnpm add mobx mobx-react-lite
```

## 配置跨域、别名、打包结果

```js
const path = require('path')

module.exports = {
  devServer: {
    // 设置代理
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '',
        },
      },
    },
    // 设置端口
    port: 9527,
  },
  webpack: {
    // 设置别名
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    // 修改打包后的文件夹名， 默认为 build ， 改为 dist
    configure: (webpackConfig, { env, paths }) => {
      paths.appBuild = 'dist'
      webpackConfig.output = {
        ...webpackConfig.output,
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
      }
      return webpackConfig
    },
  },
}
```

修改 `tsConfig.json`

```json
// tsconfig.json
{
  // ......
  "compilerOptions": {
    // .....
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "extends": "./tsconfig.extend.json"
}
```

```json
// tsconfig.extend.json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

## 安装 @icon-park/react、windicss

- [iconPark](https://iconpark.oceanengine.com/official)
- [windiCss](https://cn.windicss.org/)
- [windicss-webpack-plugin](https://www.npmjs.com/package/windicss-webpack-plugin)

```
pnpm add @icon-park/react windicss
pnpm add windicss-webpack-plugin -D

```

```js
// craco.config.js
const WindiCSSWebpackPlugin = require('windicss-webpack-plugin')
const path = require('path')

module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '',
        },
      },
    },
    port: 9527,
  },
  webpack: {
    plugins: {
      add: [
        // 新增 windicss 插件
        new WindiCSSWebpackPlugin({
          virtualModulePath: 'src',
        }),
      ],
    },
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    configure: (webpackConfig, { env, paths }) => {
      paths.appBuild = 'dist'
      webpackConfig.output = {
        ...webpackConfig.output,
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
      }
      return webpackConfig
    },
  },
}
```

新建 `windi.config.ts`

```ts
import { defineConfig } from 'windicss/helpers'

export default defineConfig({
  preflight: false,
  extract: {
    include: ['**/*.{jsx,tsx,css}'],
    exclude: ['node_modules', '.git', '.dist', 'public'],
  },
})
```

添加 windicss 和 @icon-park/react 的基础样式

```ts
// src/index.ts
import './virtual:windi.css'
import '@icon-park/react/styles/index.css'
```

## 安装 less 和 antd

- [less](https://less.bootcss.com/)
- [craco-less](https://www.npmjs.com/package/craco-less)

```
pnpm add less less-loader craco-less -D
pnpm add antd
```

修改 `craco.config.js`

```js
// craco.config.js
const WindiCSSWebpackPlugin = require('windicss-webpack-plugin')
const CracoLessPlugin = require('craco-less')
const path = require('path')

module.exports = {
  devServer: {
    // .....
  },
  webpack: {
    // ....
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          // antd 自定义主题
          lessOptions: {
            modifyVars: {
              '@primary-color': '#7c3aed',
            },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
  babel: {
    plugins: [
      // antd 按需引入
      [
        'import',
        {
          libraryName: 'antd',
          libraryDirectory: 'es',
          style: true, // true 导入 less， false / css 导入 css
        },
      ],
    ],
  },
}
```

antd 配置中文语言包

```ts
// src/App.tsx
import { ConfigProvider } from 'antd'
import { useRoutes } from 'react-router-dom'
import zhCN from 'antd/es/locale/zh_CN'

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <div>app</div>
    </ConfigProvider>
  )
}

export default App
```

## antd dayjs 替换 moment

- [antd]()
- [dayjs](https://dayjs.fenxianglu.cn/)

```
pnpm add dayjs
pnpm add antd-dayjs-webpack-plugin -D
```

修改 `src/index.tsx`

```ts
// src/index.tsx
import 'dayjs/locale/zh-cn'
```

修改 `craco.config.js`

```js
// craco.config.js
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin')

module.exports = {
  devServer: {
    // .....
  },
  webpack: {
    plugins: {
      add: [
        new WindiCSSWebpackPlugin({
          virtualModulePath: 'src',
        }),
        new AntdDayjsWebpackPlugin(),
      ],
    },
  },
  plugins: [
    // ......
  ],
  babel: {
    // ......
  },
}
```

## 安装开发环境工具

[webpackbar](https://www.npmjs.com/package/webpackbar)

```
pnpm add webpackbar -D
```

修改 `craco.config.js`

```js
// craco.config.js
const WebpackBar = require('webpackbar')

module.exports = {
  devServer: {
    // .....
  },
  webpack: {
    plugins: {
      add: [
        new WindiCSSWebpackPlugin({
          virtualModulePath: 'src',
        }),
        new AntdDayjsWebpackPlugin(),
        new WebpackBar({
          color: '#85d', // 默认green，进度条颜色支持HEX
          basic: false, // 默认true，启用一个简单的日志报告器
          profile: false, // 默认false，启用探查器。
        }),
      ],
    },
  },
  plugins: [
    // ......
  ],
  babel: {
    // ......
  },
}
```

## 安装 axios、nprogress、qs

- [axios](https://www.axios-http.cn/)
- [nprogress](https://www.npmjs.com/package/nprogress)
- [qs](https://www.npmjs.com/package/qs)

```
pnpm add axios nprogress qs
pnpm add @types/qs @types/nprogress -D
```

```ts
// src/utils/helper.ts
/**
 * @desc 获取 token
 * @returns string | null
 */
export const getToken = () => localStorage.getItem('token') || null

/**
 * @desc await-to-js
 * @param func Promise
 * @param error 自定义错误提示
 * @returns [err, res]
 */
export const to = <T, U = Error>(func: Promise<T>, error?: U): Promise<[null, T] | [U, null]> => {
  return func.then<[null, T]>((res: T) => [null, res]).catch<[U, null]>((err: U) => [error || err, null])
}

/**
 * @desc 获取随机 Id
 * @returns string 时间戳 + 16进制随机数
 */
export const getRandomId = (): string =>
  Date.now().toString() + Number((Math.random() * 10000 * 10000 * 10000 * 10000).toFixed()).toString(16)

/**
 * @desc 校验是不是 FormData
 * @param data 任意数据
 * @returns boolean
 */
export const isFormData = (data: any) => Object.prototype.toString.call(data) === '[Object FormData]'
```

```ts
// src/utils/http.ts
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'
import Qs from 'qs'
import { getRandomId, isFormData } from '@/utils/helper'
import showHttpStatusMessage from './showHttpStatusMessage'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

const instance = axios.create({
  timeout: 30 * 1000,
  baseURL: '/api',
})

let httpNum = 0

const addHttp = () => {
  if (httpNum === 0) {
    NProgress.start()
  }
  httpNum++
}

const finishHttp = () => {
  httpNum--
  if (httpNum <= 0) {
    NProgress.done()
  }
}

// instance request 拦截器
instance.interceptors.request.use(
  (config: AxiosRequestConfig<any>) => {
    addHttp()
    if (config.url) {
      const reqId = getRandomId()
      config.url = config.url.includes('?') ? `${config.url}&reqId=${reqId}` : `${config.url}?reqId=${reqId}`
    }
    const token = localStorage.getItem('token') || ''
    if (token) {
      config.headers!.Authorization = 'Bearer ' + token
    }
    // 除入参是 fromData 之外的 post 请求，请求参数都需要序列化
    if (config.method === 'post' && !isFormData(config.data)) {
      config.data = Qs.stringify(config.data)
    }
    return config
  },
  (err) => {
    return Promise.reject(err)
  },
)

// instance response 拦截器
instance.interceptors.response.use(
  (res: AxiosResponse<any, any>) => {
    finishHttp()
    const status = res.status
    if (status >= 300 || status <= 200) {
      showHttpStatusMessage(status)
    }
    return res.data
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default instance
```

```ts
// src/utils/showHttpStatusMessage.ts
import { message } from 'antd'

const showHttpStatusMessage = (status: number) => {
  switch (status) {
    case 403:
      message.error('登录时间已到期，请重新登录')
      localStorage.removeItem('token')
      break
    case 404:
      message.error('请求资源不存在')
      break
    case 500:
    case 501:
    case 503:
      message.error('请求资源不存在')
      break
    default:
      message.error('出现异常，请联系管理员处理')
      break
  }
}

export default showHttpStatusMessage
```

## 安装 ahooks、lodash-es、crypto-js

- [ahooks](https://ahooks.js.org/zh-CN/guide/)
- [lodash](https://www.lodashjs.com/)
- [crypto-js](https://www.npmjs.com/package/crypto-js)

```
pnpm add ahooks lodash-es crypto-js
pnpm add @typs/lodash-es @types/crypto-js -D
```

```ts
// src/utils/crypto.ts
import CryptoJS from 'crypto-js' // 准备跟换为 cryptojs

export interface CryptoType {
  encrypt: (word: string) => string
  decrypt: (word: string) => string
  md5: (word: string) => string
  base64: (word: string) => string
}

/**
 * @desc aes 加解密
 */
class Crypto implements CryptoType {
  private key: CryptoJS.lib.WordArray
  private iv: CryptoJS.lib.WordArray
  constructor() {
    this.key = CryptoJS.enc.Utf8.parse('1234567890abcdef') // 16位16进制数作为密钥
    this.iv = CryptoJS.enc.Utf8.parse('qazxsw1234567890') // 16位16进制数作为密钥偏移量
  }

  /**
   * @desc AES 加密
   * @param word 要加密的数据
   */
  public encrypt = (word: string) => {
    const utf8Str = CryptoJS.enc.Utf8.parse(word)
    const encrypted = CryptoJS.AES.encrypt(utf8Str, this.key, {
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    })
    const result = encrypted.ciphertext.toString().toUpperCase()
    return result
  }

  /**
   * @desc AES 解密
   * @param word 要解密的数据
   */
  public decrypt = (word: string) => {
    const encryptedHexStr = CryptoJS.enc.Hex.parse(word)
    const base64Str = CryptoJS.enc.Base64.stringify(encryptedHexStr)
    const decrypt = CryptoJS.AES.decrypt(base64Str, this.key, {
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    })
    const decryptStr = decrypt.toString(CryptoJS.enc.Utf8).toString()
    return decryptStr
  }

  /**
   * @desc md5 加密(不可逆)
   * @param word 要加密的数据
   */
  public md5 = (word: string) => {
    return CryptoJS.MD5(word).toString()
  }

  /**
   * @desc base64 加密
   * @param word 要加密的数据
   */
  public base64 = (word: string) => {
    const utf8Str = CryptoJS.enc.Utf8.parse(word)
    return CryptoJS.enc.Base64.stringify(utf8Str)
  }
}

const crypto = new Crypto()
export default crypto
```

## 配置 prettier

## 配置微前端
