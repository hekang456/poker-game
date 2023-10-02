<template>
	<div class="app">
		<a-layout>
			<a-layout-header class="header">纸牌游戏</a-layout-header>
			<a-layout>
				<a-layout-content class="content">
					<PokerComponent ref="pokerRef" />
				</a-layout-content>
				<a-layout-sider class="sider">
					<h2 class="operations">操作组</h2>
					<a-button
						class="button"
						type="primary"
						block
						@click="handlePerspective"
					>
						透视
					</a-button>
					<a-button class="button" type="primary" block>洗牌</a-button>
				</a-layout-sider>
			</a-layout>
		</a-layout>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PokerComponent from './components/index.vue';

const pokerRef = ref();
const handlePerspective = () => {
	pokerRef.value?.onPerspective();
};
</script>

<style scoped lang="less">
.header {
	background-color: #333;
	color: #fff;
	height: 64px;
	line-height: 64px;
	font-size: 18px;
	font-weight: 600;
	text-align: center;
}
.content {
	display: flex;
	align-items: center;
	justify-content: center;
	height: calc(100vh - 64px);
}

.sider {
	background-color: blanchedalmond;
	display: flex;
	flex-direction: column;
	align-self: center;
	width: 100%;
	height: calc(100vh - 64px);
	padding: 16px;

	.operations {
		font-size: 18px;
		font-weight: 600;
		text-align: center;
		color: #000;
	}

	.button {
		margin-bottom: 12px;
	}
}
</style>
