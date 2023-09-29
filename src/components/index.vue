<template>
	<div class="game-wrap">
		<div class="game-col" v-for="(col, indexC) in viewPokersData" :key="indexC">
			<draggable
				:list="col"
				:sort="false"
				:move="move"
				group="col"
				itemKey="id"
				@change="onChange"
			>
				<template #item="{ element }">
					<div
						class="game-row"
						:class="{
							mover: element.row + 1 === col.length,
							candrag: element.visible
						}"
						@click="overturn(element)"
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
			</draggable>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import draggable from 'vuedraggable';

import poker from './poker';
import { getAssetsFile } from '../utils/index';
import { Poker } from './type';

const DEFAULT_UNVISIBLE_ROWS = 2;
const DEFAULT_COLS = 8;

const initialPokersData = poker.pokers;

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
			suit: initialPokersData[index].suit,
			value: initialPokersData[index].value,
			row,
			col,
			visible: row < 2 ? false : true
		});
		index++;
	}
	res.push(curCol);
}

viewPokersData.value = res;

const onChange = () => {
	rearrange();
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

function move(ctx: any) {
	console.log(ctx);

	// return false;
}
</script>

<style scoped lang="less">
.game-wrap {
	padding-top: 100px;

	.game-col {
		display: inline-flex;
		flex-direction: column;
		margin-right: 20px;

		.game-row {
			margin-top: -120px;
		}
	}
}
</style>
