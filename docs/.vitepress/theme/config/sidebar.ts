/*
 * @Author: hfWang
 * @Date: 2022-07-18 21:01:29
 * @LastEditTime: 2022-09-20 23:29:33
 * @Description: file content
 * @FilePath: \hf-blog-2\docs\.vitepress\customConfig\sidebar.ts
 */

import { getFileName, getOtherSeries, getTargetDir } from "../../utils";
import { titleMap } from "../constant";
import type { DefaultTheme } from "vitepress";

const generatorSideBarGroup = (group: string) => {
	return [
		{
			text: titleMap[group] || group,
			collapsible: true,
			collapsed: false,
			items: getFileName(group),
		},
		getOtherSeries(group),
	]
}

const sidebar = {} as DefaultTheme.Sidebar 

getTargetDir().forEach(group => {
	sidebar[`/${group}/`] = generatorSideBarGroup(group)
})

export default sidebar;
