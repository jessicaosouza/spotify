<script setup>
import { Home, Search as SearchIcon } from 'lucide-vue-next';
import { useAuthStore } from '../stores/authStore';
import { useRouter, RouterLink } from 'vue-router';
import IconSpotify from './IconSpotify.vue'
import debounce from 'lodash/debounce';
import IconSpotifyNavigation from './IconSpotifyNavigation.vue'
import { onMounted, ref } from 'vue';
import { logout } from '../Helpers/auth';

const router = useRouter()
const authStore = useAuthStore()
const focusSearch = ref(false)
const showOptions = ref(false)
const search = ref('')

const closeWhenClickedOutside = (event) => {
    if (!event.target.closest('.menu_options')) {
        showOptions.value = false
    }
}

const loadSearch = debounce(() => {
    const query = search.value?.trim()
    if (!query) return

    router.push({
        name: 'search',
        params: { query },
    })
}, 600)

onMounted(() => {
    document.addEventListener('click', closeWhenClickedOutside)
})
</script>
<template>
    <nav class="absolute top-0 w-full bg-black px-8 h-[60px] flex items-center justify-between">
        <icon-spotify />
        <div class="h-full flex items-center gap-2">
            <router-link :to="{ name: 'home' }"
                class="bg-sblack-100 h-10 w-10 rounded-full flex items-center justify-center">
                <home class="text-sgray-100 size-5" />
            </router-link>
            <div :class="focusSearch ? 'border border-white' : 'border-none'"
                class="relative rounded-full flex items-center gap-2 px-4 bg-sblack-100 py-2 w-[400px]">
                <div class="flex flex-1 items-center gap-2">
                    <SearchIcon class="size-5 text-sgray-100" />
                    <input @input="loadSearch()" v-model="search" @focus="focusSearch = true"
                        @blur="focusSearch = false"
                        class="text-sgray-100 outline-none focus:outiline-none focus:ring-0 text-xs w-full"
                        placeholder="O que você quer ouvir?" />
                </div>
                <div class="flex flex-none pl-3 border-l border-l-sgray-100/70 cursor-pointer">
                    <icon-spotify-navigation />
                </div>
            </div>
        </div>
        <div v-if="authStore.session" class="relative menu_options">
            <button type="button" @click="showOptions = !showOptions">
                <img class="rounded-full border-6 border-sblack-200" :src="authStore.navPicture" width="50" height="50"
                    alt="user profile picture"></img>
            </button>
            <ul v-if="showOptions"
                class=" absolute -right-4 cursor-pointer font-semibold text-xs text-sgray-100 rounded-lg w-[200px] bg-sblack-300 p-2">
                <li class="p-3">Conta</li>
                <li class="p-3">Configurações</li>
                <hr class="my-2">
                <button type="button" @click="logout()">
                    <li class="p-3">Sair</li>
                </button>
            </ul>
        </div>
        <p v-else class="text-sgray-100 font-black">PosUnimar</p>
    </nav>
</template>