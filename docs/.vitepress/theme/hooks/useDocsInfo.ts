import { reactive, ref, onMounted } from 'vue'
import allDocsInfo from '../../keyWord.json'

export default function useDocsInfo() {
    const allDocsNum = ref(0);
    const keys = ref<string[]>([])
    const docsData = reactive<any>(allDocsInfo)

    const initDocsInfo = () => {
        let _tempKeys = [] as string[]

        Object.entries(docsData.keywords).forEach(([key, value]: [string, any]) => {
            allDocsNum.value += value.data.length
            _tempKeys.unshift(key)
        })
        keys.value = _tempKeys
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

