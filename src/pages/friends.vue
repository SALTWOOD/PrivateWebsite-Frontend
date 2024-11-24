<template>
    <div>
        <!-- 顶部图片 -->
        <HeaderImage />

        <br />
        <h2 class="text-center">这里是友链。</h2>

        <!-- 友链展示部分 -->
        <v-container>
            <v-row>
                <v-col v-for="friend in friends" :key="friend.url" cols="12" sm="6" md="4" lg="3">
                    <v-card class="mx-auto" max-width="300">
                        <!-- 控制头像大小并留出空间 -->
                        <v-img :src="friend.avatar" alt="Avatar" class="avatar-img" />
                        <v-card-title>{{ friend.name }}</v-card-title>
                        <v-card-subtitle>{{ friend.description }}</v-card-subtitle>
                        <v-card-actions>
                            <v-btn :href="friend.url" target="_blank" color="primary" variant="text" text="去看看" />
                        </v-card-actions>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>

        <!-- 加载失败提示 -->
        <v-snackbar v-model="snackbar" color="red" timeout="3000">
            {{ snackbarMessage }}
        </v-snackbar>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";

// 数据
const friends: Ref<{ name: string; url: string; avatar: string; description: string }[]> = ref<
    { name: string; url: string; avatar: string; description: string }[]
>([]);
const snackbar = ref(false);
const snackbarMessage = ref("");

// 获取友链数据
async function fetchFriends() {
    try {
        const response = await axios.get("/api/site/friends");
        if (response.status === 200) {
            friends.value = response.data;
        } else {
            showError("无法拉取友链数据");
        }
    } catch (error) {
        showError("加载友链数据时出错");
    }
}

// 显示错误信息
function showError(message: string) {
    snackbarMessage.value = message;
    snackbar.value = true;
}

// 页面加载时获取数据
onMounted(fetchFriends);
</script>

<style scoped>
.avatar-img {
    object-fit: cover;
    border-radius: 50%;
    width: 90px;
    height: 90px;
    margin: 10px auto;
}
</style>

<route lang="yaml">
    meta:
      layout: appbar
</route>