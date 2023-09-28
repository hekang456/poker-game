import { createApp } from 'vue';
import App from './App.vue';

import 'ant-design-vue/dist/reset.css';
import 'normalize.css';

import { Image } from 'ant-design-vue';

const components = [Image];

const app = createApp(App);
components.forEach((component) => app.component(component.name, component));
app.mount('#app');
