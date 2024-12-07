<template>
</template>

<script setup lang="ts">
const router = useRouter()

onMounted(() => {
  router.push('/notifications/0')
})
</script>

<route lang="yaml">
meta:
  layout: appbar
</route>