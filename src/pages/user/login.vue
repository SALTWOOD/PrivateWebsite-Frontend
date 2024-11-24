<template>
    <v-app>
        <v-main>
            <v-container fluid class="d-flex justify-center align-center" style="height: 100vh;">
                <v-card width="90%" height="90%" class="text-center" style="display: flex; 
                    align-items: center; 
                    justify-content: center;">
                    <v-card-actions class="pa-2" style="position: absolute; top: 0; left: 0;">
                        <v-btn icon @click="getBack" color="indigo">
                            <v-icon>mdi-arrow-left</v-icon>
                        </v-btn>
                    </v-card-actions>
                
                    <v-card-text v-if="!success && !failure">
                        <h1 class="mb-5" v-text="`${Shared.info.value.title} - 登录`"></h1>
                        <v-card :disabled="loading" :loading="loading" color="indigo" append-icon="mdi-open-in-new" class="mx-auto"
                            max-width="344" prepend-icon="mdi-github" subtitle="点击跳转到 GitHub" title="使用 GitHub 登录" variant="outlined"
                            @click="getCode">
                            <template v-slot:loader="{ isActive }">
                              <v-progress-linear :active="isActive" color="deep-purple" height="4" indeterminate></v-progress-linear>
                            </template>
                        </v-card>
                    </v-card-text>
                
                    <!-- 登录成功 -->
                    <v-card-text v-else-if="success">
                        <h2 class="mb-5">登录成功！</h2>
                        <h3>欢迎回来，{{ username }}</h3>
                        <p>如未自动跳转，请手动跳转</p>
                    </v-card-text>
                
                    <!-- 登录失败 -->
                    <v-card-text v-else>
                        <h2 class="mb-5">登录失败</h2>
                        <p>{{ failureMessageArea }}</p>
                    </v-card-text>
                </v-card>
            </v-container>
        </v-main>
    </v-app>
</template>
  
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Shared } from '@/types/Shared';
import { UserEntity } from '@/types/UserEntity';

document.title = `登录 - ${Shared.info.value.title}`;

// 使用 Vue Router
const router = useRouter();
const route = useRoute();

// 定义响应变量
const loading = ref<boolean>(false);
const success = ref<boolean>(false);
const failure = ref<boolean>(false);
const failureMessageArea = ref<string>('');
const username = ref<string>('');

// 返回上一页
const getBack = () => {
  router.go(-1);
}

// 获取客户端 ID
const getCode = async () => {
  try {
    loading.value = true;
    const response = await axios.get('/api/auth/id');
    const redirect_uri = window.location.href;
    const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${response.data}&redirect_uri=${encodeURIComponent(redirect_uri)}`;
    window.location.href = redirectUrl;
  } catch (error) {
    loading.value = false;
    console.error("获取 client_id 失败:", error);
  }
}

// 处理回调
const callback = async (code: string) => {
  try {
    const url = `/api/auth/login?code=${code}`;
    const response = await axios.post<UserEntity & { error: string}>(url);

    if (response.status === 200) {
      success.value = true;
      username.value = response.data.username;
      setTimeout(() => {
        redirectToHome();
      }, 3000);
    } else {
      failure.value = true;
      failureMessageArea.value = response.data.error;
      loading.value = false;
      console.log("登录失败，状态:", response.status);
    }
    Shared.currentUser = response.data;
  } catch (error) {
    console.error("登录失败:", error);
    failure.value = true;
    failureMessageArea.value = String(error);
    loading.value = false;
  }
}

// 重定向到主页
const redirectToHome = () => {
  router.push('..');
}

// 挂载时生命周期钩子
onMounted(async () => {
  if (Cookies.get('token')) {
    redirectToHome();
  } else if (route.query.code) {
    loading.value = true;
    callback(route.query.code as string).finally(() => {
      loading.value = false;
    });
  }
});
</script>