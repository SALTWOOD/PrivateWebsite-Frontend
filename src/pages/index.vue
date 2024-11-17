<template>
    <HeaderImage />
    <v-col cols="12" md="8" lg="8" v-for="(article, index) in articles" :key="index">
        <ArticleCard :article="article" />
    </v-col>
</template>

<script setup lang="ts">
import HeaderImage from '@/components/HeaderImage.vue'; // 引入 HeaderImage 组件
import { Article } from '@/types/Article';
import axios from 'axios';

const articles: Ref<Article[]> = ref([]);

onMounted(async () => {
    const data = (await axios.get("/api/articles")).data as Article[];
    articles.value = data;
});
</script>

<route lang="yaml">
meta:
    layout: appbar
</route>