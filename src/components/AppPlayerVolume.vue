<script setup>
import { computed, ref, onUnmounted } from 'vue';
import { usePlayerStore } from '../stores/playerStore';
import { Volume2, Volume1, VolumeX } from 'lucide-vue-next';

const player = usePlayerStore();
const progressBarRef = ref(null); // Referência para o elemento HTML da barra
let isDragging = false; // Flag para saber se está arrastando

const VolumeIcon = computed(() => {
    if (player.volume === 0) return VolumeX;
    if (player.volume < 30) return Volume1;
    return Volume2;
});

// Lógica Principal de Cálculo
const updateVolume = (event) => {
    if (!progressBarRef.value) return;

    const rect = progressBarRef.value.getBoundingClientRect();
    const clickX = event.clientX; // Posição X do mouse na tela
    const width = rect.width;
    const startX = rect.left;

    // Calcula a posição relativa dentro da barra
    let newPercentage = ((clickX - startX) / width) * 100;

    // Trava entre 0 e 100 (Clamp)
    newPercentage = Math.max(0, Math.min(100, newPercentage));

    player.setVolume(newPercentage);
};

// 1. Começa o arraste (MouseDown)
const startDrag = (event) => {
    isDragging = true;
    updateVolume(event); // Já atualiza onde clicou

    // Adiciona ouvintes globais para continuar arrastando mesmo se sair da div
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
};

// 2. Durante o arraste (MouseMove)
const onDrag = (event) => {
    if (isDragging) {
        updateVolume(event);
    }
};

// 3. Fim do arraste (MouseUp)
const stopDrag = () => {
    isDragging = false;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
};

// Limpeza de segurança (caso o componente seja desmontado durante o arraste)
onUnmounted(() => {
    stopDrag();
});
</script>

<template>
    <div class="flex items-center gap-2 text-gray-400">
        <button @click="player.toggleMute" class="hover:text-white transition">
            <component :is="VolumeIcon" :size="20" />
        </button>

        <div ref="progressBarRef" class="group relative h-1 w-24 rounded-full bg-white/30 cursor-pointer"
            @mousedown="startDrag">

            <div class="h-full rounded-full bg-white group-hover:bg-green-500 transition-none"
                :style="{ width: player.volume + '%' }">
            </div>

            <div class="absolute top-1/2 -translate-y-1/2 -ml-1.5 h-3 w-3 rounded-full bg-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-active:opacity-100"
                :style="{ left: player.volume + '%' }">
            </div>
        </div>
    </div>
</template>