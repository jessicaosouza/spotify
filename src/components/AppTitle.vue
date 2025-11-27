<script setup>
defineProps({
    text: { required: true, type: String }
})
</script>
<template>
    <p class="text-white font-semibold text-xl pb-4">{{ text }}</p>
</template>