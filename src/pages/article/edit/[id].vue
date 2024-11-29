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

                <ManagedEditor :content="editedArticle.content" />

                <!-- 编辑表单 -->
                <v-btn @click="saveArticle" color="success" class="mr-3">Save Changes</v-btn>
                <v-btn @click="cancel" color="error" class="mr-3">Cancel</v-btn>
            </v-form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { Article } from '@/types/Article';
import HeaderImage from '@/components/HeaderImage.vue';
import vuetify from '@/plugins/vuetify';
import router from '@/router';
import ManagedEditor from '@/components/ManagedEditor.vue';
import { Shared } from '@/types/Shared';

const route = useRoute();
const article = ref<Article>(new Article());
const editedArticle = ref<Article>(new Article());
const loading = ref(true);
const formattedDate = ref<string>('');
const formattedUpdateDate = ref<string>('');

const isDarkMode = computed(() => vuetify.theme.current.value.dark);

const titleRules = [
    (v: string) => !!v || 'Title is required',
    (v: string) => v.length <= 100 || 'Title must be less than 100 characters'
];

function handleBeforeUnload(event: BeforeUnloadEvent) {
    if (!isDataSaved.value) {
        const message = "您有未保存的数据，离开页面可能会丢失这些数据。";
        event.returnValue = message;  // 旧版浏览器
        return message;  // 新版浏览器
    }
}

let isDataSaved = ref(false);  // 标记是否保存数据

async function fetchArticle() {
    const id = (route.params as { id: string }).id;
    try {
        const response = await axios.get(`/api/articles/${id}`);
        article.value = response.data;
        editedArticle.value = { ...article.value };

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
            oldHash: article.value.hash,
            title: editedArticle.value.title ?? undefined,
            content: editedArticle.value.content ?? undefined,
            description: editedArticle.value.description ?? undefined,
            published: editedArticle.value.published ?? undefined,
            background: editedArticle.value.background ?? undefined,
        });
        article.value = response.data;
        isDataSaved.value = true;  // 保存数据后标记为已保存
        cancel();
    } catch (error) {
        console.error('Error saving article:', error);
    }
}

onMounted(async () => {
    await fetchArticle();
    document.title = `[EDIT] ${article.value.title} - ${Shared.info.value.title}`;

    window.addEventListener('beforeunload', handleBeforeUnload);
});

onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
});

// 路由离开时的确认逻辑
router.beforeEach((to, from, next) => {
    if (!isDataSaved.value && editedArticle.value !== article.value) {
        if (window.confirm('您有未保存的数据，是否确认离开？\nYour changes will be lost if you leave without saving.')) {
            next();  // 继续导航
        } else {
            next(false);  // 阻止导航
        }
    } else {
        next();  // 数据已保存，继续导航
    }
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
