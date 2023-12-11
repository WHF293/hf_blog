//vite.config.ts
import { SearchPlugin } from 'vitepress-plugin-search'
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 9033,
    hmr: true,
    host: '0.0.0.0',
  },
  plugins: [
    SearchPlugin({
      previewLength: 30,
      buttonLabel: 'Search',
      placeholder: '站内搜索',
    }),
  ],
  define: {
    'process.env': process.env,
  },
})
