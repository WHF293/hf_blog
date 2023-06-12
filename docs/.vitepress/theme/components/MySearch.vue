<script setup lang="ts">
import { useRouter } from "vitepress";
import { computed, nextTick, ref } from "vue";
import keyInfo from "../../keyWord.json";

interface IKeyItem {
	text: string
	link?: string
	type?: string
	scrollTop?: number
}

const router = useRouter();
const keyword = ref<string>("");
const activeItem = ref<number>(0);
const showSearchItemList = ref<boolean>(false); // 是否显示下拉选项

// 点选跳转指定页面
const handleSelect = (val: IKeyItem) => {
	router.go(val.link);
	nextTick(() => {
		keyword.value = "";
		activeItem.value = 0;
	});
};

// 打开/关闭搜索下拉框
const toggleSearchInfo = (type: boolean) => {
	setTimeout(() => {
		showSearchItemList.value = type;
	}, 100)
};

// 回车自动跳转选项
const enterActiveItem = () => {
	if (keyword.value === "" || searchList.value.length === 0) return;
	const targetLink = searchList.value[activeItem.value]?.link || "";
	if (targetLink) {
		router.go(targetLink);
		nextTick(() => {
			keyword.value = "";
			activeItem.value = -1;
		});
	}
};

// 查询符号高亮
const heightLightText = (data: string): string => {
	const reg = new RegExp(keyword.value, "gi");
	return keyword.value
		? data.replace(reg, `<span style='color: red'>${keyword.value.toLowerCase()}</span>`)
		: data;
};

// 搜索关键词改变
const changeKeyWord = () => {
	activeItem.value = 0;
};

// 判断当前项是否符合搜索关键词
const showInfo = (data): boolean => {
	return data.text.toUpperCase().includes(keyword.value.toUpperCase());
};

// 搜索列表
const searchList = computed<IKeyItem[]>(() => {
	const maxNum = 5; // 下拉框可容纳的最大数量
	const scrollTopStep = 90; // 每个选项之间的距离
	let result: any[] = []; // 查询结果
	if (keyword.value) {
		Object.keys(keyInfo.keywords).map((key) => {
			keyInfo.keywords[key].map((item) => {
				if (showInfo(item)) {
					let len = result.length;
					result.push({
						...item,
						// 用来区分大的分类
						type: key,
						// 用于按上下键的时候同步滚动条位置
						scrollTop: len < maxNum ? 0 : (len - (maxNum - 1)) * scrollTopStep,
					});
				}
			});
		});
	}
	return result;
});

// 键盘 up / down 按钮触发
const changeActiveItem = (isAdd: boolean) => {
	// 可选项边界处理 -- 是否处于边界
	const isInBorder = (isAdd && activeItem.value === searchList.value.length - 1) || (!isAdd && activeItem.value === 0);
	if (searchList.value.length === 0 || isInBorder) {
		return;
	}
	activeItem.value = isAdd ? activeItem.value + 1 : activeItem.value - 1;
	// 可选项同步滚动
	const targetBox = document.getElementById("hf_search_box") as HTMLDivElement;
	if (targetBox.scrollTop !== searchList.value[activeItem.value].scrollTop) {
		targetBox.scrollTop = searchList.value[activeItem.value].scrollTop || 0;
	}
};
</script>
<script lang="ts">
export default {
	name: "MySearch",
};
</script>
<template>
	<div class="search-comp">
		<input
			v-model="keyword"
			placeholder="🔍文章查询"
			class="search-input"
			@change="changeKeyWord"
			@keyup.enter="enterActiveItem"
			@keydown.down="changeActiveItem(true)"
			@keydown.up="changeActiveItem(false)"
			@focus="toggleSearchInfo(true)"
			@blur="toggleSearchInfo(false)"/>
		<div
			v-if="showSearchItemList && keyword"
			class="search-result"
			id="hf_search_box">
			<ul v-if="searchList.length > 0">
				<li
					v-for="(item, index) in searchList"
					:key="item.link"
					:class="['search-item', activeItem === index && 'active-item']"
					@click.native="handleSelect(item)">
					<span v-html="heightLightText(item.text)"></span>
					<span class="search-item-type">{{ item.type }}</span>
				</li>
			</ul>
			<div v-else class="no-result">查询不到对应内容</div>
		</div>
	</div>
</template>
<style scoped>
.search-comp {
	position: relative;
	transition: .8s;
}

.search-input {
	border: 1px solid #ccc;
	height: 100%;
	padding: 5px 10px;
	border-radius: 12px;
}

.search-result {
	position: absolute;
	background: var(--vp-c-bg-soft);
	color: var(--vp-c-brand);
	border-radius: 8px;
	top: 40px;
	font-size: 16px;
	min-width: 450px;
	translate: 0.25s;
	max-height: 240px;
	overflow-y: scroll;
	box-shadow: 1px 1px 1px var(--vp-c-text-dark-2), -1px -1px 1px var(--vp-c-text-dark-2);
}

ul {
	background: var(--vp-c-bg-soft);
}

.no-result {
	height: 80px;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.title {
	margin: 0px 14px;
	padding: 10px 0;
	padding-bottom: 0;
}

.border-top {
	border-top: 1px solid #ccc;
}

.active-item {
	border: 2px solid var(--vp-c-brand-light);
	background: rgba(182, 231, 248, 0.3);
	transition: .4s;
}

.search-item {
	margin: 10px;
	padding: 6px 12px;
	border-radius: 8px;
	color: var(--vp-c-text-1);
	border: 2px solid var(--vp-c-bg-soft);
	cursor: pointer;
}

.search-item:hover {
	background: rgba(182, 231, 248, 0.3);
}

.search-item-type {
	font-size: 12px;
	float: right;
}

@media (max-width: 352px) {
	.search-comp {
		display: none;
	}
}

@media (max-width: 426px) {
	.search-result {
		min-width: 150px;
	}
}

@media (max-width: 767px) {
	.search-result {
		right: 0px;
	}

	.search-item-type {
		display: none;
	}
}

::-webkit-scrollbar {
	width: 5px;
}
</style>
