<template>
	<div class="app"><PokerComponent /></div>
</template>

<script setup lang="ts">
import PokerComponent from './components/index.vue';
</script>

<style scoped>
.app {
	display: flex;
	justify-content: center;
	overflow-y: auto;
}
</style>
