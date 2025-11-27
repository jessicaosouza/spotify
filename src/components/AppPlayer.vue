<script setup>
import { onMounted } from 'vue';
import { usePlayerStore } from '../stores/playerStore';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-vue-next';

const player = usePlayerStore();

onMounted(() => {
    player.init();
    console.log('🎵 Player montado');
});
</script>

<template>
    <div
        class="w-full px-3 h-[7vh] text-white fixed bottom-0 flex items-center justify-between bg-sblack border-t border-sgray-100">
        <!-- Info da música -->
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

        <!-- Controles -->
        <div class="flex items-center gap-4 w-1/3 justify-center">
            <button type="button" @click="player.prevTrack()" class="text-white hover:scale-110 transition-transform"
                :disabled="!player.currentTrack">
                <SkipBack class="w-6 h-6" />
            </button>

            <button type="button" @click="player.togglePlay()"
                class="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                :disabled="!player.currentTrack">
                <!-- ✅ Mostrar Play ou Pause baseado no estado -->
                <Pause v-if="player.isPlaying" class="text-sblack w-5 h-5" />
                <Play v-else class="text-sblack w-5 h-5 ml-0.5" />
            </button>

            <button type="button" @click="player.nextTrack()" class="text-white hover:scale-110 transition-transform"
                :disabled="!player.currentTrack">
                <SkipForward class="w-6 h-6" />
            </button>
        </div>

        <!-- Volume / extras -->
        <div class="w-1/3 flex justify-end">
            <div class="text-xs text-sgray-100">
                {{ player.isPlaying ? '▶️ Tocando' : '⏸️ Pausado' }}
            </div>
        </div>
    </div>
</template>