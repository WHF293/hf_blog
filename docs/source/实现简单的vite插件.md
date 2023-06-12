# vite 插件实践

:::warning
待完善
:::

- [vite 插件开发 - 官方文档](https://vitejs.bootcss.com/guide/api-plugin.html)

## vite-plugin-mock


### 分析

因为 mock 一般只用在本地开发阶段，所以需要在 vite 确认最终配置信息的时候，我们去判断是不是开发阶段，不是的话直接拦截操作。

而这个阶段  vite 为我们提供了这个钩子 [configResolved](https://vitejs.bootcss.com/guide/api-plugin.html#configresolved) 用于开发者获取最终配置信息

让后就是我们在开发阶段，我们每次发起的请求，实际上都是在使用 vite 为我们搭建的开发服务器发起请求，所以我们就可以在这里做判断了

- 我们先获取 mock 文件夹下导出的数组
- 在 vite 为我们开发服务器的中间件上 [configureserver](https://vitejs.bootcss.com/guide/api-plugin.html#configureserver) 执行我们封装好的 mock 操作

先简单搭建个插件架子

```ts
import type { ResolvedConfig, ViteDevServer, PluginOption } from 'vite'

export interface VitePluginMockOption {
    entry?: string // mock 文件入口
    useTs?: boolean // 是否使用 ts
}

export default (options: VitePluginMockOption = {}) => {
    let isDev = false

    return {
        name: "vitePluginMock",
        // 开启 enforce， 插件调用时机会在调用 vite 内置的核心插件之前
        // https://vitejs.bootcss.com/guide/api-plugin.html#plugin-ordering
        enforce: "pre",
        // 确认配置钩子，这个钩子在 vite 确认最终的配置项后触发
        configResolved: (config: ResolvedConfig) => {
            isDev = config.command === 'serve'
        },
        // vite 插件服务器的相关配置
        // https://vitejs.bootcss.com/guide/api-plugin.html#configureserver
        configureServer: (server: ViteDevServer) => {
            if (!isDev) return

            // 获取 mock 文件入口
            const mockEntryPath = 
                `${options.entry || 'mock'}/index.${options.useTs ? 'ts' : 'js'}`
            const mockEntry = path.resolve(process.cwd(), mockEntryPath)

            server.middlewares.use(req, res, next) => {
                // 符合 mock 的在这里就处理掉了，不符合的直接交由下一个 中间件 处理
                if () {
                    // .....
                } else {
                    next()
                }
            }
        }
    }
}
```