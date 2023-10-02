<template>
	<div class="game-wrap">
		<div
			class="game-col"
			v-for="(col, indexC) in viewPokersData"
			:key="indexC"
			@drop="onDrop($event, indexC)"
			@dragover="onColDragover($event, indexC)"
		>
			<div
				class="game-row"
				v-for="(element, indexR) in col"
				:key="indexR"
				@click="overturn(element)"
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
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Modal, message, notification } from 'ant-design-vue';

import poker from './poker';
import { getAssetsFile, getSuit } from '../utils/index';
import { Poker } from './type';
import { cloneDeep } from 'lodash-es';

const DEFAULT_UNVISIBLE_ROWS = 2;
const DEFAULT_COLS = 8;

const data = poker.pokers;

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
				id: new Date().getTime(),
				suit: data[index].suit,
				value: data[index].value,
				row,
				col,
				visible: row < 2 ? false : true
			});
			index++;
		}
		res.push(curCol);
	}

	viewPokersData.value = res;
};

initData();

const restCols = ref<Poker[]>([]);
const onDragstart = async (_event: DragEvent, element: Poker) => {
	const { col, row } = element;
	restCols.value = viewPokersData.value[col!].slice(row!);

	// const gameCol = document.createElement('div');
	// gameCol.className = 'game-col';

	// restCols.value.forEach((item) => {
	// 	const gameRow = document.createElement('div');
	// 	gameRow.className = 'game-row';
	// 	const image = document.createElement('img');
	// 	image.src = getAssetsFile(item.suit + item.value);
	// 	image.width = 120;
	// 	gameRow.appendChild(image);
	// 	gameCol.appendChild(gameRow);
	// });

	// event.dataTransfer?.setDragImage(gameCol, 0, 0);
};

const onDrop = (_event: DragEvent, indexCol: number) => {
	const {
		row: startRow,
		col: startCol,
		suit: startSuit,
		value: startValue
	} = restCols.value[0];

	if (viewPokersData.value[indexCol].length > 0) {
		const lastPoker =
			viewPokersData.value[indexCol][viewPokersData.value[indexCol].length - 1];
		const { suit: endSuit, value: endValue } = lastPoker;

		if (startSuit === endSuit && startValue + 1 === endValue) {
			viewPokersData.value[startCol!].splice(startRow!);
			viewPokersData.value[indexCol].splice(
				viewPokersData.value[indexCol].length,
				0,
				...restCols.value
			);
			rearrange();
		}
	} else {
		viewPokersData.value[startCol!].splice(startRow!);
		viewPokersData.value[indexCol].splice(
			viewPokersData.value[indexCol].length,
			0,
			...restCols.value
		);
		rearrange();
	}
};

const onDragover = (_event: DragEvent, element: Poker, indexCol: number) => {
	const { suit: startSuit, value: startValue } = restCols.value[0];

	const lastPoker =
		viewPokersData.value[indexCol][viewPokersData.value[indexCol].length - 1];
	const { suit: endSuit, value: endValue } = lastPoker;

	if (startSuit === endSuit && startValue + 1 === endValue) {
		if (element.row === viewPokersData.value[indexCol].length - 1) {
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

const overturn = (element: Poker) => {
	const { col, row } = element;

	if (
		viewPokersData.value[col!].length === row! + 1 &&
		element.visible === false
	) {
		element.visible = true;
	}

	// 如果透视功能开启，那也可以翻牌
	if (perspective.value) {
		if (element.visible === false) {
			element.visible = true;

			setTimeout(() => {
				element.visible = false;
			}, 1500);
		}
	}
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
		const lastEle = viewPokersData.value[i][viewPokersData.value[i].length - 1];
		const { suit: lastSuit, value: lastValue, col: lastCol } = lastEle;

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

defineExpose({
	onPerspective,
	onHint,
	setHistoryFile,
	getHistoryFile,
	resetGame
});
</script>

<style scoped lang="less">
.game-wrap {
	height: 100%;
	padding-top: 80px;

	.game-col {
		width: 120px;
		padding-top: 80px;
		display: inline-flex;
		flex-direction: column;
		margin-right: 40px;

		.game-row {
			margin-top: -120px;
			border-radius: 4px;
		}
	}
}
</style>
