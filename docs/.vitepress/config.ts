/*
 * @Author: hfWang
 * @Date: 2022-07-18 19:26:15
 * @LastEditTime: 2023-02-07 22:54:00
 * @Description: file content
 * @FilePath: \whf_blog\docs\.vitepress\config.ts
 */

import { defineConfig } from "vitepress";
import sidebar from "./theme/config/sidebar";
import nav from "./theme/config/nav";
import socialLinks from "./theme/config/socialLinks";
import { getSearchKeyToJson } from "./utils";
import { baseUrl } from "./theme/constant";

const isDev = process.env.NODE_ENV === 'development' ? true : false
if (isDev) {
	getSearchKeyToJson()
}

export default defineConfig({
	base: baseUrl,
	title: "霞露小伙",
	description: "老王个人的学习记录，吐槽分享",
	lastUpdated: true,
	themeConfig: {
		lastUpdatedText: "最近更新",
		logo: "https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/h-theme.png",
		nav,
		sidebar,
		socialLinks,
		footer: {
			message: "本站中引用到的其他资料，如有侵权，请联系本人删除",
			copyright: "Copyright © 2022-present HfWang",
		},
		editLink: {
			pattern: "https://github.com/WHF293/whf_blog",
			text: "编辑",
		},
		docFooter: {
			prev: "上一篇",
			next: "下一篇",
		},
		outline: "deep",
	},
});

