<template>
	<div class="game-wrap">
		<div
			class="game-col"
			v-for="(col, indexC) in viewPokersData"
			:key="indexC"
			@drop="onDrop($event, indexC)"
			@dragover="onColDragover($event, indexC)"
		>
			<template v-if="col.length > 0">
				<div
					class="game-row"
					v-for="(element, indexR) in col"
					:key="indexR"
					:class="{
						'choose-element': element.id === toBeMatchedCards?.[0]?.id
					}"
					:style="{ top: `${60 * indexR}px` }"
					@click="overturnOrChoose(element)"
					:draggable="element.visible"
					@dragstart="onDragstart($event, element)"
					@dragover="onDragover($event, element, indexC)"
				>
					<a-image
						v-if="element.visible"
						:src="getAssetsFile(element.suit + element.value)"
						:width="120"
						:preview="false"
					/>
					<a-image
						v-else
						:src="getAssetsFile('back')"
						:width="120"
						:preview="false"
					/>
				</div>
			</template>
			<template v-else>
				<div class="game-row placeholder" @click="onClickEmptyCol(indexC)">
					<div class="tooltip">
						<p>本列暂无</p>
						<p>可放置</p>
					</div>
				</div>
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Modal, message, notification } from 'ant-design-vue';
import { useRefHistory } from '@vueuse/core';

import poker from './poker';
import { getAssetsFile, getSuit } from '../utils/index';
import { Poker } from './type';
import { cloneDeep } from 'lodash-es';

const DEFAULT_UNVISIBLE_ROWS = 2;
const DEFAULT_COLS = 8;

// 保存的是第1列、第2列。。。
const viewPokersData = ref<Poker[][]>([]);

const rearrange = () => {
	viewPokersData.value.forEach((col, indexC) => {
		col.forEach((row, indexR) => {
			row.col = indexC;
			row.row = indexR;
		});
	});
};

const checkDontHaveBug = (arr: Poker[][]) => {
	for (let col = 0; col < DEFAULT_COLS; col++) {
		for (let row = 0; row < DEFAULT_UNVISIBLE_ROWS; row++) {
			const topEle = arr[col][row];
			const bottomEle = arr[col][row + 1];

			if (
				topEle.suit === bottomEle.suit &&
				topEle.value === bottomEle.value + 1
			) {
				console.log(topEle.col, topEle.row);

				return false;
			}
		}
	}
	return true;
};

// 按照列来填充
const initData = () => {
	let index = 0;
	const res = [];
	for (let col = 0; col < DEFAULT_COLS; col++) {
		const curCol: Poker[] = [];
		for (
			let row = 0;
			row < DEFAULT_UNVISIBLE_ROWS + DEFAULT_COLS - col;
			row++
		) {
			curCol.push({
				id: index,
				suit: poker.pokers[index].suit,
				value: poker.pokers[index].value,
				row,
				col,
				visible: row < 2 ? false : true
			});
			index++;
		}
		res.push(curCol);
	}

	if (!checkDontHaveBug(res)) {
		poker.shuffle();
		initData();
		return;
	}

	viewPokersData.value = res;
	window.localStorage.setItem('__poker_game_history', JSON.stringify(null));
};

initData();

const restCols = ref<Poker[]>([]);
const onDragstart = (_event: DragEvent, element: Poker) => {
	const { col, row } = element;
	restCols.value = viewPokersData.value[col!].slice(row!);

	// const canvas = document.createElement('canvas');

	// const ctx = canvas.getContext('2d');

	// restCols.value.forEach((item) => {
	// const img = new Image(); // 创建一个<img>元素
	// img.onload = function () {
	// 	ctx!.drawImage(img, 0, 65, 120, 185); //绘制图片
	// };
	// img.src = getAssetsFile(item.suit + item.value); // 设置图片源地址
	// 	ctx?.fillRect(0, 0, 20, 20);
	// });

	// _event.dataTransfer?.setDragImage(canvas, 0, 0);
};

const onDrop = (_event: DragEvent | undefined, indexCol: number) => {
	checkPokerIsMatched(indexCol);
};

const checkPokerIsMatched = (indexCol: number) => {
	const {
		row: startRow,
		col: startCol,
		suit: startSuit,
		value: startValue
	} = restCols.value[0];

	const curColLength = viewPokersData.value[indexCol].length;

	if (curColLength > 0) {
		const lastPoker = viewPokersData.value[indexCol][curColLength - 1];
		const { suit: endSuit, value: endValue } = lastPoker;

		if (startSuit === endSuit && startValue + 1 === endValue) {
			viewPokersData.value[startCol!].splice(startRow!);
			viewPokersData.value[indexCol].splice(curColLength, 0, ...restCols.value);
			rearrange();
		} else {
			message.error('无法配对');
		}
	} else {
		viewPokersData.value[startCol!].splice(startRow!);
		viewPokersData.value[indexCol].splice(curColLength, 0, ...restCols.value);
		rearrange();
	}
};

const onDragover = (_event: DragEvent, element: Poker, indexCol: number) => {
	const { suit: startSuit, value: startValue } = restCols.value[0];

	const curColLength = viewPokersData.value[indexCol].length;

	const lastPoker = viewPokersData.value[indexCol][curColLength - 1];
	const { suit: endSuit, value: endValue } = lastPoker;

	if (startSuit === endSuit && startValue + 1 === endValue) {
		if (element.row === curColLength - 1) {
			_event.preventDefault();
		}
	}
};

const onColDragover = (_event: DragEvent, indexCol: number) => {
	const { value: startValue } = restCols.value[0];
	if (viewPokersData.value[indexCol].length === 0 && startValue === 13) {
		_event.preventDefault();
	}
};

let toBeMatchedCards = ref<Poker[]>([]);

const overturnOrChoose = (element: Poker) => {
	const { col, row } = element;

	// 扣着的牌需要翻起来
	if (element.visible === false) {
		if (viewPokersData.value[col!].length === row! + 1) {
			element.visible = true;
		}

		// 如果透视功能开启，那也可以翻牌
		if (perspective.value) {
			element.visible = true;

			setTimeout(() => {
				element.visible = false;
			}, 1500);
		}
	} else {
		// 翻起来的牌就是要移动
		if (toBeMatchedCards.value.length === 0) {
			// message.info('已选择要移动的牌，请选择要移动的位置');
			toBeMatchedCards.value.push(element);
		} else if (toBeMatchedCards.value.length === 1) {
			// TODO 如果目标列没有东西怎么办
			toBeMatchedCards.value.push(element);
			checkIfMatch(toBeMatchedCards.value[0], toBeMatchedCards.value[1]);
			toBeMatchedCards.value = [];
		}
	}
};

const onClickEmptyCol = (indexCol: number) => {
	if (toBeMatchedCards.value?.[0]) {
		const { col, row } = toBeMatchedCards.value[0];
		restCols.value = viewPokersData.value[col!].slice(row!);
		checkPokerIsMatched(indexCol);

		toBeMatchedCards.value = [];
	}
};

const checkIfMatch = (startEle: Poker, endEle: Poker) => {
	const { col, row } = startEle;
	restCols.value = viewPokersData.value[col!].slice(row!);
	checkPokerIsMatched(endEle.col!);
};

// 透视
const perspective = ref(false);
const onPerspective = () => {
	let time = 5;

	perspective.value = true;
	notification.open({
		key: 'perspective',
		message: '透视',
		description: `透视功能将会在${time}秒后关闭`
	});
	const repetition = () => {
		time--;
		if (time > 0) {
			setTimeout(() => {
				notification.open({
					key: 'perspective',
					message: '透视',
					description: `透视功能将会在${time}秒后关闭`
				});

				repetition();
			}, 1000);
		} else {
			perspective.value = false;
		}
	};
	repetition();
};

const onHint = () => {
	let flag = false;
	work: for (let i = 0; i < DEFAULT_COLS; i++) {
		const lastColLength = viewPokersData.value[i].length;
		if (lastColLength === 0) continue;
		const lastEle = viewPokersData.value[i][lastColLength - 1];
		const {
			suit: lastSuit,
			value: lastValue,
			col: lastCol,
			visible: lastVisible
		} = lastEle;

		if (!lastVisible) continue;

		for (let col = 0; col < viewPokersData.value.length; col++) {
			const colData = viewPokersData.value[col];

			for (let j = 0; j < colData.length; j++) {
				const item = colData[j];
				const {
					suit: curSuit,
					value: curValue,
					col: curCol,
					visible: curVisible
				} = item;

				if (lastCol !== curCol) {
					if (
						curVisible &&
						lastSuit === curSuit &&
						lastValue === curValue + 1
					) {
						flag = true;
						message.success(
							`${lastCol! + 1}列的${getSuit(
								lastSuit
							)}${lastValue}可以配对, 目标在第${curCol! + 1}列`
						);
						break work;
					}
				}
			}
		}
	}
	if (!flag) {
		message.warning('没有可以配对的牌了');
	}
};

const setHistoryFile = () => {
	Modal.confirm({
		title: '确认存档',
		content: '存档会导致上次存档数据丢失，是否确认？',
		onOk() {
			window.localStorage.setItem(
				'__poker_game_history',
				JSON.stringify(cloneDeep(viewPokersData.value))
			);
		},
		onCancel() {
			console.log('Cancel');
		}
	});
};

const getHistoryFile = () => {
	const history = window.localStorage.getItem('__poker_game_history');
	if (!history) message.info('没有可读档的文件');

	Modal.confirm({
		title: '确认读档',
		content: '读档会导致当前进度丢失，是否确认？',
		onOk() {
			viewPokersData.value = JSON.parse(history!);
		},
		onCancel() {
			console.log('Cancel');
		}
	});
};

const resetGame = () => {
	poker.shuffle();
	initData();
};

const { undo, redo } = useRefHistory(viewPokersData, {
	deep: true
});
const onUndo = () => {
	undo();
};

const onRedo = () => {
	redo();
};

defineExpose({
	onPerspective,
	onHint,
	setHistoryFile,
	getHistoryFile,
	resetGame,
	onUndo,
	onRedo
});
</script>

<style scoped lang="less">
.game-wrap {
	height: 100%;
	padding-top: 40px;

	.game-col {
		width: 120px;
		display: inline-flex;
		flex-direction: column;
		margin-right: 40px;
		position: relative;
		height: 20px; // 为了撑起这个格子

		.game-row {
			border-radius: 4px;
			position: absolute;
			left: 0;
			top: 0;
			transform: scale(0.9);
		}

		.choose-element {
			transform: scale(1);
			border: 2px solid salmon;
		}

		.placeholder {
			width: 120px;
			color: #7b7777;
			min-height: 50vh;
			border: 1px dotted #7b7777;
			padding-top: 40px;
			margin-top: -10px;
			display: flex;
			justify-content: center;
		}
	}
}
</style>
