<!--
 * @Author: hfWang
 * @Date: 2022-10-19 19:59:49
 * @LastEditTime: 2023-02-07 23:29:20
 * @Description: file content
 * @FilePath: \whf_blog\README.md
-->

## 下载

git clone https://github.com/WHF293/whf_blog.git

## 本地运行

安装依赖 pnpm i
本地运行 pnpm docs:dev
打包 pnpm docs:build
预览打包结果 pnpm docs:serve
部署上线 bash deploy.sh


访问地址：  https://whf293.github.io/

## 说明

使用 vitepress 必须 node 版本大于 14.18.0


## vitepress-plugin-search 插件说明

- vitepress 插件的 vite.config.ts 必须在 docs 目录下
- vitepress 只能查询一级和二级标题，不能查询文章名称,所以一级标题要和文件名相同才能确保被查询到
- 文件名不要出现空格，否则跳转异常
- 只能搜索英文，中文搜索不出来  