<script setup>
import { computed } from 'vue';

const props = defineProps({
    item: { required: true, type: Object },
    type: { required: false, type: String, default: 'regular' }
})

const artists = computed(() => props.item.artists.map(a => a.name).join(', '),)

const cover = computed(() => {
    const defaultCover = props.item.album.images.find(i => i.width === 640)
    if (defaultCover) {
        return defaultCover.url
    }
    return props.item.album.images[0].url
})

const formatMsToTime = (ms) => {
    if (!ms && ms !== 0) return '0:00';

    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
</script>
<template>
    <div v-if="type === 'regular'" class="p-4 rounded hover:bg-sblack-200/90 hover:rounded cursor-pointer">
        <img :src="cover" class="w-[200px] h-[200px] rounded" alt="">
        <p class="text-white/90 font-regular pt-2">{{ item.name }}</p>
        <p class="capitalize text-xs text-sgray-100">{{ artists }}</p>
    </div>
    <div v-else
        class="py-1 px-4 gap-3 flex items-center justify-between rounded hover:bg-sblack-200/90 hover:rounded cursor-pointer">
        <div class="flex items-center gap-3">
            <img :src="cover" class="w-10 h-10 rounded" alt="">
            <div>
                <p class="text-white/90 text-sm font-regular">{{ item.name }}</p>
                <p class="capitalize text-xs text-sgray-100">{{ artists }}</p>
            </div>
        </div>
        <p class="text-sm text-sgray-100">{{ formatMsToTime(item.duration_ms) }}</p>
    </div>
</template>