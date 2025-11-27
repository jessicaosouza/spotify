<script setup>
import { useAuthStore } from '../stores/authStore';
import AppPlaylistCard from '../components/AppPlaylistCard.vue';
import { Plus } from 'lucide-vue-next';

const store = useAuthStore()
</script>
<template>
    <div class="w-[20%] bg-sblack p-4 max-h-[83vh] rounded-lg">
        <div class="flex items-center justify-between">
            <p class="text-white font-regular">Sua Biblioteca</p>
            <button type="button"
                class="text-white text-sm px-4 py-2 rounded-full flex items-center gap-2 bg-sblack-200">
                <plus class="text-sgray-100 size-5" />
                <span>Criar</span>
            </button>
        </div>
        <p class="text-sgray-100 mt-4 w-fit text-xs px-4 py-2 rounded-full bg-sblack-200">
            Playlists
        </p>
        <div class="pt-4">
            <app-playlist-card v-for="item in store.getPlaylists" :key="item.id" :item="item" />
        </div>
    </div>
</template>