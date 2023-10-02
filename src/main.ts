import { createApp } from 'vue';
import App from './App.vue';

import 'ant-design-vue/dist/reset.css';
import 'normalize.css';

import {
	Image,
	Layout,
	LayoutHeader,
	LayoutContent,
	LayoutSider,
	Button
} from 'ant-design-vue';

const components = [
	Image,
	Layout,
	LayoutHeader,
	LayoutContent,
	LayoutSider,
	Button
];

const app = createApp(App);
components.forEach((component) => app.component(component.name, component));
app.mount('#app');
