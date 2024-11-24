<template>
    <HeaderImage />
    <br />
    <div :class="['article-page', { 'dark-mode': isDarkMode }]">
        <div v-if="loading" class="loading">Loading...</div>
        <div v-else>
            <v-form ref="form" lazy-validation>
                <!-- 标题输入框 -->
                <v-text-field v-model="editedArticle.title" label="标题" outlined :rules="titleRules" class="mb-4" />

                <!-- 描述输入框 -->
                <v-text-field v-model="editedArticle.description" label="描述" outlined :rules="titleRules"
                    class="mb-4" />

                <!-- 背景图输入框 -->
                <v-text-field v-model="editedArticle.background" label="背景图" outlined :rules="titleRules"
                    class="mb-4" />

                <!-- 公开状态切换 -->
                <v-switch v-model="editedArticle.published" :label="editedArticle.published ? '已发布' : '未发布'"
                    class="mb-4" />

                <h1>{{ editedArticle.title }}</h1>
                <p><strong>{{ article.authorName }}</strong></p>
                <p><em>{{ `发布于 ${formattedDate}` }}</em></p>
                <p><em>{{ `最后更新于 ${formattedUpdateDate}` }}</em></p>
                <v-divider />

                <MdEditor v-model="editedArticle.content" :preview="vuetify.display.mdAndUp.value"
                    :theme="(vuetify.theme.global.name.value as 'dark' | 'light')" />

                <!-- 编辑表单 -->
                <v-btn @click="saveArticle" color="success" class="mr-3">Save Changes</v-btn>
                <v-btn @click="cancel" color="error" class="mr-3">Cancel</v-btn>
            </v-form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { MdEditor } from 'md-editor-v3';
import { Article } from '@/types/Article';
import HeaderImage from '@/components/HeaderImage.vue';
import vuetify from '@/plugins/vuetify';
import router from '@/router';
import 'md-editor-v3/lib/style.css';

const route = useRoute();
const article = ref<Article>(new Article());
const editedArticle = ref<Article>(new Article());
const loading = ref(true);
const formattedDate = ref<string>('');
const formattedUpdateDate = ref<string>('');

// 获取主题模式，决定是否启用深色模式
const isDarkMode = computed(() => vuetify.theme.current.value.dark);

// 设置标题的验证规则
const titleRules = [
    (v: string) => !!v || 'Title is required',
    (v: string) => v.length <= 100 || 'Title must be less than 100 characters'
];

async function fetchArticle() {
    const id = (route.params as { id: string }).id;
    try {
        const response = await axios.get(`/api/articles/${id}`);
        article.value = response.data;

        // 初始化编辑文章内容
        editedArticle.value = { ...article.value };

        // 格式化发布日期
        formattedDate.value = new Date(article.value.publishedAt).toLocaleString();
        formattedUpdateDate.value = new Date(article.value.lastUpdated).toLocaleString();
    } catch (error) {
        console.error('Error fetching article:', error);
    } finally {
        loading.value = false;
    }
}

function cancel() {
    router.push(`/article/${article.value.id}`);
}

async function saveArticle() {
    try {
        const response = await axios.put(`/api/articles/${article.value.id}`, {
            ...editedArticle.value,
            oldHash: article.value.hash,  // 提供 oldHash 防止并发问题
            title: editedArticle.value.title ?? undefined,  // 如果没有改动，传 undefined
            content: editedArticle.value.content ?? undefined,
            description: editedArticle.value.description ?? undefined,
            published: editedArticle.value.published ?? undefined,
            background: editedArticle.value.background ?? undefined,
        });
        article.value = response.data;
        cancel();
    } catch (error) {
        console.error('Error saving article:', error);
    }
}

onMounted(() => {
    fetchArticle();
});
</script>

<style scoped>
/* 这里可以自定义样式 */
.textarea {
    min-height: 400px;
    /* 增加高度 */
}
</style>

<route lang="yaml">
meta:
  layout: appbar
</route>
