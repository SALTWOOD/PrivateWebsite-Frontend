<template>
    <HeaderImage />
    <div :class="['article-page', { 'dark-mode': isDarkMode }]">
        <div v-if="loading" class="loading">Loading...</div>
        <div v-else>
            <h1>{{ article.title }}</h1>
            <p><strong>{{ article.authorName }}</strong></p>
            <p><em>{{ formattedDate }}</em></p>
            <v-divider />
            <br />

            <!-- 修改和删除按钮 -->
            <div>
                <v-btn @click="redirectToEditPage" color="primary" class="mr-3">Edit Article</v-btn>
                <v-btn @click="deleteArticle" color="red" class="mr-3">Delete Article</v-btn>
            </div>
        </div>
    </div>

    <!-- 文章内容 -->
    <MdPreview :id="'preview'" :modelValue="articleContent" :theme="vuetify.theme.global.name.value" />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { MdPreview } from 'md-editor-v3';
import { Article } from '@/types/Article';
import HeaderImage from '@/components/HeaderImage.vue';
import vuetify from '@/plugins/vuetify';
import { Shared } from '@/types/Shared';
import 'md-editor-v3/lib/preview.css';

const route = useRoute();
const router = useRouter();
const article = ref<Article>(new Article());
const articleContent = ref<string>('');
const loading = ref(true);
const formattedDate = ref<string>('');
const scrollElement = document.documentElement;

// 获取主题模式，决定是否启用深色模式
const isDarkMode = computed(() => vuetify.theme.current.value.dark);

async function fetchArticle() {
    const id = (route.params as { id: string }).id;
    try {
        const response = await axios.get(`/api/articles/${id}`);
        article.value = response.data;
        articleContent.value = article.value.content;

        // 格式化发布日期
        const date = new Date(article.value.publishedAt);
        formattedDate.value = date.toLocaleDateString();

        // 设置页面标题
        document.title = `${article.value.title} - ${Shared.info.value.title}`;
    } catch (error) {
        console.error('Error fetching article:', error);
    } finally {
        loading.value = false;
    }
}

function redirectToEditPage() {
    router.push(`/article/edit/${article.value.id}`);
}

async function deleteArticle() {
    const confirmed = window.confirm('Are you sure you want to delete this article?');
    if (confirmed) {
        try {
            await axios.delete(`/api/articles/${article.value.id}`);
            router.push('/'); // 删除后跳转回文章列表
        } catch (error) {
            console.error('Error deleting article:', error);
        }
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
    background-color: #121212;
    color: #f0f0f0;
}

.loading {
    text-align: center;
    font-size: 18px;
}
</style>

<route lang="yaml">
meta:
  layout: appbar
</route>
