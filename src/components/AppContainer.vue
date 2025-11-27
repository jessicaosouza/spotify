<script setup>
import AppNavigation from './AppNavigation.vue';
import AppPlayer from './AppPlayer.vue';
import { useAuthStore } from '../stores/authStore';

const auth = useAuthStore()
</script>
<template>
    <div class="w-full max-h-screen relative bg-black">
        <app-navigation />

        <div class="flex">
            <slot></slot>
        </div>
        <app-player v-if="auth.session" />
    </div>
</template>