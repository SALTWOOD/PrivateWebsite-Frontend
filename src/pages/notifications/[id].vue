<template>
    <NotificationPage :page="page" @to-next-page="toNextPage" @to-previous-page="toPreviousPage" />
</template>

<script setup lang="ts">
import NotificationPage from '@/components/NotificationPage.vue';

const route = useRoute();
const page = ref(Number((route.params as { id: string }).id) || 0);
const router = useRouter();

function toPreviousPage() {
    router.push(`/notifications/${page.value - 1}`)
}

function toNextPage() {
    router.push(`/notifications/${page.value + 1}`)
}
</script>

<route lang="yaml">
meta:
  layout: appbar
</route>