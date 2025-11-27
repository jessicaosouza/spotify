<script setup>
import AppNavigation from './AppNavigation.vue';
import AppPlayer from './AppPlayer.vue';
</script>
<template>
    <div class="w-full min-h-screen relative bg-black">
        <app-navigation />

        <slot></slot>
        <app-player />
    </div>
</template>