import {createApp} from 'vue';
import {createPinia} from 'pinia';
import './style.css';
import App from './App.vue';
import router from './router';
import {storage} from './services/storage';

await storage.init();
const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.mount('#app');
