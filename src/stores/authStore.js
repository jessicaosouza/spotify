import {defineStore} from 'pinia';
import {storage} from '../services/storage';
import {api} from '../services/api';
import {useRoute} from 'vue-router';
import {isTokenExpired, refreshToken} from '../Helpers/auth';

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
			state?.session?.user?.images.find(i => i.width === 64).url,
		getToken: state => state.session?.access_token ?? null,
		getPlaylists: state => {
			if (state.playlists) {
				return state.playlists?.items;
			}
			return [];
		},
		getTopArtists: state => {
			if (state.top_artists) {
				return state.top_artists?.items.slice(0, 7);
			}
			return [];
		},
		getTopTracks: state => {
			if (state.top_tracks) {
				return state.top_tracks?.items.slice(0, 6);
			}
			return [];
		},
	},
	actions: {
		resetSession() {
			this.session = null;
			this.loading = false;
			this.playlists = null;
			this.top_artists = null;
			this.top_tracks = null;
		},
		async checkSession() {
			this.loading = true;
			await storage.init();
			try {
				const sessionData = await storage.hasActiveSession();

				if (!sessionData) {
					this.session = null;
					return;
				}
				if (isTokenExpired(sessionData.expiry)) {
					const renewed = await refreshToken(
						sessionData.refresh_token,
					);
					if (!renewed) {
						this.resetSession();
						await storage.dropSession();
						const router = useRoute();
						router.push({name: 'home'});
						return false;
					}

					const updatedSession = await storage.hasActiveSession();
					this.session = updatedSession;
					return true;
				}
				this.session = sessionData;
			} catch (error) {
				console.error('Erro ao verificar sessão', error);
				this.session = null;
			} finally {
				this.loading = false;
				this.initialized = true; // Avisa que terminou de checar
			}
		},
		async loadPlaylists() {
			if (!this.session || !this.session.access_token) return;
			this.loading = true;

			const cached = await storage.getStore(
				'USER_PLAYLISTS',
				'playlists',
			);

			if (cached) {
				cached.value = JSON.parse(cached.value);
				this.playlists = cached.value;
			} else {
				const response = await api.get(
					`users/${this.session.user.id}/playlists`,
				);

				this.playlists = response;

				if (response) {
					storage.storePlaylist(
						'USER_PLAYLISTS',
						JSON.stringify(this.playlists),
					);
				}
			}
			this.loading = false;
		},
		async loadTopItems(category) {
			if (!this.session) return;
			this.loading = true;
			const locale = category === 'artists' ? '' : 'pt_br';
			const storage_name = `TOP_${category}`.toUpperCase();
			let cached = await storage.getStore(storage_name, 'playlists');
			if (!cached) {
				cached = await api.get(
					`me/top/${category}?locale=${locale}&time_range=long_term`,
				);
				storage.storePlaylist(storage_name, JSON.stringify(cached));
			} else {
				cached.value = JSON.parse(cached.value);
			}

			if (category === 'artists') {
				this.top_artists = cached.value;
			} else {
				this.top_tracks = cached.value;
			}
			this.loading = false;
		},
	},
});
