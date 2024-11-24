<template>
    <HeaderImage />
    <br />
    <v-row dense>
        <v-col cols="12" xl="3" lg="4" md="6" v-for="(article, index) in articles" :key="index">
            <ArticleCard :article="article" />
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import HeaderImage from '@/components/HeaderImage.vue'; // 引入 HeaderImage 组件
import { Article } from '@/types/Article';
import axios from 'axios';
import { Shared } from '@/types/Shared';

document.title = Shared.info.value.title;

const articles: Ref<Article[]> = ref([]);

onMounted(async () => {
    const data = (await axios.get("/api/articles")).data as Article[];
    articles.value = data.reverse();
});
</script>

<route lang="yaml">
meta:
    layout: appbar
</route>
