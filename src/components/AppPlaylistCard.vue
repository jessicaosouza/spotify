<script setup>
import { computed } from 'vue';
import { Dot } from 'lucide-vue-next';

const props = defineProps({
    item: { required: true, type: Object }
})

const cover = computed(() => {
    if (props.item.images.length) {
        return props.item.images[0].url
    }
    return null
})
</script>
<template>
    <div class="w-full flex p-2 items-center justify-start hover:bg-sblack-200/90 hover:rounded">
        <img v-if="cover" :src="cover" alt="" class="h-12 w-12 rounded object-cover" />
        <div class="pl-3">
            <p class="text-white text-sm">{{ item.name }}</p>
            <div class="flex items-center text-sgray-100 text-xs">
                <p>Playlist</p>
                <Dot />
                <p>{{ item.owner.display_name }}</p>
            </div>
        </div>
    </div>
</template>