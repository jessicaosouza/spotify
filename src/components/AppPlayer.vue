<script setup>
import AppPlayerProgress from './AppPlayerProgress.vue';
import AppPlayerVolume from './AppPlayerVolume.vue';
import { computed, onMounted } from 'vue';
import { usePlayerStore } from '../stores/playerStore';
import IconPlay from './IconPlay.vue';
import IconPause from './IconPause.vue';
import IconPrevious from './IconPrevious.vue';
import IconNext from './IconNext.vue';

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
    <div class="w-full py-4 px-3 h-[10vh] text-white fixed bottom-0 flex items-center justify-between bg-black">
        <div class="flex items-center gap-3">
            <img :src="player.albumCover" class="w-14 h-14 rounded">
            <div>
                <p class="text-sm ">{{ player.name }}</p>
                <p class="text-xs text-sgray-100">{{ player.artists }}</p>
            </div>
        </div>
        <div class="flex flex-col items-center gap-3">
            <div class="flex items-center gap-6">
                <icon-previous class="fill-white/80" />
                <button type="button" @click="player.togglePlay()">
                    <div class="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <icon-play v-if="!player.isPlaying" />
                        <icon-pause v-else class="fill-sblack" />
                    </div>
                </button>
                <icon-next class="fill-white/80" />
            </div>
            <app-player-progress />
        </div>
        <div>
            <app-player-volume />
        </div>
    </div>
</template>