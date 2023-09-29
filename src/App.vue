<template>
	<div class="app">
		<h2>纸牌游戏</h2>
		<PokerComponent />
	</div>
</template>

<script setup lang="ts">
import PokerComponent from './components/index.vue';
</script>

<style scoped>
.app {
	display: flex;
	flex-direction: column;
	align-items: center;
	overflow-y: auto;
}
</style>
