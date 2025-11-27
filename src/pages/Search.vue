<script setup>
import AppContainer from '../components/AppContainer.vue';
import AppSidebar from '../components/AppSidebar.vue';
import AppTitle from '../components/AppTitle.vue';
import AppTrackCard from '../components/AppTrackCard.vue';
import { Loader } from 'lucide-vue-next';
import { useAuthStore } from '../stores/authStore';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router'
import { api } from '../services/api';

const loading = ref(true)
const searchTypes = ["album", "artist", "playlist", "track"]
const route = useRoute()
const results = ref(null)
const searchTerm = computed(() => route.params.query || '')

const getSearchResults = async () => {
    const type = encodeURIComponent(searchTypes)
    console.log("type: ", type)
    results.value = await api.get(
        `search?q=${searchTerm.value}&type=${type}`,
    );
    loading.value = false
}

const topArtist = computed(() => {
    return results.value?.artists?.items[0]
})

const topArtistCover = computed(() => {
    const defaultCover = results.value?.artists?.items[0].images.find(i => i.width === 640)
    if (defaultCover) { return defaultCover.url }
    return results.value?.artists?.items[0].images[0].url
})

const topTracks = computed(() => {
    return results.value?.tracks?.items.slice(0, 4)
})

onMounted(() => {
    if (searchTerm.value) {
        getSearchResults()
    }
})
</script>
<template>
    <app-container>
        <div class="w-full pt-16 px-2">
            <div class="flex gap-2">
                <app-sidebar />
                <div v-if="loading" class="w-[80%] bg-sblack flex items-center justify-center h-[83vh] rounded-lg ">
                    <loader class="size-5 text-white animate-spin" />
                </div>
                <div v-else class="w-[80%] bg-sblack overflow-y-auto overflow-x-hidden p-10 h-[83vh] rounded-lg ">
                    <div class="pt-6">
                        <div class="w-full flex items-center gap-4">
                            <div class="w-[30%]">
                                <app-title text="Top Results" />
                                <div
                                    class="p-4 rounded bg-sblack-300 hover:bg-sblack-200/90 hover:rounded  cursor-pointer">
                                    <img :src="topArtistCover"
                                        class="w-[92px] h-[92px] object-cover rounded-full hover:shadow-lg hover:shadow-bg-sblack/60"
                                        alt="">
                                    <p class="text-3xl font-semibold text-white/90 pt-6">{{ topArtist.name }}</p>
                                    <p class="capitalize text-sm pt-1 text-sgray-100">{{ topArtist.type }}</p>
                                </div>
                            </div>
                            <div class="w-[70%]">
                                <app-title text="Songs" />
                                <app-track-card v-for="track in topTracks" type="top" :item="track" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </app-container>
</template>