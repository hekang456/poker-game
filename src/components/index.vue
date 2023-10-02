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

import poker from './poker';
import { getAssetsFile } from '../utils/index';
import { Poker } from './type';

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

let index = 0;
const res = [];

// 按照列来填充
for (let col = 0; col < DEFAULT_COLS; col++) {
	const curCol: Poker[] = [];
	for (let row = 0; row < DEFAULT_UNVISIBLE_ROWS + DEFAULT_COLS - col; row++) {
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

console.log(viewPokersData.value);

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
};
</script>

<style scoped lang="less">
.game-wrap {
	height: 100%;
	padding-top: 80px;

	.game-col {
		width: 120px;
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
