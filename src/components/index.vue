<template>
	<div>
		<!-- <img src="../assets//poker-img/club10.jpg" alt="ll" /> -->
		<!-- <div v-for="p in pokers" :key="p.suit + p.value"> -->
		<a-image :width="200" src="../assets//poker-img/club1.jpg" alt="" />
		<!-- </div> -->
	</div>
</template>

<script setup lang="ts">
import poker from './poker';

const pokers = poker.pokers;

console.log(poker);
</script>
