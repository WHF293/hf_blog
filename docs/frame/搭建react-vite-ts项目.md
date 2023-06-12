---
title: 搭建 React18 + Vite3 项目
desc: 主要介绍了如何从零搭建一个 React 项目
---

# 使用 vite 快速创建

1. 快速创建

    ```
    pnpm create vite --template react-ts
    ```

2. 安装依赖

    ```
    pnpm i

    pnpm add react-router-dom mobx mobx-react-lite ahooks @arco-design/web-react

    pnpm add lodash-es @types/lodash-es axios qs @types/qs @types/node @icon-park/react vite-plugin-windicss windicss less @arco-plugins/vite-react nprogress @types/nprogress -D
    ```

    安装后的 `packages.json`

    ```json
    {
        "name": "vite-project",
        "private": true,
        "version": "0.0.0",
        "type": "module",
        "scripts": {
            "dev": "vite",
            "build": "tsc && vite build",
            "preview": "vite preview"
        },
        "dependencies": {
            "@arco-design/web-react": "^2.40.0",
            "ahooks": "^3.7.1",
            "mobx": "^6.6.2",
            "mobx-react-lite": "^3.4.0",
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "react-router-dom": "^6.4.1"
        },
        "devDependencies": {
            "@arco-plugins/vite-react": "^1.3.1",
            "@icon-park/react": "^1.4.2",
            "@types/lodash-es": "^4.17.6",
            "@types/node": "^18.7.18",
            "@types/nprogress": "^0.2.0",
            "@types/qs": "^6.9.7",
            "@types/react": "^18.0.17",
            "@types/react-dom": "^18.0.6",
            "@vitejs/plugin-react": "^2.1.0",
            "axios": "^0.27.2",
            "less": "^4.1.3",
            "lodash-es": "^4.17.21",
            "nprogress": "^0.2.0",
            "qs": "^6.11.0",
            "typescript": "^4.6.4",
            "vite": "^3.1.0",
            "vite-plugin-windicss": "^1.8.8",
            "windicss": "^3.5.6"
        }
    }
    ```

# 初始化

## 修改目录

```shell
packages.json
index.html
tsconfig.json
tsconfig.node.json
vite.config.ts     // 项目配置
.gitignore         // git 忽略文件
.env               // 环境变量
public             // 静态文件
src
	assets         // 静态文件
	layouts        // 布局文件
	pages          // 页面文件
	service        // 接口服务文件
	utils          // 工具文件
	router         // 路由文件
	store          // 全局状态文件
	App.tsx        // 项目跟组件
   	main.tsx       // 项目入口文件
   	vite-env.d.ts  // 全局的类型声明文件
```

## 配置别名和代理

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            // 注意这里配置的别名需要再 tsconfig 的 paths 属性下声明
            "@": resolve(__dirname, "src"),
        },
        // 导入时可以省略的扩展名列表
        extensions: ["mjs", ".js", "ts", "jsx", "tsx"],
    },
    server: {
        port: 3033,
        proxy: {
            "/api": {
                changeOrigin: true,
                target: "https://www.xxxx.com",
                rewrite: (url) => url.replace("/api", ""),
            },
        },
    },
});
```

```json
// tsconfig.json
{
    "compilerOptions": {
        // .....
        "paths": {
            "@/*": ["./src/*"]
        }
    }
}
```

## WindiCss

具体配置：[windicss-vite](https://cn.windicss.org/integrations/vite.html)

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import WindiCss from "vite-plugin-windicss";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        WindiCss(), // 添加 windicss 插件
    ],
});
```

```ts
// main.ts
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "virtual:windi.css"; // 添加 windicss

const app = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
app.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
```

使用

```tsx
const demo = () => <div className="mr-4">demo</div>;
```

## IconPark

```tsx
// main.ts
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "virtual:windi.css"; // 添加 windicss
import "@icon-park/react/styles/index.css"; // 添加 iconpark 样式

const app = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
app.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
```

使用

```tsx
import { CheckOne } from "@icon-park/react";
// iconpark 可以直接复制出对应的 react 代码
const demo = () => <CheckOne theme="filled" size="32" fill="#666"></CheckOne>;
```

## Arco 组件库

具体配置：

[@arco-plugins/vite-react](https://github.com/arco-design/arco-plugins/blob/main/packages/plugin-vite-react/README.zh-CN.md)

[acro.design](https://arco.design/react/docs/start)

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import WindiCss from "vite-plugin-windicss";
import vitePluginForArco from "@arco-plugins/vite-react";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        WindiCss(),
        vitePluginForArco({
            style: true, // 动态导入组件样式 less
        }),
    ],
});
```

使用

```tsx
import { Button } from "@arco-design/web-react";
const demo = () => <Button type="primary">我是按钮</Button>;
```

## 路由

## 全局状态

具体使用：

[Mobx6 集成 React 和 Typescript 实践应用](https://juejin.cn/post/7107976218900693000)

【注意】： mobx-react-lite 只支持函数组件

### 定义 store

```ts
// store/user.ts
import { action, computed, makeAutoObservable, makeObservable, observable } from "mobx";

export interface UserStoreType {
    name: string;
    age: number;
    doubleAge: number;
    editName: (name: string) => void;
}

class UserStore implements UserStoreType {
    name: string = "";
    age: number = 0;
    constructor() {
        // makeObservable需要手动注解
        makeObservable(this, {
            name: observable,
            age: observable,
            doubleAge: computed,
            editName: action,
        });
    }

    get doubleAge(): number {
        return this.age * 2;
    }

    editName = (name: string) => {
        this.name = name;
    };
}

export { UserStore };
```

```ts
// store/index.ts
import { createContext } from "react";
import { UserStore, UserStoreType } from "./user";

export type { UserStoreType };

export const stores = {
    userStore: new UserStore(),
};

export const useStore = useContext(createContext(stores));
```

### 使用 store

```tsx
// demo.tsx
import { store } from "./store";
import { observer } from "mobx-react-lite";

const demo = () => <div>{store.userStore.name}</div>;

// 重点
export default observer(demo);
```

## Axios

```ts
// utils/http.ts
import axios from "axios";
import Qs from "qs";
import { isFormData, getRandomId } from "@/utils/helper";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

const http = axios.create({
    timeout: 30 * 1000,
    baseURL: "/api",
});

let httpNum = 0;

const addHttp = () => {
    if (httpNum === 0) {
        NProgress.start();
    }
    httpNum++;
};

const finishHttp = () => {
    httpNum--;
    if (httpNum <= 0) {
        NProgress.done();
    }
};

// http request 拦截器
http.interceptors.request.use(
    (config) => {
        addHttp();
        // 添加请求 id
        if (config.url) {
            const reqId = getReqId();
            config.url = config.url.includes("?") ? `${config.url}&reqId=${reqId}` : `${config.url}?reqId=${reqId}`;
        }
        // 添加 token
        const token = localStorage.getItem("token") || "";
        if (token) {
            config.headers!.Authorization = token;
        }
        // post 请求格式化入参
        if (config.method === "post" && !isFormData(config.data)) {
            // 上传文件不能使用 QS 去格式化
            config.data = Qs.stringify(config.data);
        }
        return config;
    },
    (err) => {
        return Promise.reject(err);
    }
);

// http response 拦截器
http.interceptors.response.use(
    (res) => {
        finishHttp();
        if (res.data.errno === 999) {
            console.log("token过期");
        }
        return res;
    },
    (error) => {
        return Promise.reject(error);
    }
);
export default http;
```

## Utils

```ts
// utils.helper.ts

// await-to-js
export const to = <T, U = Error>(func: Promise<T>, error?: U): Promise<[null, T] | [U, null]> => func.then<[null, T]>((res: T) => [null, res]).catch<[U, null]>((err: U) => [err, null]);

// 生成随机 ID
export const getRandomId = (): string => Date.now().toString() + (Math.random() * 10000 * 10000).toFixed();

// 判断数据类型是否是 formData
export const isFormData = (data：any) => Object.prototype.toString.call(data) === '[object FormData]'
```
