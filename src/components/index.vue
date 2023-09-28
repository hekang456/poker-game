<template>
	<div class="game-wrap">
		<div class="game-row" v-for="(row, indexR) in viewPokersData" :key="indexR">
			<div class="game-col" v-for="(col, indexC) in row" :key="indexC">
				<a-image
					v-if="col.visible"
					:src="getAssetsFile(col.suit + col.value)"
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
const DEFAULT_VISIBLE_ROWS = 8;

const initialPokersData = poker.pokers;
const viewPokersData = ref<Poker[][]>([]);

let index = 0;

// 填充最上面两排扣住的牌
for (let row = 0; row < DEFAULT_UNVISIBLE_ROWS; row++) {
	const curRow: Poker[] = [];
	for (let col = 0; col < DEFAULT_VISIBLE_ROWS; col++) {
		curRow.push({
			suit: initialPokersData[index].suit,
			value: initialPokersData[index].value,
			row,
			col,
			visible: false
		});
		index++;
	}
	viewPokersData.value.push(curRow);
}

// 填充剩下明牌的牌
for (let row = 0; row < DEFAULT_VISIBLE_ROWS; row++) {
	const curRow: Poker[] = [];
	for (let col = 0; col < DEFAULT_VISIBLE_ROWS - row; col++) {
		curRow.push({
			suit: initialPokersData[index].suit,
			value: initialPokersData[index].value,
			row,
			col,
			visible: true
		});
		index++;
	}
	viewPokersData.value.push(curRow);
}
</script>

<style scoped lang="less">
.game-wrap {
	padding-top: 140px;
	.game-row {
		margin-top: -120px;

		.game-col {
			display: inline-block;
			margin-right: 20px;
		}
	}
}
</style>
