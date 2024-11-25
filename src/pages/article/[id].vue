<template>
    <HeaderImage />
    <br />
    <div :class="{ 'dark-mode': isDarkMode }" style="padding-left: 1.5%; padding-right: 1.5%;">
        <div v-if="loading" class="loading">Loading...</div>
        <div v-else>
            <h1>{{ article.title }}</h1>
            <p><strong>{{ article.authorName }}</strong></p>
            <p><em>{{ `发布于 ${formattedDate}` }}</em></p>
            <p><em>{{ `最后更新于 ${formattedUpdateDate}` }}</em></p>
            <br />

            <div v-if="Shared.currentUser && (Shared.currentUser.id === article.author || Shared.currentUser.permission)">
                <v-divider />
                <br />

                <!-- 修改和删除按钮 -->
                <div>
                    <v-btn @click="redirectToEditPage" color="primary" class="mr-3">Edit Article</v-btn>
                    <v-btn @click="deleteArticle" color="red" class="mr-3">Delete Article</v-btn>
                </div>
                <br />
            </div>
        </div>
    </div>
    <v-divider />
    <br />

    <!-- 文章内容 -->
    <MdPreview :class="isDarkMode ? 'dark-md-reader' : ''" :id="'preview'" :modelValue="articleContent"
        :theme="(vuetify.theme.global.name.value as 'dark' | 'light')" />

    <v-divider />
    <br />

    <!-- 提交评论 -->
    <div>
        <v-textarea v-model="newCommentContent" label="评论" rows="4" :rules="rules"></v-textarea>
        <v-btn @click="postComment" color="primary">
            <v-icon icon="mdi-send"></v-icon>发送评论
        </v-btn>
    </div>
    <br />
    <v-divider />
    <br />

    <!-- 评论区 -->
    <div v-if="comments.length > 0">
        <div v-for="comment in comments" :key="comment.id" class="comment">
            <CommentCard :comment="comment" />
        </div>

        <!-- 加载更多评论 -->
        <v-btn v-if="hasMoreComments" @click="loadMoreComments" color="secondary">加载更多</v-btn>
    </div>

    <v-snackbar v-model="snackbar">
        {{ snackbarMessage }}
        <template v-slot:actions>
            <v-btn color="primary" text="Close" @click="snackbar = false" />
        </template>
    </v-snackbar>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { MdPreview } from 'md-editor-v3';
import { Article } from '@/types/Article';
import { Comment } from '@/types/Comment';
import CommentCard from '@/components/CommentCard.vue';
import HeaderImage from '@/components/HeaderImage.vue';
import vuetify from '@/plugins/vuetify';
import { Shared } from '@/types/Shared';
import 'md-editor-v3/lib/preview.css';
import Cookies from 'js-cookie'; // 用于管理 token

const route = useRoute();
const router = useRouter();
const article = ref<Article>(new Article());
const articleContent = ref<string>('');
const loading = ref(true);
const formattedDate = ref<string>('');
const formattedUpdateDate = ref<string>('');
const comments = ref<Comment[]>([]);
const newCommentContent = ref<string>('');
const page = ref<number>(0);
const hasMoreComments = ref<boolean>(true);


const snackbar = ref(false);
const snackbarMessage = ref('');

function showSnackbar(message: string, timeout = 3000) {
    snackbarMessage.value = message;
    snackbar.value = true;
    setTimeout(() => (snackbar.value = false), timeout);
}

const rules = [
    (text: string) => text.length <= 512 ? true : '超过长度限制。',
    (text: string) => Boolean(Shared.currentUser) ? true : '请先登录。'
]

const isDarkMode = computed(() => vuetify.theme.current.value.dark);

async function fetchArticle() {
    const id = (route.params as { id: string }).id;
    try {
        const response = await axios.get(`/api/articles/${id}`);
        article.value = response.data;
        articleContent.value = article.value.content;

        formattedDate.value = new Date(article.value.publishedAt).toLocaleString();
        formattedUpdateDate.value = new Date(article.value.lastUpdated).toLocaleString();

        document.title = `${article.value.title} - ${Shared.info.value.title}`;
    } catch (error) {
        console.error('Error fetching article:', error);
    } finally {
        loading.value = false;
    }
}

async function fetchComments() {
    const id = (route.params as { id: string }).id;
    try {
        const response = await axios.get(`/api/comment/${id}`, { params: { page: page.value } });
        if (response.data.comments.length > 0) {
            comments.value.push(...response.data.comments);
            page.value += 1;
        } else {
            hasMoreComments.value = false;
        }
    } catch (error) {
        console.error('Error fetching comments:', error);
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

async function postComment() {
    const token = Cookies.get('token');
    if (!token) {
        showSnackbar('请先登录。');
        return;
    }

    const id = (route.params as { id: string }).id;
    try {
        await axios.post(`/api/comment/${id}`, {
            content: newCommentContent.value,
            parent: null
        }, { headers: { Authorization: `Bearer ${token}` } });

        newCommentContent.value = ''; // 清空输入框
        fetchComments(); // 重新加载评论
    } catch (error) {
        console.error('Error posting comment:', error);
    }
}

function loadMoreComments() {
    if (hasMoreComments.value) {
        fetchComments(); // 加载更多评论
    }
}

onMounted(() => {
    fetchArticle();
    fetchComments(); // 初始化加载评论
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

.comment {
    margin-bottom: 20px;
}

.reply {
    margin-left: 20px;
    border-left: 2px solid #ddd;
    padding-left: 20px;
}

.dark-md-reader {
    background-color: #121212;
    color: #f0f0f0;
}
</style>

<route lang="yaml">
meta:
  layout: appbar
</route>
