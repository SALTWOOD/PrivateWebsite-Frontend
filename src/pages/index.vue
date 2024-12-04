<template>
    <HeaderImage :height="300" />
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
import { Shared } from '@/types/Shared';
import axios from 'axios';

const articles: Ref<Article[]> = ref([]);

onMounted(async () => {
    document.title = Shared.info.value.title;
    const data = (await axios.get("/api/articles")).data as Article[];
    articles.value = data.reverse();
});
</script>

<route lang="yaml">
meta:
    layout: appbar
</route>
