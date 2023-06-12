<script setup lang="ts">
import { computed } from "vue";
import MyFeature from "./MyFeature.vue";
import { ref } from "vue";
import { FeatureGroupInfo, IFeatureType } from "../constant";
import { Feature } from "../../types";

const props = defineProps<{
	type: IFeatureType;
	isInLayout?: boolean;
}>();

const features = ref<Feature[]>(FeatureGroupInfo[props.type]);

const grid = computed(() => {
	const length = features.value.length;
	if (props.isInLayout) {
		return "grid-2";
	} else {
		if (!length) {
			return;
		} else if (length === 2) {
			return "grid-2";
		} else if (length === 3) {
			return "grid-3";
		} else if (length % 3 === 0) {
			return "grid-6";
		} else if (length % 2 === 0) {
			return "grid-4";
		}
	}
});
</script>
<script lang="ts">
export default {
	name: "MyFeatureGroup",
};
</script>

<template>
	<div v-if="features" class="VPFeatures">
		<div class="container">
			<div class="items">
				<div 
					v-for="feature in features" 
					class="item" 
					:key="feature.title" 
					:class="[grid]">
					<MyFeature 
						:title="feature.title" 
						:details="feature.details" 
						:url="feature.url || ''" 
						:icon="feature.icon || ''" 
						:_blank="feature._blank || false"
					></MyFeature>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.VPFeatures {
	position: relative;
	padding: 0 24px;
}

@media (min-width: 640px) {
	.VPFeatures {
		padding: 0 48px;
	}
}

@media (min-width: 960px) {
	.VPFeatures {
		padding: 0 64px;
	}
}

.container {
	margin: 0 auto;
	max-width: 1152px;
}

.items {
	display: flex;
	flex-wrap: wrap;
	margin: -8px;
}

.item {
	padding: 8px;
	width: 100%;
}

@media (min-width: 640px) {
	.item.grid-2,
	.item.grid-4,
	.item.grid-6 {
		width: calc(100% / 2);
	}
}

@media (min-width: 768px) {
	.item.grid-2,
	.item.grid-4 {
		width: calc(100% / 2);
	}

	.item.grid-3,
	.item.grid-6 {
		width: calc(100% / 3);
	}
}

@media (min-width: 960px) {
	.item.grid-4 {
		width: calc(100% / 4);
	}
}
</style>
