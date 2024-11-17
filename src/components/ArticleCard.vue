<template>
    <div class="article-card" @click="goToArticle">
        <div class="article-card-image" :style="{ backgroundImage: 'url(' + background + ')' }"></div>
        <div class="article-card-content">
            <div class="article-title">{{ title }}</div> <!-- 使用 div 替代 -->
            <p>{{ author }}</p>
        </div>
    </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Article } from '@/types/Article';

const props = defineProps({
    article: {
        type: Article,
        required: true
    }
});

const title = ref('');
const background = ref('');
const author = ref('');
const url = ref('');

const router = useRouter();

async function fetchArticleData() {
    try {
        const data = props.article;
        title.value = data.title;
        background.value = data.background;
        author.value = data.authorName;
        url.value = `/article/${data.id}`;
    } catch (error) {
        console.error('Error fetching article data:', error);
    }
}

function goToArticle() {
    router.push(url.value);
}

onMounted(() => {
    fetchArticleData();
});
</script>

<style scoped>
.article-card {
    width: 100%;
    max-width: 400px;
    margin: 20px;
    cursor: pointer;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: transform 0.3s ease;
}

.article-card:hover {
    transform: scale(1.05);
}

.article-card-image {
    height: 200px;
    background-size: cover;
    background-position: center;
}

.article-card-content {
    padding: 15px;
    background-color: white;
}

.article-title {
    margin: 0;
    font-size: 18px;
    color: black;  /* 修改为黑色文字 */
}

.article-card-content p {
    margin: 10px 0 0;
    font-size: 14px;
    color: gray;
}
</style>
