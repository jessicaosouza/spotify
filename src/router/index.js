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
		meta: {requiresAuth: true},
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

	// só checa sessão se ainda não tiver carregado
	if (!authStore.session) {
		await authStore.checkSession();
	}

	// se a rota exige auth e não tem sessão -> manda pra home
	if (to.meta.requiresAuth && !authStore.session) {
		return next({
			name: 'home',
			query: {
				redirect: to.fullPath,
			},
			state: {error: 'Sessão expirada. Faça login novamente'},
		});
	}

	// qualquer outro caso segue normal
	next();
});

export default router;
