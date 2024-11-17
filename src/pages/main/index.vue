<template>
    <HeaderImage />
    <main class="content">
        <!-- 主内容放在这里 -->
    </main>
</template>

<script setup lang="ts">
import { Shared } from '@/types/shared';
import HeaderImage from '@/components/HeaderImage.vue'; // 引入 HeaderImage 组件
import { ref, onMounted, onUnmounted } from 'vue';

const isHeaderHidden = ref(false);

function handleScroll() {
    // 如果页面向上滚动超过 100 像素，隐藏头图
    isHeaderHidden.value = window.scrollY > 100;
}

onMounted(() => {
    window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
});
</script>
