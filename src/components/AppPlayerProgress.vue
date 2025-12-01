<script setup>
import { computed } from 'vue';
import { usePlayerStore } from '../stores/playerStore';

const player = usePlayerStore();

const formatTime = (seconds) => {
    if (seconds === undefined || seconds === null || isNaN(seconds) || !player.currentTrack) return '-:--';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const progressPercentage = computed(() => {
    if (!player.duration || !player.currentTime) return 0;
    return (player.currentTime / player.duration) * 100;
});

const handleSeek = (event) => {
    if (!player.currentTrack) return;

    const progressBar = event.currentTarget;
    const clickPosition = event.offsetX;
    const totalWidth = progressBar.clientWidth;
    const percentage = (clickPosition / totalWidth) * 100;
    player.seek(percentage);
};
</script>

<template>
    <div class="w-[200px] md:w-[600px] flex items-center gap-2 text-xs font-mono text-gray-400">

        <span class="w-10 text-right">{{ formatTime(player.currentTime) }}</span>

        <div class="group relative h-1 w-full flex-1 rounded-full bg-white/20"
            :class="player.currentTrack ? 'cursor-pointer' : 'cursor-default'" @click="handleSeek">

            <div class="h-full rounded-full bg-white transition-all duration-100 ease-linear group-hover:bg-green-500"
                :style="{ width: progressPercentage + '%' }">
            </div>

            <div class="absolute top-1/2 -translate-y-1/2 -ml-1.5 h-3 w-3 rounded-full bg-white opacity-0 transition group-hover:opacity-100"
                v-if="player.currentTrack" :style="{ left: progressPercentage + '%' }">
            </div>
        </div>

        <span class="w-10">{{ formatTime(player.duration) }}</span>
    </div>
</template>