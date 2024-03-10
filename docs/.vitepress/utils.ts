
import * as fs from "fs";
import type { DefaultTheme } from "vitepress";
import { baseUrl, icons, titleMap } from "./theme/constant";
import { IKeyItem, IOptions } from "./types";

const filterDirOrFile = ["index.md", ".vitepress", "public", "vite.config.ts"]
const indexMdName = '分组目录'

// 获取其他分类
export const getOtherSeries = (
  filterName: string,
) => {
  const allSeries: DefaultTheme.SidebarItem[] = [];

  getTargetDir().forEach(item => {
    if (item !== filterName) {
      allSeries.push({
        text: titleMap[item] || item,
        link: `/${item}/`,
      });
    }
  })

  const otherSeries = {
    text: "other",
    collapsible: true,
    collapsed: false,
    items: allSeries,
  };
  return otherSeries;
};

export const getTargetPath = (path?: string) => path
  ? `${process.cwd()}/docs/${path}`
  : `${process.cwd()}/docs`

// 获取随机数
export const getRandomNum = (MaxNum: number) => Math.floor(Math.random() * MaxNum)

// 生成 json 文件
export const getSearchKeyToJson = () => {
  const targetDirs = getTargetDir();
  let result = {};
  targetDirs.map((dir) => {
    const files = fs.readdirSync(
      getTargetPath(dir),
      { encoding: "utf8" }
    )
    // .filter((item) => item !== "index.md");

    const res: IKeyItem[] = []
    files.forEach((file) => {
      const isIndexFile = file === 'index.md'
      const text = file.replace(".md", "");
      const obj = {
        text,
        link: `${baseUrl}${dir}/${text}`,
        icon: icons[getRandomNum(icons.length - 1)],
      } as IKeyItem;
      if (isIndexFile) {
        res.unshift(obj)
      } else {
        res.push(obj)
      }
    });
    // console.log(dir, res, '........result');
    result[dir] = {
      showMore: true,
      data: res
    }
  });
  generateJsonFile(result);
};

// 获取目标文件夹
export const getTargetDir = () => {
  const dirs = fs.readdirSync(getTargetPath(), { encoding: "utf8" });
  const targetDirs = dirs.filter((item) => !filterDirOrFile.includes(item));
  return targetDirs;
};

// 生成查询文件
export const generateJsonFile = (data: any) => {
  const keysInfo = JSON.stringify({ keywords: data });
  fs.writeFile(
    `${process.cwd()}/docs/.vitepress/keyWord.json`,  // 目标文件
    keysInfo,  // 写入的内容
    { encoding: "utf8" },  // 编码格式
    (err) => {
      if (err) console.log(err);
    }
  );
};

// 获取文件名
export const getFileName = (
  dirPath: string,
) => {
  const filePath = getTargetPath(dirPath);
  const options = {
    filePath,
    dirPath,
  };
  return createSidebar(options);
};

// 创建侧边导航栏
export const createSidebar = (
  options: IOptions
): DefaultTheme.SidebarItem[] => {
  const {
    filePath,
    dirPath,
  } = options;

  const docsNameList: DefaultTheme.SidebarItem[] = [];
  const files = fs.readdirSync(filePath, { encoding: "utf8" });

  files.map((file) => {
    const fileName = file.replace(".md", "");
    const fileLink = `/${dirPath}/${fileName}`;

    if (fileName === "index") {
      docsNameList.unshift({
        text: indexMdName,
        link: fileLink,
      })
    } else {
      docsNameList.push({
        text: fileName,
        link: fileLink,
      });
    }
  });
  return docsNameList;
};