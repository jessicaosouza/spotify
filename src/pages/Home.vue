<script setup>
import AppArtistCard from '../components/AppArtistCard.vue';
import AppContainer from '../components/AppContainer.vue';
import AppSidebar from '../components/AppSidebar.vue';
import AppTrackCard from '../components/AppTrackCard.vue';
import { useAuthStore } from '../stores/authStore'

import { getLoginURL } from '../Helpers/auth'
import { onMounted, watch } from 'vue';

const authStore = useAuthStore()
const spotifyLogin = async () => {
    window.location.href = await getLoginURL()
}

//usar para explicar o problema do race condition
// onMounted(() => {
//     if (authStore.isLoggedIn) {
//         authStore.loadPlaylists()
//     }
// })
</script>
<template>
    <app-container>
        <div v-if="!authStore.session" class="flex flex-col h-screen text-white w-full items-center justify-center">
            <p class="mb-10 text-lg font-semibold text-white">Conecte-se para curtir músicas ilimitadas e podcastas só
                com alguns anúncios.</p>
            <button type="button" @click="spotifyLogin()"
                class="bg-white text-sblack cursor-pointer hover:scale-105 transition-transform duration-300 ease-in-out font-semibold py-4 px-6 rounded-full">
                Entrar com Spotify
            </button>
        </div>
        <div v-else class="w-full pt-16 px-2">
            <div class="flex gap-2">
                <app-sidebar />
                <div class="w-[80%] bg-sblack overflow-y-auto overflow-x-hidden p-10 h-[83vh] rounded-lg ">
                    <div class="pt-6">
                        <p class="text-white font-semibold text-xl pb-6">Top Artistas Recomendados</p>
                        <div class="flex items-center">
                            <app-artist-card v-for="item in authStore.getTopArtists" :key="item.id" :item="item" />
                        </div>
                    </div>
                    <div class="pt-6">
                        <p class="text-white font-semibold text-xl p-4">Recomendados para Você</p>
                        <div class="flex items-center">
                            <app-track-card v-for="item in authStore.getTopTracks" :key="item.id" :item="item" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </app-container>
</template>