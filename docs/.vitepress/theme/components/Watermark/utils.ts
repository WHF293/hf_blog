export interface WaterMarkBaseOptions {
	/** 水印文案，默认 xialuxiaohuo */
	text?: string;
	/** 水印字体大小，默认 12px */
	fontSize?: number;
	/** 水印文字倾斜角度， 默认 -45deg */
	rotate?: number;
	/** 水印之间的间距倍数，默认一倍 */
	gap?: number;
	/** 水印文字颜色 */
	fontColor?: string;
}

export interface WaterMarkOptions {
	/** 水印图片，base64 格式 */
	base64: string;
	/** 水印图片大小 */
	size: number;
	/** 水印图片宽度 */
	styleSize: number;
	/** 水印id */
	waterMarkId: string;
}

/**
 * 获取水印图片信息
 * @param options 配置参数
 * @returns
 */
export function getWaterMark(
	options: Required<WaterMarkBaseOptions>
): WaterMarkOptions {
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

	/** 当前设备像素密度 */
	const devicePixelRatio = window.devicePixelRatio || 1;
	// 计算水印文案字体占据的像素宽度
	const { width } = ctx.measureText(options.text);

	const canvasSize = width + options.gap * devicePixelRatio;
	const canvasTranslate = canvasSize / 2;
	canvas.width = canvasSize;
	canvas.height = canvasSize;
	ctx.translate(canvasTranslate, canvasTranslate);
	ctx.rotate((options.rotate * Math.PI) / 180);
	ctx.font = `${options.fontSize * devicePixelRatio}px serif`;
	ctx.fillStyle = options.fontColor;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText(options.text, 0, 0);

	const waterMarkId = `watermark_${Date.now()}`;

	return {
		/** 水印图片，base64 格式 */
		base64: canvas.toDataURL(),
		/** 水印图片大小 */
		size: canvasSize,
		/** 水印图片宽度 */
		styleSize: canvasSize / devicePixelRatio,
		/** 水印id */
		waterMarkId,
	};
}

/**
 * 设置水印到父节点上去
 * @param parentDom 水印挂载父节点
 * @param options 水印参数
 * @returns
 */
export function setWatermark(
	parentDom: HTMLDivElement,
	options: WaterMarkOptions
) {
	if (!parentDom) return;
	const { base64, styleSize, waterMarkId } = options;
	const watermarkDom = document.getElementById(waterMarkId);
	if (watermarkDom) {
		watermarkDom.remove();
	}
	const div = document.createElement('div');
	div.style.backgroundImage = `url(${base64})`;
	div.style.backgroundSize = `${styleSize}px`;
	div.style.backgroundRepeat = 'repeat';
	div.style.width = '100%';
	div.style.height = '100%';
	div.style.zIndex = '99999';
	div.style.position = 'absolute';
	div.style.pointerEvents = 'none';
	div.style.inset = '0';
	div.id = waterMarkId;
	parentDom.appendChild(div);
}

/**
 * 监听使用节点被修改的情况然后重新设置水印
 * @param parentDom 水印挂载父节点
 * @param options 水印参数
 * @returns
 */
export function watchWaterMarkChange(
	parentDom: HTMLDivElement,
	options: WaterMarkOptions
) {
	const { waterMarkId } = options;
	const watermarkDom = document.getElementById(waterMarkId);

	const ob = new MutationObserver(entries => {
		for (const entry of entries) {
			// 遍历被删除的节点
			for (const dom of entry.removedNodes) {
				// 如果被删除的节点是水印节点,重新设置水印节点

				if (dom === watermarkDom) {
					setWatermark(parentDom, options);
					return;
				}
			}
			// 修改水印节点的属性，例如修改水印节点的 css样式，比如透明度设置为 0 的情况
			if (entry.target === watermarkDom) {
				setWatermark(parentDom, options);
			}
		}
	});

	return ob;
}
