<template>
    <NotificationPage :page="0" @to-next-page="toNextPage" />
</template>

<script setup lang="ts">
import NotificationPage from '@/components/NotificationPage.vue';

const router = useRouter();

function toNextPage() {
    router.push("/notifications/1")
}
</script>

<route lang="yaml">
meta:
  layout: appbar
</route>