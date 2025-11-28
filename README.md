# 🎵 Roteiro Aula Clone Spotify - 8 Horas

**Estratégia:** Intercalar interface e lógica para ver resultados em tempo real

---

## 📋 PRÉ-AULA (Fazer antes)

### Criar App no Spotify Dashboard

1. Acesse: https://developer.spotify.com/dashboard
2. Create app
3. Preencha:
    - Nome: Spotify Clone Aula
    - Redirect URI: `http://127.0.0.1:5173/callback`
4. Copie o **Client ID**

---

## MANHÃ - PARTE 1: SETUP E PRIMEIRA TELA (8:00-10:00)

### 1. Criar Projeto (5min)

```bash
npm create vite@latest spotify --template vue
cd spotify
npm install
npm install vue-router@4 pinia lucide-vue-next tailwindcss @tailwindcss/vite
```

### 2. Configurar Vite (5min)

**`vite.config.js`**

```javascript
import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [vue(), tailwindcss()],
	server: {
		host: '127.0.0.1',
		port: 5173,
	},
});
```

### 3. Configurar Tailwind (10min)

**`src/style.css`**

```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
@import 'tailwindcss';

@theme {
	--font-family-sans: 'Poppins', ui-sans-serif, system-ui, sans-serif;
	--color-sblack: #121212;
	--color-sblack-100: #282828;
	--color-sblack-200: #1f1f1f;
	--color-sblack-300: #181818;
	--color-sgray-100: #b3b3b3;
	--color-sgreen-100: #1fdf64;
	--color-sgreen-200: #1ed760;
}

body {
	font-family: var(--font-family-sans);
	background: var(--color-sblack);
	margin: 0;
	padding: 0;
}
```

### 4. Criar `.env` (5min)

**`.env`**

```env
VITE_CLIENT_ID=SEU_CLIENT_ID_AQUI
VITE_REDIRECT_URL=http://127.0.0.1:5173/callback
VITE_AUTH_ENDPOINT=https://accounts.spotify.com/authorize
VITE_TOKEN_ENDPOINT=https://accounts.spotify.com/api/token
VITE_BASE_URL=https://api.spotify.com/v1
VITE_SCOPE=user-read-private user-read-email user-top-read playlist-read-private playlist-read-collaborative
```

### 5. Estrutura de Pastas (2min)

```bash
mkdir src/components src/pages src/stores src/services src/Helpers src/router
```

### 6. Configurar Router Básico (10min)

**`src/router/index.js`**

```javascript
import {createRouter, createWebHistory} from 'vue-router';

const routes = [
	{
		path: '/',
		name: 'home',
		component: () => import('../pages/Home.vue'),
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
```

**`src/main.js`**

```javascript
import {createApp} from 'vue';
import './style.css';
import App from './App.vue';
import router from './router';

createApp(App).use(router).mount('#app');
```

**`src/App.vue`**

```vue
<script setup>
import {useRoute} from 'vue-router';
const route = useRoute();
</script>

<template>
	<router-view :key="route.path"></router-view>
</template>
```

### 7. 🎨 PRIMEIRA INTERFACE - Tela de Login (15min)

**`src/pages/Home.vue`**

```vue
<script setup></script>

<template>
	<div
		class="flex flex-col h-screen bg-sblack text-white w-full items-center justify-center">
		<div class="flex flex-col items-center">
			<!-- Logo Spotify (por enquanto só texto) -->
			<h1 class="text-6xl font-bold mb-4">
				<span class="text-sgreen-100">Spotify</span> Clone
			</h1>

			<p class="mb-10 text-lg text-sgray-100 text-center max-w-md">
				Conecte-se para curtir músicas ilimitadas e podcasts só com
				alguns anúncios.
			</p>

			<button
				type="button"
				class="bg-sgreen-100 hover:bg-sgreen-200 text-sblack font-bold py-4 px-8 rounded-full 
               transition-all duration-300 hover:scale-105">
				Entrar com Spotify
			</button>
		</div>
	</div>
</template>
```

**✅ TESTAR:** `npm run dev` → Ver tela de login bonita!

---

## ☕ BREAK (10min)

---

## MANHÃ - PARTE 2: AUTENTICAÇÃO FUNCIONAL (10:10-12:00)

### 8. 🔐 Helper de Autenticação (30min)

**`src/Helpers/auth.js`**

```javascript
const generateRandomString = length => {
	const possible =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const values = crypto.getRandomValues(new Uint8Array(length));
	return values.reduce((acc, x) => acc + possible[x % possible.length], '');
};

const base64encode = input => {
	return btoa(String.fromCharCode(...new Uint8Array(input)))
		.replace(/=/g, '')
		.replace(/\+/g, '-')
		.replace(/\//g, '_');
};

const sha256 = async plain => {
	const encoder = new TextEncoder();
	const data = encoder.encode(plain);
	return window.crypto.subtle.digest('SHA-256', data);
};

export const getLoginURL = async () => {
	const codeVerifier = generateRandomString(64);
	const hashed = await sha256(codeVerifier);
	const codeChallenge = base64encode(hashed);

	window.localStorage.setItem('verifier', codeVerifier);
	const auth_url = new URL(import.meta.env.VITE_AUTH_ENDPOINT);

	const payload = {
		response_type: 'code',
		client_id: import.meta.env.VITE_CLIENT_ID,
		scope: import.meta.env.VITE_SCOPE,
		code_challenge_method: 'S256',
		code_challenge: codeChallenge,
		redirect_uri: import.meta.env.VITE_REDIRECT_URL,
	};

	auth_url.search = new URLSearchParams(payload).toString();
	return auth_url.toString();
};

export const logout = async () => {
	// Por enquanto só limpa localStorage
	localStorage.clear();
};
```

**💡 EXPLICAR:** OAuth 2.0 + PKCE (segurança sem expor secret no frontend)

### 9. 🎨 CONECTAR BOTÃO DE LOGIN (5min)

**`src/pages/Home.vue`** (atualizar)

```vue
<script setup>
import {getLoginURL} from '../Helpers/auth';

const spotifyLogin = async () => {
	window.location.href = await getLoginURL();
};
</script>

<template>
	<div
		class="flex flex-col h-screen bg-sblack text-white w-full items-center justify-center">
		<div class="flex flex-col items-center">
			<h1 class="text-6xl font-bold mb-4">
				<span class="text-sgreen-100">Spotify</span> Clone
			</h1>

			<p class="mb-10 text-lg text-sgray-100 text-center max-w-md">
				Conecte-se para curtir músicas ilimitadas e podcasts só com
				alguns anúncios.
			</p>

			<button
				type="button"
				@click="spotifyLogin()"
				class="bg-sgreen-100 hover:bg-sgreen-200 text-sblack font-bold py-4 px-8 rounded-full 
               transition-all duration-300 hover:scale-105 cursor-pointer">
				Entrar com Spotify
			</button>
		</div>
	</div>
</template>
```

**✅ TESTAR:** Clicar no botão → deve redirecionar para Spotify!

### 10. 💾 IndexedDB Storage (40min)

**`src/services/storage.js`**

```javascript
let db;
const DB_NAME = 'spotify';
const DB_VERSION = 1;

const openDatabase = () => {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onsuccess = function (event) {
			resolve(event.target.result);
		};

		request.onupgradeneeded = function (event) {
			const connection = event.target.result;

			if (!connection.objectStoreNames.contains('session')) {
				connection.createObjectStore('session');
			}

			if (!connection.objectStoreNames.contains('playlists')) {
				connection.createObjectStore('playlists');
			}
		};

		request.onerror = function (event) {
			reject(`Erro ao abrir banco: ${event.target.errorCode}`);
		};
	});
};

const init = async () => {
	if (db) return;
	try {
		db = await openDatabase();
	} catch (error) {
		console.error(error);
	}
};

const hasActiveSession = async () => {
	if (!db) return null;
	return new Promise(resolve => {
		try {
			const transaction = db.transaction(['session'], 'readonly');
			const store = transaction.objectStore('session');
			const request = store.get('active');

			request.onsuccess = function (event) {
				resolve(event.target.result || null);
			};

			request.onerror = function () {
				resolve(null);
			};
		} catch (error) {
			resolve(null);
		}
	});
};

const setActiveSession = data => {
	if (!db) return Promise.resolve();

	return new Promise((resolve, reject) => {
		const transaction = db.transaction(['session'], 'readwrite');
		const store = transaction.objectStore('session');

		const payload = {
			access_token: data.access_token,
			refresh_token: data.refresh_token,
			expires_in: data.expires_in,
			expiry: data.expiry,
			user: data.user,
		};

		const request = store.put(payload, 'active');
		request.onsuccess = () => resolve();
		request.onerror = event => reject(event.target.error);
	});
};

const dropSession = async () => {
	if (db) {
		db.close();
		db = null;
	}

	return new Promise((resolve, reject) => {
		const request = indexedDB.deleteDatabase(DB_NAME);
		request.onsuccess = () => resolve();
		request.onerror = event => reject(event.target.error);
	});
};

const storePlaylist = (type, data) => {
	if (!db) return Promise.resolve();

	return new Promise((resolve, reject) => {
		const transaction = db.transaction(['playlists'], 'readwrite');
		const store = transaction.objectStore('playlists');
		const request = store.put({type, value: data}, type);

		request.onsuccess = () => resolve();
		request.onerror = event => reject(event.target.error);
	});
};

const getStore = (key, table) => {
	if (!db) return Promise.resolve(null);

	return new Promise((resolve, reject) => {
		const transaction = db.transaction([table], 'readonly');
		const store = transaction.objectStore(table);
		const request = store.get(key);

		request.onsuccess = () => resolve(request.result);
		request.onerror = event => reject(event.target.error);
	});
};

export const storage = {
	init,
	hasActiveSession,
	setActiveSession,
	dropSession,
	storePlaylist,
	getStore,
};
```

**💡 EXPLICAR:** Por que IndexedDB? (capacidade, assíncrono, transações)

### 11. 🔐 Completar Auth Helpers (30min)

**`src/Helpers/auth.js`** (adicionar ao arquivo existente)

```javascript
import {storage} from '../services/storage';

// ... código anterior (generateRandomString, etc) ...

const getUserData = async token => {
	const request = await fetch(import.meta.env.VITE_BASE_URL + '/me', {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${token}`,
		},
	});

	if (!request.ok) {
		throw new Error(`Erro ao buscar usuário: ${request.status}`);
	}

	const response = await request.json();
	return {
		id: response.id,
		display_name: response.display_name,
		email: response.email,
		followers: response.followers,
		images: response.images,
		uri: response.uri,
	};
};

const saveSession = async authResponse => {
	const {access_token, refresh_token, expires_in} = authResponse;

	if (!access_token) {
		throw new Error('Token inválido');
	}

	const now = new Date();
	const expiry = new Date(now.getTime() + expires_in * 1000);
	const user = await getUserData(access_token);

	const session = {
		access_token,
		refresh_token,
		expires_in,
		expiry,
		user,
	};

	await storage.setActiveSession(session);
	return session;
};

export const isTokenExpired = expires => {
	const expireDate = new Date(expires);
	const now = new Date();
	const fiveMinutes = 5 * 60 * 1000;
	return expireDate.getTime() - now.getTime() < fiveMinutes;
};

export const refreshToken = async refresh_token => {
	const url = import.meta.env.VITE_TOKEN_ENDPOINT;
	const payload = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			client_id: import.meta.env.VITE_CLIENT_ID,
			grant_type: 'refresh_token',
			refresh_token: refresh_token,
		}),
	};

	try {
		const body = await fetch(url, payload);

		if (!body.ok) {
			console.error('Erro ao renovar token:', body.status);
			return false;
		}

		const response = await body.json();

		if (response.error) {
			console.error('Erro na resposta:', response.error);
			return false;
		}

		if (!response.refresh_token) {
			response.refresh_token = refresh_token;
		}

		await saveSession(response);
		return true;
	} catch (error) {
		console.error('Erro ao renovar token:', error);
		return false;
	}
};

export const getToken = async code => {
	const verifier = localStorage.getItem('verifier');

	if (!verifier) {
		console.error('Verifier não encontrado');
		return false;
	}

	const url = import.meta.env.VITE_TOKEN_ENDPOINT;
	const payload = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			client_id: import.meta.env.VITE_CLIENT_ID,
			grant_type: 'authorization_code',
			code,
			redirect_uri: import.meta.env.VITE_REDIRECT_URL,
			code_verifier: verifier,
		}),
	};

	try {
		const body = await fetch(url, payload);

		if (!body.ok) {
			console.error('Erro ao obter token:', body.status);
			return false;
		}

		const response = await body.json();

		if (response.error) {
			console.error('Erro na resposta:', response.error);
			return false;
		}

		await saveSession(response);
		localStorage.removeItem('verifier');
		return true;
	} catch (error) {
		console.error(error);
		return false;
	}
};

export const logout = async () => {
	await storage.dropSession();
};
```

---

## 🍽️ ALMOÇO (12:00-13:00)

---

## TARDE - PARTE 3: PINIA E ESTADO (13:00-14:30)

### 12. Configurar Pinia (10min)

**`src/main.js`** (atualizar)

```javascript
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
```

### 13. 📦 AuthStore (40min)

**`src/stores/authStore.js`**

```javascript
import {defineStore} from 'pinia';
import {storage} from '../services/storage';
import {isTokenExpired, refreshToken} from '../Helpers/auth';
import router from '../router';

export const useAuthStore = defineStore('auth', {
	state: () => ({
		session: null,
		initialized: false,
		loading: false,
		playlists: null,
		top_artists: null,
		top_tracks: null,
	}),

	getters: {
		isLoggedIn: state => state.session !== null,
		navPicture: state =>
			state?.session?.user?.images.find(i => i.width === 64)?.url,
		getToken: state => state.session?.access_token ?? null,
		getPlaylists: state => state.playlists?.items || [],
		getTopArtists: state => state.top_artists?.items.slice(0, 7) || [],
		getTopTracks: state => state.top_tracks?.items.slice(0, 6) || [],
	},

	actions: {
		resetSession() {
			this.session = null;
			this.loading = false;
			this.playlists = null;
			this.top_artists = null;
			this.top_tracks = null;
		},

		async handleSessionExpired() {
			console.warn('Sessão expirada');
			this.resetSession();
			await storage.dropSession();
			router.push({name: 'home'});
		},

		async checkSession() {
			this.loading = true;
			await storage.init();

			try {
				const sessionData = await storage.hasActiveSession();

				if (!sessionData) {
					this.session = null;
					return false;
				}

				if (isTokenExpired(sessionData.expiry)) {
					const renewed = await refreshToken(
						sessionData.refresh_token,
					);

					if (!renewed) {
						await this.handleSessionExpired();
						return false;
					}

					const updatedSession = await storage.hasActiveSession();
					this.session = updatedSession;
					return true;
				}

				this.session = sessionData;
				return true;
			} catch (error) {
				console.error('Erro ao verificar sessão', error);
				await this.handleSessionExpired();
				return false;
			} finally {
				this.loading = false;
				this.initialized = true;
			}
		},

		async loadPlaylists() {
			if (!this.session) return;
			this.loading = true;

			try {
				const cached = await storage.getStore(
					'USER_PLAYLISTS',
					'playlists',
				);

				if (cached) {
					this.playlists = JSON.parse(cached.value);
				} else {
					// Vamos implementar api.get depois
					console.log('Carregar playlists da API');
				}
			} catch (error) {
				console.error('Erro ao carregar playlists:', error);
			} finally {
				this.loading = false;
			}
		},

		async loadTopItems(category) {
			if (!this.session) return;
			this.loading = true;

			try {
				const storage_name = `TOP_${category}`.toUpperCase();
				let cached = await storage.getStore(storage_name, 'playlists');

				if (cached) {
					cached = {value: JSON.parse(cached.value)};
				} else {
					console.log(`Carregar top ${category} da API`);
				}

				if (category === 'artists') {
					this.top_artists = cached?.value;
				} else {
					this.top_tracks = cached?.value;
				}
			} catch (error) {
				console.error(`Erro ao carregar top ${category}:`, error);
			} finally {
				this.loading = false;
			}
		},
	},
});
```

### 14. 🔐 Router Guards e Callback (30min)

**`src/router/index.js`** (atualizar)

```javascript
import {createRouter, createWebHistory} from 'vue-router';
import {useAuthStore} from '../stores/authStore';
import {getToken} from '../Helpers/auth';

const routes = [
	{
		path: '/',
		name: 'home',
		component: () => import('../pages/Home.vue'),
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

			next({name: 'home'});
		},
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

router.beforeEach(async (to, from, next) => {
	const authStore = useAuthStore();

	if (!authStore.initialized) {
		await authStore.checkSession();
	}

	if (to.meta.requiresAuth && !authStore.session) {
		return next({name: 'home'});
	}

	next();
});

export default router;
```

### 15. 🎨 HOME LOGADA - Primeira Versão (10min)

**`src/pages/Home.vue`** (atualizar)

```vue
<script setup>
import {useAuthStore} from '../stores/authStore';
import {getLoginURL} from '../Helpers/auth';

const authStore = useAuthStore();

const spotifyLogin = async () => {
	window.location.href = await getLoginURL();
};
</script>

<template>
	<!-- Não logado -->
	<div
		v-if="!authStore.session"
		class="flex flex-col h-screen bg-sblack text-white w-full items-center justify-center">
		<div class="flex flex-col items-center">
			<h1 class="text-6xl font-bold mb-4">
				<span class="text-sgreen-100">Spotify</span> Clone
			</h1>

			<p class="mb-10 text-lg text-sgray-100 text-center max-w-md">
				Conecte-se para curtir músicas ilimitadas e podcasts só com
				alguns anúncios.
			</p>

			<button
				type="button"
				@click="spotifyLogin()"
				class="bg-sgreen-100 hover:bg-sgreen-200 text-sblack font-bold py-4 px-8 rounded-full 
               transition-all duration-300 hover:scale-105 cursor-pointer">
				Entrar com Spotify
			</button>
		</div>
	</div>

	<!-- Logado -->
	<div
		v-else
		class="flex flex-col h-screen bg-sblack text-white w-full items-center justify-center">
		<h1 class="text-4xl font-bold mb-4">Bem-vindo!</h1>
		<p class="text-sgray-100 mb-4">
			{{ authStore.session.user.display_name }}
		</p>
		<img
			v-if="authStore.navPicture"
			:src="authStore.navPicture"
			alt="Avatar"
			class="w-32 h-32 rounded-full mb-4" />
		<p class="text-sm text-sgray-100">Vamos construir a interface agora!</p>
	</div>
</template>
```

**✅ TESTAR:** Login completo → Ver nome e foto do usuário!

---

## ☕ BREAK (15min)

---

## TARDE - PARTE 4: LAYOUT E COMPONENTES (14:45-16:00)

### 16. 🎨 AppContainer (15min)

**`src/components/AppContainer.vue`**

```vue
<script setup>
import AppNavigation from './AppNavigation.vue';
</script>

<template>
	<div class="flex flex-col h-screen bg-sblack">
		<app-navigation />
		<slot />
	</div>
</template>
```

### 17. 🎨 AppNavigation (20min)

**`src/components/AppNavigation.vue`**

```vue
<script setup>
import {Search, LogOut} from 'lucide-vue-next';
import {useAuthStore} from '../stores/authStore';
import {logout} from '../Helpers/auth';
import {useRouter} from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = async () => {
	await logout();
	authStore.resetSession();
	router.push('/');
};
</script>

<template>
	<nav
		v-if="authStore.session"
		class="fixed top-0 left-0 right-0 bg-sblack-100 z-50 px-6 py-4">
		<div class="flex items-center justify-between">
			<!-- Logo -->
			<div class="flex items-center gap-4">
				<h2 class="text-2xl font-bold text-white">
					<span class="text-sgreen-100">Spotify</span>
				</h2>
			</div>

			<!-- Search -->
			<div class="flex-1 max-w-xl mx-8">
				<div class="relative">
					<Search
						class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sgray-100" />
					<input
						type="text"
						placeholder="O que você quer ouvir?"
						class="w-full bg-white text-sblack rounded-full py-3 pl-12 pr-4 focus:outline-none" />
				</div>
			</div>

			<!-- User -->
			<div class="flex items-center gap-4">
				<img
					v-if="authStore.navPicture"
					:src="authStore.navPicture"
					alt="Avatar"
					class="w-10 h-10 rounded-full" />
				<span class="text-white font-medium">{{
					authStore.session.user.display_name
				}}</span>
				<button
					@click="handleLogout"
					class="p-2 hover:bg-sblack-200 rounded-full transition">
					<LogOut class="w-5 h-5 text-sgray-100" />
				</button>
			</div>
		</div>
	</nav>
</template>
```

### 18. 🎨 AppSidebar (25min)

**`src/components/AppSidebar.vue`**

```vue
<script setup>
import {Home, Search, Library} from 'lucide-vue-next';
import {useAuthStore} from '../stores/authStore';
import AppPlaylistCard from './AppPlaylistCard.vue';

const authStore = useAuthStore();
</script>

<template>
	<div class="w-[20%] bg-sblack h-[83vh] rounded-lg p-4 overflow-y-auto">
		<!-- Menu -->
		<div class="mb-6">
			<a
				href="/"
				class="flex items-center gap-4 text-white hover:text-sgreen-100 py-3 px-2 rounded transition">
				<Home class="w-6 h-6" />
				<span class="font-semibold">Início</span>
			</a>
			<a
				href="/search"
				class="flex items-center gap-4 text-sgray-100 hover:text-white py-3 px-2 rounded transition">
				<Search class="w-6 h-6" />
				<span class="font-semibold">Buscar</span>
			</a>
			<div class="flex items-center gap-4 text-sgray-100 py-3 px-2">
				<Library class="w-6 h-6" />
				<span class="font-semibold">Sua Biblioteca</span>
			</div>
		</div>

		<!-- Playlists -->
		<div class="border-t border-sblack-200 pt-4">
			<h3 class="text-sgray-100 font-bold text-sm mb-4 px-2">
				PLAYLISTS
			</h3>

			<div v-if="authStore.getPlaylists.length">
				<app-playlist-card
					v-for="playlist in authStore.getPlaylists"
					:key="playlist.id"
					:playlist="playlist" />
			</div>

			<p
				v-else
				class="text-sgray-100 text-sm px-2">
				Carregando playlists...
			</p>
		</div>
	</div>
</template>
```

### 19. 🎨 AppPlaylistCard (10min)

**`src/components/AppPlaylistCard.vue`**

```vue
<script setup>
defineProps(['playlist']);
</script>

<template>
	<div
		class="flex items-center gap-3 p-2 hover:bg-sblack-200 rounded cursor-pointer transition">
		<img
			:src="playlist.images[0]?.url || '/placeholder.png'"
			alt="Playlist"
			class="w-12 h-12 rounded" />
		<div class="flex-1 min-w-0">
			<p class="text-white text-sm font-medium truncate">
				{{ playlist.name }}
			</p>
			<p class="text-sgray-100 text-xs truncate">
				{{ playlist.owner.display_name }}
			</p>
		</div>
	</div>
</template>
```

### 20. 🎨 Atualizar Home com Layout (10min)

**`src/pages/Home.vue`** (atualizar)

```vue
<script setup>
import AppContainer from '../components/AppContainer.vue';
import AppSidebar from '../components/AppSidebar.vue';
import {useAuthStore} from '../stores/authStore';
import {getLoginURL} from '../Helpers/auth';

const authStore = useAuthStore();

const spotifyLogin = async () => {
	window.location.href = await getLoginURL();
};
</script>

<template>
	<app-container>
		<!-- Não logado -->
		<div
			v-if="!authStore.session"
			class="flex flex-col h-screen text-white w-full items-center justify-center">
			<div class="flex flex-col items-center">
				<h1 class="text-6xl font-bold mb-4">
					<span class="text-sgreen-100">Spotify</span> Clone
				</h1>

				<p class="mb-10 text-lg text-sgray-100 text-center max-w-md">
					Conecte-se para curtir músicas ilimitadas e podcasts só com
					alguns anúncios.
				</p>

				<button
					type="button"
					@click="spotifyLogin()"
					class="bg-sgreen-100 hover:bg-sgreen-200 text-sblack font-bold py-4 px-8 rounded-full 
                 transition-all duration-300 hover:scale-105 cursor-pointer">
					Entrar com Spotify
				</button>
			</div>
		</div>

		<!-- Logado -->
		<div
			v-else
			class="w-full pt-16 px-2">
			<div class="flex gap-2">
				<app-sidebar />

				<div
					class="w-[80%] bg-sblack overflow-y-auto overflow-x-hidden p-10 h-[83vh] rounded-lg">
					<h2 class="text-white text-3xl font-bold mb-6">
						Bem-vindo de volta!
					</h2>
					<p class="text-sgray-100">
						Vamos adicionar músicas e artistas aqui...
					</p>
				</div>
			</div>
		</div>
	</app-container>
</template>
```

**✅ TESTAR:** Ver layout completo com navegação e sidebar!

---

## ☕ BREAK (15min)

---

## TARDE - PARTE 5: API E DADOS REAIS (16:15-17:00)

### 21. 🌐 API Service (15min)

**`src/services/api.js`**

```javascript
import {useAuthStore} from '../stores/authStore';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const api = {
	async get(endpoint) {
		const authStore = useAuthStore();
		const token = authStore.getToken;

		if (!token) {
			throw new Error('Token inválido');
		}

		try {
			const body = await fetch(`${BASE_URL}/${endpoint}`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!body.ok) {
				console.error(`Erro HTTP ${body.status}`);
				return null;
			}

			const response = await body.json();

			if (response.error) {
				console.error('Erro na resposta:', response.error);
				return null;
			}

			return response;
		} catch (error) {
			console.error('Erro na requisição:', error);
			return null;
		}
	},
};
```

### 22. 📦 Atualizar AuthStore com API (15min)

**`src/stores/authStore.js`** (atualizar os métodos)

```javascript
// ... imports e código anterior ...

import {api} from '../services/api';

// ... state, getters, resetSession, handleSessionExpired, checkSession ...

async loadPlaylists() {
  if (!this.session) return;
  this.loading = true;

  try {
    const cached = await storage.getStore('USER_PLAYLISTS', 'playlists');

    if (cached) {
      this.playlists = JSON.parse(cached.value);
    } else {
      const response = await api.get(`users/${this.session.user.id}/playlists`);
      if (response) {
        this.playlists = response;
        storage.storePlaylist('USER_PLAYLISTS', JSON.stringify(response));
      }
    }
  } catch (error) {
    console.error('Erro ao carregar playlists:', error);
  } finally {
    this.loading = false;
  }
},

async loadTopItems(category) {
  if (!this.session) return;
  this.loading = true;

  try {
    const locale = category === 'artists' ? '' : 'pt_br';
    const storage_name = `TOP_${category}`.toUpperCase();
    let cached = await storage.getStore(storage_name, 'playlists');

    if (!cached) {
      cached = await api.get(`me/top/${category}?locale=${locale}&time_range=long_term`);
      storage.storePlaylist(storage_name, JSON.stringify(cached));
    } else {
      cached = {value: JSON.parse(cached.value)};
    }

    if (category === 'artists') {
      this.top_artists = cached.value;
    } else {
      this.top_tracks = cached.value;
    }
  } catch (error) {
    console.error(`Erro ao carregar top ${category}:`, error);
  } finally {
    this.loading = false;
  }
},
```

### 23. 🎨 Cards de Artistas e Tracks (20min)

**`src/components/AppArtistCard.vue`**

```vue
<script setup>
defineProps(['item']);
</script>

<template>
	<div
		class="min-w-[180px] p-4 bg-sblack-300 hover:bg-sblack-200 rounded-lg transition cursor-pointer">
		<img
			:src="item.images[0]?.url"
			alt="Artist"
			class="w-full aspect-square rounded-full mb-4 object-cover" />
		<h3 class="text-white font-semibold truncate mb-1">{{ item.name }}</h3>
		<p class="text-sgray-100 text-sm capitalize">{{ item.type }}</p>
	</div>
</template>
```

**`src/components/AppTrackCard.vue`**

```vue
<script setup>
defineProps(['item']);
</script>

<template>
	<div
		class="min-w-[180px] p-4 bg-sblack-300 hover:bg-sblack-200 rounded-lg transition cursor-pointer">
		<img
			:src="item.album.images[0]?.url"
			alt="Album"
			class="w-full aspect-square rounded mb-4 object-cover" />
		<h3 class="text-white font-semibold truncate mb-1">{{ item.name }}</h3>
		<p class="text-sgray-100 text-sm truncate">
			{{ item.artists.map(a => a.name).join(', ') }}
		</p>
	</div>
</template>
```

### 24. 🎨 Home com Dados Reais (10min)

**`src/pages/Home.vue`** (atualizar área logada)

```vue
<script setup>
import AppContainer from '../components/AppContainer.vue';
import AppSidebar from '../components/AppSidebar.vue';
import AppArtistCard from '../components/AppArtistCard.vue';
import AppTrackCard from '../components/AppTrackCard.vue';
import {useAuthStore} from '../stores/authStore';
import {getLoginURL} from '../Helpers/auth';
import {watch} from 'vue';

const authStore = useAuthStore();

const spotifyLogin = async () => {
	window.location.href = await getLoginURL();
};

// Carregar dados quando logar
watch(
	() => authStore.session,
	newSession => {
		if (newSession && newSession.access_token) {
			authStore.loadPlaylists();
			authStore.loadTopItems('artists');
			authStore.loadTopItems('tracks');
		}
	},
	{immediate: true},
);
</script>

<template>
	<app-container>
		<!-- Não logado -->
		<div
			v-if="!authStore.session"
			class="flex flex-col h-screen text-white w-full items-center justify-center">
			<div class="flex flex-col items-center">
				<h1 class="text-6xl font-bold mb-4">
					<span class="text-sgreen-100">Spotify</span> Clone
				</h1>

				<p class="mb-10 text-lg text-sgray-100 text-center max-w-md">
					Conecte-se para curtir músicas ilimitadas e podcasts só com
					alguns anúncios.
				</p>

				<button
					type="button"
					@click="spotifyLogin()"
					class="bg-sgreen-100 hover:bg-sgreen-200 text-sblack font-bold py-4 px-8 rounded-full 
                 transition-all duration-300 hover:scale-105 cursor-pointer">
					Entrar com Spotify
				</button>
			</div>
		</div>

		<!-- Logado -->
		<div
			v-else
			class="w-full pt-16 px-2">
			<div class="flex gap-2">
				<app-sidebar />

				<div
					class="w-[80%] bg-sblack overflow-y-auto overflow-x-hidden p-10 h-[83vh] rounded-lg">
					<!-- Top Artistas -->
					<div class="mb-8">
						<h2 class="text-white font-bold text-2xl mb-6">
							Top Artistas Recomendados
						</h2>
						<div class="flex gap-4 overflow-x-auto pb-4">
							<app-artist-card
								v-for="item in authStore.getTopArtists"
								:key="item.id"
								:item="item" />
						</div>
					</div>

					<!-- Top Tracks -->
					<div>
						<h2 class="text-white font-bold text-2xl mb-6">
							Recomendados para Você
						</h2>
						<div class="flex gap-4 overflow-x-auto pb-4">
							<app-track-card
								v-for="item in authStore.getTopTracks"
								:key="item.id"
								:item="item" />
						</div>
					</div>
				</div>
			</div>
		</div>
	</app-container>
</template>
```

**✅ TESTAR:** Ver seus artistas e músicas mais ouvidos aparecerem!

---

## 🎉 PARABÉNS! APP FUNCIONAL!

Neste ponto você tem:

- ✅ Login com Spotify
- ✅ Sessão persistente
- ✅ Layout completo
- ✅ Playlists na sidebar
- ✅ Top artistas e tracks

---

## BÔNUS: Se der tempo, adicionar Player

### 25. 📦 PlayerStore (colar o arquivo que você tem)

### 26. 🎨 Componentes do Player (colar os arquivos)

- AppPlayer.vue
- AppPlayerProgress.vue
- AppPlayerVolume.vue
- Ícones (Play, Pause, Next, Previous)

### 27. Adicionar arquivos demo

- `public/demo.mp3`
- `public/demo-cover.jpg`

### 28. Atualizar AppContainer

```vue
<script setup>
import AppNavigation from './AppNavigation.vue';
import AppPlayer from './AppPlayer.vue';
</script>

<template>
	<div class="flex flex-col h-screen bg-sblack">
		<app-navigation />
		<slot />
		<app-player />
	</div>
</template>
```

---

## 📚 REVISÃO FINAL

### Conceitos Abordados:

1. ✅ Vite + Vue 3
2. ✅ Tailwind CSS customizado
3. ✅ Vue Router + Guards
4. ✅ Pinia para estado global
5. ✅ OAuth 2.0 + PKCE
6. ✅ IndexedDB para persistência
7. ✅ Refresh token automático
8. ✅ Spotify Web API
9. ✅ Componentes reutilizáveis
10. ✅ Watchers reativos

### Para Casa:

- [ ] Adicionar página de busca
- [ ] Implementar player funcional completo
- [ ] Adicionar página de playlist individual
- [ ] Melhorar responsividade

---

**FIM DA AULA! 🎊**
