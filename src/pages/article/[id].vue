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

            <!-- 文章内容 -->
            <div class="article-content" v-html="articleContent"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { marked } from 'marked';
import { Article } from '@/types/Article';
import HeaderImage from '@/components/HeaderImage.vue';
import vuetify from '@/plugins/vuetify';
import { Shared } from '@/types/Shared';

const route = useRoute();
const router = useRouter();
const article = ref<Article>(new Article());
const articleContent = ref<string>('');
const loading = ref(true);
const formattedDate = ref<string>('');

// 获取主题模式，决定是否启用深色模式
const isDarkMode = computed(() => vuetify.theme.current.value.dark);

// 自定义 Markdown 渲染器配置
const markdownRenderer = marked.setOptions({
    breaks: true,  // 启用换行符自动转换为 <br>
    gfm: true,  // 启用 GitHub Flavored Markdown
    renderer: new marked.Renderer()
});

async function fetchArticle() {
    const id = route.params.id;
    try {
        const response = await axios.get(`/api/articles/${id}`);
        article.value = response.data;

        // 将 Markdown 转换为 HTML
        articleContent.value = await markdownRenderer(article.value.content);

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

.article-content {
    margin-top: 20px;
    font-size: 16px;
    line-height: 1.6;
}

.article-content h1,
.article-content h2,
.article-content h3 {
    transition: color 0.3s ease;
}

.article-content.dark-mode h1,
.article-content.dark-mode h2,
.article-content.dark-mode h3 {
    color: #e0e0e0;
}

.article-content a {
    color: #007bff;
    text-decoration: none;
}

.article-content a:hover {
    text-decoration: underline;
}

.article-content.dark-mode a {
    color: #66b2ff;
}

.article-content code {
    background-color: #f0f0f0;
    padding: 2px 5px;
    border-radius: 4px;
}

.article-content.dark-mode code {
    background-color: #2d2d2d;
    color: #f0f0f0;
}
</style>

<route lang="yaml">
meta:
  layout: appbar
</route>