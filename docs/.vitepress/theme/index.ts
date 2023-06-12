/*
 * @Author: hfWang
 * @Date: 2022-07-25 19:09:37
 * @LastEditTime: 2022-09-26 22:55:14
 * @Description: file content
 * @FilePath: \hf-blog-2\docs\.vitepress\theme\index.ts
 */
import DefaultTheme from "vitepress/theme";
import type { App } from "vue";
import "./custom.scss";

// 布局组件
import MyLayout from "./components/MyLayout.vue";
// 自定义全局组件
import MyFeatureGroup from "./components/MyFeatureGroup.vue";
import MyAllDocs from "./components/MyAllDocs.vue"
import MyCheckbox from "./components/MyCheckbox.vue"

// 自动注册全局组件
const customCompList = [
    MyFeatureGroup, 
    MyAllDocs,
    MyCheckbox,
];

const customCompPlugin = {
    install: (app: App) => {
        customCompList.map((item) => {
            app.component(item.name, item);
        });
    },
};

export default {
    ...DefaultTheme,
    Layout: MyLayout,
    enhanceApp({ app }) {
        app.use(customCompPlugin);
    },
};
