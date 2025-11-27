<script setup>
import { computed, onMounted } from 'vue';
import { usePlayerStore } from '../stores/playerStore';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-vue-next';

const player = usePlayerStore();

const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const progressPercentage = computed(() => {
    if (!player.duration) return 0;
    return (player.currentTime / player.duration) * 100;
});

// FUNÇÃO: Detecta onde o usuário clicou na barra para adiantar a música
const handleSeek = (event) => {
    // Pega a largura total do elemento clicado
    const progressBar = event.currentTarget;
    const clickPosition = event.offsetX; // Onde clicou (px)
    const totalWidth = progressBar.clientWidth; // Largura total (px)

    // Regra de 3 para achar a porcentagem
    const percentage = (clickPosition / totalWidth) * 100;

    player.seek(percentage);
};

onMounted(() => {
    player.init();
});
</script>

<template>
    <div
        class="w-full py-4 px-3 h-[8vh] text-white fixed bottom-0 flex items-center justify-between bg-sblack border-t border-sgray-100">
        <div class="flex items-center gap-3 w-1/3">
            <div v-if="player.currentTrack" class="flex items-center gap-3">
                <img v-if="player.currentTrack.album?.images?.[0]?.url" :src="player.currentTrack.album.images[0].url"
                    alt="Album cover" class="w-14 h-14 rounded" />
                <div>
                    <p class="text-sm font-semibold">{{ player.currentTrack.name }}</p>
                    <p class="text-xs text-sgray-100">
                        {{ player.currentTrack.artists?.[0]?.name }}
                    </p>
                </div>
            </div>
            <div v-else class="text-sgray-100 text-sm">
                Nenhuma música selecionada
            </div>
        </div>
        <div class="flex items-center gap-4 w-1/3 justify-center">
            <button type="button" @click="player.prevTrack()" class="text-white hover:scale-110 transition-transform"
                :disabled="!player.currentTrack">
                <SkipBack class="w-6 h-6" />
            </button>

            <button type="button" @click="player.togglePlay()"
                class="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                :disabled="!player.currentTrack">
                <Pause v-if="player.isPlaying" class="text-sblack w-5 h-5" />
                <Play v-else class="text-sblack w-5 h-5 ml-0.5" />
            </button>

            <button type="button" @click="player.nextTrack()" class="text-white hover:scale-110 transition-transform"
                :disabled="!player.currentTrack">
                <SkipForward class="w-6 h-6" />
            </button>
        </div>

        <div class="w-full max-w-md flex items-center gap-2 text-xs text-gray-400 font-mono">
            <span class="w-8 text-right">{{ formatTime(player.currentTime) }}</span>

            <div class="h-1 flex-1 bg-gray-600 rounded-full overflow-hidden cursor-pointer group" @click="handleSeek">

                <div class="h-full bg-white group-hover:bg-green-500 transition-all duration-100 ease-linear"
                    :style="{ width: progressPercentage + '%' }">
                </div>
            </div>

            <span class="w-8">{{ formatTime(player.duration) }}</span>
        </div>

        <div class="w-1/3 flex justify-end">
            <div class="text-xs text-sgray-100">
                {{ player.isPlaying ? '▶️ Tocando' : '⏸️ Pausado' }}
            </div>
        </div>
    </div>
</template>