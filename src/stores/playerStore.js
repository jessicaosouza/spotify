import {defineStore} from 'pinia';

const audio = new Audio();

export const usePlayerStore = defineStore('player', {
	state: () => ({
		isPlaying: false,
		currentTrack: null,
		currentPlaylist: [],
	}),
	getters: {
		activeTrackId: state => state.currentTrack?.id,
	},
	actions: {
		init() {
			audio.volume = 0.5;
			audio.addEventListener('ended', () => {
				this.nextTrack();
			});

			// ✅ ADICIONAR: Configurar track demo inicial
			this.currentTrack = {
				id: 'demo-1',
				name: 'Demo Track',
				artists: [{name: 'Artist Demo'}],
				album: {
					name: 'Demo Album',
					images: [{url: '/demo-cover.jpg'}],
				},
			};

			// ✅ Configurar o src do áudio
			audio.src = '/demo.mp3';
			audio.load(); // Força o carregamento

			console.log('✅ Player inicializado com track demo');
		},

		async playTrack(track, playlist = []) {
			if (playlist.length) {
				this.currentPlaylist = playlist;
			}

			if (this.currentTrack?.id === track.id) {
				this.togglePlay();
				return;
			}

			this.currentTrack = track;
			audio.pause();
			audio.src = '/demo.mp3';

			this.isPlaying = true;

			try {
				await audio.play();
			} catch (error) {
				if (error.name !== 'AbortError') {
					console.error('Erro ao reproduzir:', error);
					this.isPlaying = false;
				}
			}
		},

		async togglePlay() {
			// ✅ ADICIONAR: Verificação de segurança
			if (!audio.src) {
				console.warn(
					'⚠️ Nenhum áudio carregado! Configure uma track primeiro.',
				);
				return;
			}

			if (audio.paused) {
				this.isPlaying = true;
				try {
					await audio.play();
					console.log('▶️ Tocando...');
				} catch (error) {
					if (error.name !== 'AbortError') {
						console.error('Erro no toggle:', error);
						this.isPlaying = false;
					}
				}
			} else {
				audio.pause();
				this.isPlaying = false;
				console.log('⏸️ Pausado');
			}
		},

		nextTrack() {
			if (!this.currentTrack || this.currentPlaylist.length === 0) return;

			const currentIndex = this.currentPlaylist.findIndex(
				t => t.id === this.currentTrack.id,
			);

			if (currentIndex + 1 < this.currentPlaylist.length) {
				const next = this.currentPlaylist[currentIndex + 1];
				this.playTrack(next);
			} else {
				this.isPlaying = false;
				audio.currentTime = 0;
			}
		},

		prevTrack() {
			if (!this.currentTrack || this.currentPlaylist.length === 0) return;
			const currentIndex = this.currentPlaylist.findIndex(
				t => t.id === this.currentTrack.id,
			);

			if (currentIndex - 1 >= 0) {
				this.playTrack(this.currentPlaylist[currentIndex - 1]);
			}
		},
	},
});
