/*
 * @Author: wanghaofeng
 * @Date: 2023-11-15 20:17:27
 * @LastEditors: wanghaofeng
 * @LastEditTime: 2023-12-12 00:03:48
 * @FilePath: \hf_blog\docs\.vitepress\theme\hooks\useDocsInfo.ts
 * @Description:
 * Copyright (c) 2023 by wanghaofeng , All Rights Reserved.
 */
import { onMounted, reactive, ref } from 'vue'
import allDocsInfo from '../../keyWord.json'
import { levelMap } from '../constant'

export default function useDocsInfo() {
  const allDocsNum = ref(0)
  const keys = ref<string[]>([])
  const docsData = reactive<any>(allDocsInfo)

  const initDocsInfo = () => {
    let _tempKeys = [] as string[]

    Object.entries(docsData.keywords).forEach(([key, value]: [string, any]) => {
      allDocsNum.value += value.data.length
      _tempKeys.unshift(key)
    })
    console.log(_tempKeys, '........._tempKeys')
    keys.value = _tempKeys.sort((a, b) => {
      const akey = levelMap[a]
      const bkey = levelMap[b]
      return akey - bkey
    })
  }

  onMounted(() => {
    initDocsInfo()
  })

  return {
    allDocsNum,
    keys,
    docsData,
  }
}
