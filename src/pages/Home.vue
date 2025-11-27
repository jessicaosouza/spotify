<script setup>
import AppContainer from '../components/AppContainer.vue';
import AppPlaylistCard from '../components/AppPlaylistCard.vue';
import { useAuthStore } from '../stores/authStore'
import { Plus } from 'lucide-vue-next';
import { getLoginURL } from '../Helpers/auth'
import { onMounted, watch } from 'vue';

const authStore = useAuthStore()
const spotifyLogin = async () => {
    window.location.href = await getLoginURL()
}

watch(
    () => authStore.session,
    (newSession) => {
        if (newSession && newSession.access_token) {
            authStore.loadPlaylists();
            authStore.loadTopItems('artists');
            authStore.loadTopItems('tracks');
        }
    },
    { immediate: true }
);

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
                <div class="w-[20%] bg-sblack p-4 max-h-[86vh] rounded-lg">
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
                    {{ }}
                    <div class="pt-4">
                        <app-playlist-card v-for="item in authStore.getPlaylists" :key="item.id" :item="item" />
                    </div>
                </div>
                <div class="w-[80%] bg-sblack p-4 min-h-[86vh] rounded-lg">
                </div>
            </div>
        </div>
    </app-container>
</template>