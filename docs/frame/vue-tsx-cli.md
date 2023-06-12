
# 搭建 vue3 + tsx 项目

:::warning 概要
本文主要介绍了怎么搭建一个 vue3 + tsx 的项目环境

主要使用的库 pinia axios vueuse windicss
:::

## 初始化项目

```js
pnpm create vite
```

```js
pnpm vue-router pinia axios qs
pnpm i sass @types/node @types/qs -D
```

## 添加 unplugin-auto-import

作用： 自动导入 vue3 api

【备注】：jsx 下无法使用该插件

```js
pnpm i unplugin-auto-import -D
```

修改 vite.config.ts

```js
import AutoImport from "unplugin-auto-import/vite"; //注意后面有个/vite

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
	const root = process.cwd();
	const env = loadEnv(mode, root);
	return {
		plugins: [
			AutoImport({
				imports: ["vue", "vue-router"],
				// 可以选择auto-import.d.ts生成的位置
				// 使用ts建议设置为'src/auto-import.d.ts'
				dts: "src/typings/auto-import.d.ts",
			}),
		],
	};
});
```

## 添加 unplugin-vue-components

作用： 自动导入自定义组件（或第三方组件库）

【备注】：jsx 下无法使用该插件

```js
pnpm i unplugin-vue-components -D
```

修改 vite.config.js

```js
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite"; //注意后面有个/vite
import Components from "unplugin-vue-components/vite"; //注意后面有个/vite

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
	const root = process.cwd();
	const env = loadEnv(mode, root);
	return {
		plugins: [
			vue(),
			AutoImport({
				imports: ["vue", "vue-router"],
				// 可以选择auto-import.d.ts生成的位置
				dts: "src/typings/auto-import.d.ts",
			}),
			Components({
				dirs: ["src/components"],
				extensions: ["vue", "tsx"],
				// 配置文件生成位置
				dts: "src/typings/components.d.ts",
			}),
		],
	};
});
```

## 添加 @vitejs/plugin-vue-jsx

作用： 支持 jsx 语法

```js
pnpm i @vitejs/plugin-vue-jsx  -D
```

修改 vite.config.js

```js
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
	const root = process.cwd();
	const env = loadEnv(mode, root);
	return {
		plugins: [
			vue(),
			vueJsx({
				// options are passed on to @vue/babel-plugin-jsx,可不写，使用默认配置
			}),
		],
	};
});
```

## 添加 windicss

```js
pnpm i -D vite-plugin-windicss windicss
```

```ts
// vite.config.ts
import WindiCSS from "vite-plugin-windicss";

export default {
	plugins: [WindiCSS()],
};
```

```ts
// /src/main.ts
import "virtual:windi.css";
```

## 添加工具函数

1. 安装常用第三方工具库 vueuse lodash-es

```js
pnpm i @vueuse/core lodash-es -D
```

vueuse 常用 API

- 状态修改

  - useToggle:: 状态切换，适合比如弹窗打开、关闭或者某个元素/组件显示或隐藏的切换
  - useDebounceFn:: 防抖
  - useThrottleFn: 节流
  - useLocalStorage: localStorage
  - useCookies: cookie
  - useTitle: 修改标签页名

- 监听功能

  - useWindowSize: 监听整个视图窗口大小的变化
  - useInterSectionObserver: 监听元素是否处于可视区域
  - useScroll: 监听滚动

- 功能

  - useClipboard: 原生 clipboard api 的封装
  - useFetch: 用于发起请求
  - useNProgress: 请求进度条
  - useQRCode: 二维码
  - useWebSocket: websocket

2. 自定义工具函数

```js
// utils/to.ts
function to<T, U = Error>(func: Promise<T>): Promise<[null, T] | [U, null]> {
  return func
    .then<[null, T]>((res: T) => [null, res])
    .catch <[U, null] >((err: U) => [err, null])
  );
}

export default to;
```

## 增加代理

vite.config.js 新增下面选项

```js
server: {
    port: 3000,
    open: false,
    proxy: {
        '/api': {
            target: 'https://xxxx.xxxx.xxx',
            changeOrigin: true,
            rewrite: url => url.replace('/api', '')
        }
    }
},

```

## 增加别名

vite.config.js 新增下面选项

```js
resolve: {
    alias: {
        '@': resolve(__dirname,'src'),
    }
}
```

tsconfig.json

```json
{
	"compilerOptions": {
		"target": "esnext",
		"useDefineForClassFields": true,
		"module": "esnext",
		"moduleResolution": "node",
		"strict": true,
		"jsx": "preserve",
		"sourceMap": true,
		"resolveJsonModule": true,
		"esModuleInterop": true,
		"lib": ["esnext", "dom"],
		"paths": {
			"@/*": ["./src/*"] // 新增
		}
	},
	"include": [
		"src/**/*.ts",
		"src/**/*.d.ts",
		"src/**/*.tsx",
		"src/**/*.vue",
		"typings/*.d.ts" // 声明文件
	],
	"jsx": "preserve", // tsx / jsx 支持
	"references": [{ "path": "./tsconfig.node.json" }]
}
```

## css 处理器

- 新建 src/asset/css/index.scss
- 修改 vite.config.js

```js
css: {
    preprocessorOptions: {
        scss: {
            additionalData: '@import "@/assets/css/index.scss";',
        },
    },
}
```

## 生产环境移除 console、debuger

```js
build: {
    terserOptions: {
        compress: {
            // 生产环境去除 console debugger
            drop_console: true,
            drop_debugger: true,
        },
    }
}
```

## axios 封装

```js
// src/utils/service.ts
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import qs from "qs";
import showStatusMessage from "./statusMessage";

const instance = axios.create({
	baseURL: "appi",
	timeout: 10 * 1000,
});

instance.defaults.withCredentials == true;
instance.defaults.headers.post["Content-type"] = "application/json;charset='UTF-8'";

instance.interceptors.request.use(
	(config: AxiosRequestConfig) => {
		if (config.method === "post") {
			const timeStamps = new Date().getTime();
			config.data = qs.stringify({
				...config.data,
				timeStamps,
			});
		}
		return config;
	},
	(err) => {
		return err;
	}
);

instance.interceptors.response.use(
	(res: AxiosResponse) => {
		const { status } = res;
		if (status >= 300 || status < 200) {
			const msg = showStatusMessage(status);
			if (typeof res.data === "string") {
				res.data = { msg };
			} else {
				res.data.msg = msg;
			}
		}
	},
	(err) => {
		err.data = {
			msg: "请求超时或服务器异常，请检查网络或联系管理员！",
		};
		return err;
	}
);

export default instance;
```

```js
// src/utils/statusMessage.ts

interface IStatusMapping {
	[key: string]: string;
}
const showStatusMessage = (status: number | string): string => {
	const code = typeof status === "string" ? status : status.toString();
	const statusMapping: IStatusMapping = {
		400: "请求错误",
		401: "未授权，请重新登录",
		403: "拒绝访问",
		404: "请求出错",
		408: "请求超时",
		500: "服务器错误",
		501: "服务未实现",
		502: "网络错误",
		503: "服务不可用",
		504: "网络超时",
		505: "HTTP版本不受支持",
	};
	const message = statusMapping[code] ? statusMapping[code] : "未知异常，请检查网络或联系管理员！";
	return message;
};

export default showStatusMessage;
```

```js
// src/utils/http.ts
import service from "./service";

interface IHttp {
	post<T>(url: string, params?: T): Promise<any>;
	get<T>(url: string, params?: T): Promise<any>;
	put<T>(url: string, params?: T): Promise<any>;
	delete<T>(url: string, params?: T): Promise<any>;
}

const http: IHttp = {
	post: (url, params) => {
		return service.post(url, params);
	},
	get: (url, params) => {
		return service.get(url, params);
	},
	put: (url, params) => {
		return service.put(url, params);
	},
	delete: (url, params) => {
		return service.delete(url, params);
	},
};

export default http;
```

## 路由配置

新建 router 文件夹

```js
// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import routes from "./routes";

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
```

```js
// src/router/routes
import { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
	{
		path: "/",
		redirect: { name: "loginPage" },
	},
	{
		path: "/login",
		name: "loginPage",
		component: () => import("@/views/loginPage.vue"),
	},
	{
		path: "/index",
		name: "homePage",
		component: () => import("@/views/homePage.vue"),
		children: [
			{
				path: "musicRecommended",
				name: "musicRecommended",
				component: () => import("@/components/common/musicRecommended.vue"),
			},
		],
	},
	{
		path: "/:path(.*)",
		name: "noFound",
		component: () => import("@/views/noFound.vue"),
	},
];

export default routes;
```

## 接口请求

新建 api 文件夹

```js
// src/api/user.ts
import http from "@/utils/http"

export default class UserApi {
    public login<T>(params: T) {
        return http.post('/login', params)
    }
    public logout() {
        return http.post('./logout')
    }
    public getUserInfo<T>(params: T) {
        return http.post('/user/userDetail', params)
    }
}
```

## 状态管理

新建 store 文件夹

```js
// src/store/user.ts
import { defineStore } from "pinia";

interface IState {
  userInfo: object;
}
const useUserStore = defineStore({
  id: "user",
  state: (): IState => ({
    return {
      userInfo: {
        age: 10
      },
    };
  }),
  getters: {
    getUserAge() {
      return this.state.userInfo.age
    }
  },
  actions: {
    setUserInfo(userInfo) {
      this.state.userInfo = userInfo
    }
  },
});

export default useUserStore;
```

## 全局挂载

```js
// main.ts
import { createApp } from "vue";
import App from "./App.vue";
import router from "@/router";
import { createPinia } from "pinia";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.mount("#app");
```

## 环境配置

新建 .env.development、.env.production

```js
//开发.env.development
VITE_MODE_NAME=development
VITE_RES_URL=https://www.xxxxx.com
VITE_APP_TITLE=项目标题
```

```js
//生产.env.production
VITE_MODE_NAME=production
VITE_RES_URL=https://www.xxxxx.com
VITE_APP_TITLE=项目标题
```

新建 env.d.ts

```js
// typings/env.d.ts
interface ImportMetaEnv {
	VITE_MODE_NAME: string;
	VITE_RES_URL: string;
	VITE_APP_TITLE: string;
}
```

使用

```js
// 组件中：
import.meta.VITE_MODE_NAME;
import.meta.VITE_RES_URL;
import.meta.VITE_APP_TITLE;

// vite.config.ts 中
import { defineConfig, loadEnv } from "vite";
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, __dirname);
	return {
		// .........
	};
});
```

## 完整 vite.config.ts

```ts
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import WindiCSS from "vite-plugin-windicss";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, __dirname);
	return {
		plugins: [vue(), vueJsx(), WindiCSS()],
		server: {
			port: 3000,
			open: false,
			proxy: {
				"/api": {
					target: env.VITE_RES_URL,
					changeOrigin: true,
					rewrite: (url) => url.replace("/api", ""),
				},
			},
		},
		resolve: {
			alias: {
				"@": resolve(__dirname, "src"),
			},
		},
		css: {
			preprocessorOptions: {
				scss: {
					additionalData: '@import "@/assets/css/index.scss";',
				},
			},
		},
		build: {
			terserOptions: {
				compress: {
					// 生产环境去除 console debugger
					drop_console: true,
					drop_debugger: true,
				},
			},
		},
	};
});
```

## UI 库

vue3 的 UI 组件库有挺多的，但是大部分是使用 sfc 的模式开发的组件，对于我们这个使用 tsx 的 vue3 项目可能不太友好，所以我推荐的组件库要求是内部使用 tsx 写法的，这样对于我们的开发不会有太大的不利影响

- naive-UI
- antd-desgin-vue
- devui (华为的，目前还未开源)

以上 3 个组件库的搭建，都是采用 vue3 + tsx 的写法，其组件同时支持 tsx 和 sfc 的写法调用
