import {defineStore} from 'pinia';

const audio = new Audio();

export const usePlayerStore = defineStore('player', {
	state: () => ({
		isPlaying: false,
		currentTrack: null,
		currentPlaylist: [],
		currentTime: 0,
		duration: 0,
		volume: 50,
		previousVolume: 50,
	}),
	getters: {
		activeTrackId: state => state.currentTrack?.id,
		name: state => state.currentTrack?.name,
		artists: state =>
			state.currentTrack?.artists.map(a => a.name).join(', '),
		albumCover: state => state.currentTrack?.album.images[0]?.url,
	},
	actions: {
		init() {
			audio.volume = this.volume / 100;

			audio.addEventListener('timeupdate', () => {
				this.currentTime = audio.currentTime;
				this.duration = audio.duration || 0;
			});

			audio.addEventListener('loadedmetadata', () => {
				this.duration = audio.duration;
				this.currentTime = 0;
			});

			this.currentTrack = {
				id: 'demo-1',
				name: 'On & On',
				artists: [
					{name: 'Cartoon'},
					{name: 'Jéja'},
					{name: 'Daniel Levi'},
				],
				album: {
					name: 'Demo Album',
					images: [{url: '/demo-cover.jpg'}],
				},
			};

			audio.src = '/demo.mp3';
			audio.load();
		},

		setVolume(value) {
			// Garante que fique entre 0 e 100
			let newVolume = Math.max(0, Math.min(100, value));

			this.volume = newVolume;
			audio.volume = newVolume / 100; // API Nativa usa 0.0 a 1.0
		},

		toggleMute() {
			if (this.volume > 0) {
				// Vai mutar
				this.previousVolume = this.volume;
				this.setVolume(0);
			} else {
				// Vai desmutar (volta para o anterior ou 50 se for zero)
				this.setVolume(this.previousVolume || 50);
			}
		},

		seek(percentage) {
			if (!this.duration) return;

			const timeToSeek = (this.duration * percentage) / 100;
			audio.currentTime = timeToSeek;
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
			if (audio.paused) {
				this.isPlaying = true;
				try {
					await audio.play();
				} catch (error) {
					console.error('Erro no toggle:', error);
					this.isPlaying = false;
				}
			} else {
				audio.pause();
				this.isPlaying = false;
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
