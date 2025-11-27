<script setup>
import { useRoute } from 'vue-router';
import { useAuthStore } from './stores/authStore';
import { watch } from 'vue';

const route = useRoute()
const authStore = useAuthStore()

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
</script>
<template>
    <router-view :key="route.path"></router-view>
</template>