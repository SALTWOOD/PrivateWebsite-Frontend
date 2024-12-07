<template>
    <NotificationPage :page="page" />
</template>

<script setup lang="ts">
import NotificationPage from '@/components/NotificationPage.vue';

const route = useRoute();
const page = Number((route.params as { id: string }).id) || 0;
</script>