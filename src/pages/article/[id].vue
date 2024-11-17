<template>
    <HeaderImage />
    <div :class="['article-page', { 'dark-mode': isDarkMode }]" >
        <div v-if="loading" class="loading">Loading...</div>
        <div v-else>
            <h1>{{ article.title }}</h1>
            <p><strong>{{ article.authorName }}</strong></p>
            <div class="article-content" v-html="articleContent"></div>
            <p><em>{{ formattedDate }}</em></p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { marked } from 'marked';
import { Article } from '@/types/Article';
import HeaderImage from '@/components/HeaderImage.vue';
import vuetify from '@/plugins/vuetify';

const route = useRoute();
const article = ref<Article>(new Article());
const articleContent = ref<string>('');
const loading = ref(true);
const formattedDate = ref<string>('');

const isDarkMode = computed(() => vuetify.theme.current.value.dark);

async function fetchArticle() {
    const id = route.params.id;
    try {
        const response = await axios.get(`/api/articles/${id}`);
        article.value = response.data;

        articleContent.value = await marked(article.value.content);

        const date = new Date(article.value.publishedAt);
        formattedDate.value = date.toLocaleDateString();
    } catch (error) {
        console.error('Error fetching article:', error);
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    fetchArticle();
});
</script>

<style scoped>
.article-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background-color: #ffffff;
    color: #333333;
    transition: background-color 0.3s, color 0.3s;
}

.article-page.dark-mode {
    background-color: #121212; /* 深色模式背景 */
    color: #f0f0f0; /* 深色模式文字颜色 */
}

.loading {
    text-align: center;
    font-size: 18px;
}

.article-content {
    margin-top: 20px;
    font-size: 16px;
    line-height: 1.6;
    transition: color 0.3s ease;
}

.article-content h1, .article-content h2, .article-content h3 {
    transition: color 0.3s ease;
}

.article-content.dark-mode h1, 
.article-content.dark-mode h2, 
.article-content.dark-mode h3 {
    color: #e0e0e0; /* 深色模式标题颜色 */
}

.article-content a {
    color: #007bff;
    text-decoration: none;
    transition: color 0.3s ease;
}

.article-content a:hover {
    text-decoration: underline;
}

.article-content.dark-mode a {
    color: #66b2ff; /* 深色模式链接颜色 */
}
</style>

<route lang="yaml">
meta:
    layout: appbar
</route>
