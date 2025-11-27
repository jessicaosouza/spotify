<script setup>
import { computed } from 'vue';

const props = defineProps({
    item: { required: true, type: Object }
})

const profile = computed(() => {
    const defaultImg = props.item.images.find(i => i.width === 640)

    if (defaultImg) {
        return defaultImg.url
    }

    return props.item.images[0].url
})
</script>
<template>
    <div class="p-4 hover:bg-sblack-200/90 hover:rounded cursor-pointer">
        <img :src="profile" class="w-40 h-40 object-cover rounded-full">
        <p class="text-white/90 font-regular pt-2">{{ item.name }}</p>
        <p class="capitalize text-xs text-sgray-100">{{ item.type }}</p>
    </div>
</template>