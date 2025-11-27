import {createRouter, createWebHistory} from 'vue-router';
import {useAuthStore} from '../stores/authStore';
import Home from '../pages/Home.vue';
import {storage} from '../services/storage';
import {getToken} from '../Helpers/auth';

const routes = [
	{path: '/', name: 'home', component: Home},
	{
		path: '/search/:query?',
		name: 'search',
		component: () => import('../pages/Search.vue'),
	},
	{
		path: '/callback',
		name: 'callback',
		beforeEnter: async (to, from, next) => {
			const code = to.query.code;
			const authStore = useAuthStore();

			if (await getToken(code)) {
				await authStore.checkSession();
				return next('/');
			}

			next({
				name: 'home',
				state: {error: 'Falha no processo de autenticação'},
			});
		},
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

router.beforeEach(async (to, from, next) => {
	const authStore = useAuthStore();

	// if (!authStore.initialized) {
	await authStore.checkSession();
	// }

	if (!to.meta.requiresAuth) {
		return next();
	}

	if (authStore.session) {
		next();
	} else {
		next({
			name: 'home',
			state: {error: 'Sessão expirada. Faça login novamente'},
		});
	}
});

export default router;
