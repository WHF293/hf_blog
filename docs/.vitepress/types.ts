/*
 * @Author: hfWang
 * @Date: 2022-09-14 20:49:50
 * @LastEditTime: 2022-09-26 22:55:22
 * @Description: file content
 * @FilePath: \hf-blog-2\docs\.vitepress\theme\types.ts
 */
export interface Feature {
	icon?: string;
	url?: string;
	_blank?: boolean;
	title: string;
	details: string;
	isInLayout?: boolean;
}

export interface IKeyItem {
	text: string;
	link: string;
}


export interface IOptions {
    filePath: string;
    dirPath: string;
}