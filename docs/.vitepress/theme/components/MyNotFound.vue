<!--
 * @Author: hfWang
 * @Date: 2023-02-07 21:00:10
 * @LastEditTime: 2023-02-07 23:11:47
 * @Description: file content
 * @FilePath: \whf_blog\docs\.vitepress\theme\MyTheme\MyNotFound.vue
-->
<template>
	<div class="NotFound">
		<p class="title">404，此路不通，艾过叫句老祖公</p>
		<div class="action">
			<a class="link" href="/" aria-label="go to home"> 回到首页 </a>
			<a class="link" @click.stop aria-label="go to home" title="别点我，我真的什么作用都没有啊，你还别不信"> 为了对称 </a>
		</div>
		<img src="https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/202411062258547.png" class="chu-yin" />
	</div>
</template>

<style scoped>
.NotFound {
	padding: 200px 24px 200px;
	height: 100%;
	width: 100%;
	text-align: center;
	display: flex;
	justify-content: center;
	flex-direction: column;
	background-image: radial-gradient(rgb(210, 255, 248), rgb(181, 219, 255), rgb(228, 205, 255));
}

.chu-yin {
	width: 300px;
	margin: auto;
}

.title {
	padding-top: 12px;
	letter-spacing: 2px;
	line-height: 20px;
	font-size: 20px;
	font-weight: 700;
}


.divider {
	margin: 24px auto 18px;
	width: 64px;
	height: 1px;
	background-color: var(--vp-c-divider);
}

.quote {
	margin: 0 auto;
	max-width: 500px;
	font-size: 14px;
	font-weight: 500;
	color: var(--vp-c-text-2);
}

.action {
	padding-top: 20px;
}

.link {
	display: inline-block;
	border: 1px solid var(--vp-c-brand);
	border-radius: 16px;
	padding: 3px 16px;
	font-size: 14px;
	font-weight: 500;
	color: var(--vp-c-brand);
	transition: border-color 0.25s, color 0.25s;
	margin: 0 8px;
}

.link:hover {
	border-color: var(--vp-c-brand-dark);
	color: var(--vp-c-brand-dark);
}
</style>
