/*
 * @Author: hfWang
 * @Date: 2022-07-21 22:28:30
 * @LastEditTime: 2022-07-21 22:28:32
 * @Description: file content
 * @FilePath: \hf-blog-2\docs\.vitepress\theme\components\env.d.ts
 */
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const Component: DefineComponent<{}, {}, any>;
  export default Component;
}
