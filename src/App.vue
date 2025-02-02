<template>
  <v-app>
    <v-main>
      <!-- 判断数据加载状态，显示加载动画 -->
      <div v-if="!loaded && (!fetchDataStatus.user || !fetchDataStatus.info)" class="loading-overlay">
        <v-progress-circular indeterminate color="primary" size="70"></v-progress-circular> <!-- 调整加载条大小 -->
        <p class="loading-text">正在加载...</p>
      </div>

      <!-- 请求数据成功后才渲染 <router-view> -->
      <router-view v-if="(fetchDataStatus.user && fetchDataStatus.info) || loaded" />

      <!-- 错误提示 -->
      <v-snackbar v-model="errorMessage" color="red" timeout="3000">
        {{ errorMsg }}
      </v-snackbar>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import config from "../package.json";
import axios from "axios";
import { Shared } from "@/types/Shared";
import { UserEntity } from "./types/UserEntity";
import { ref } from 'vue';

// 超时时间常量
const TIMEOUT = 3000; // 超时

// 定义状态和变量
const fetchDataStatus = {
  user: false,
  info: false,
};
const loaded = ref<boolean>(false); // 页面加载状态
const errorMessage = ref<boolean>(false); // 错误提示状态
const errorMsg = ref<string>(''); // 错误提示内容

const about = () => {
    return String.raw`
This project is created by SaltWood for his own use.
Any non-commercial use is welcome, although this project was not created for others.
Current version: ${config.version}.

PrivateWebsite is a personal website.

This software follows the MIT license.
Copyright (c) 2024-${Math.max(2024, new Date().getFullYear())} SaltWood.

https://github.com/SALTWOOD/PrivateWebsite-Frontend
https://github.com/SALTWOOD/PrivateWebsite-Backend
`
}
// @ts-ignore
window.about = () => console.log(about());

const tip = String.raw`
/*
 *      ____            _       __     __         _ __
 *     / __ \          | |     / /__  / /_  _____(_) /____
 *    / /_/ /  ______  | | /| / / _ \/ __ \/ ___/ / __/ _ \
 *   / ____/  /_____/  | |/ |/ /  __/ /_/ (__  ) / /_/  __/
 *  /_/                |__/|__/\___/_.___/____/_/\__/\___/
 *                       v${config.version} | Created by SaltWood
 *                       Type "about()" for more information.
 */
`
console.log(tip);

// 请求函数：带超时、错误处理和加载状态
const fetchData = async () => {
  try {
    // 拉取用户数据和网站信息，设置10秒超时
    const userRequest = axios.get('/api/user', { timeout: TIMEOUT, validateStatus: (status) => true });
    const infoRequest = axios.get('/api/site/info', { timeout: TIMEOUT, validateStatus: (status) => true });
    const backgroundRequest = axios.get('/api/site/random_background', { timeout: TIMEOUT, validateStatus: (status) => true });

    // 等待两个请求完成
    const [userResponse, infoResponse, backgroundResponse] = await Promise.all([userRequest, infoRequest, backgroundRequest]);

    // 处理响应数据
    if (userResponse.status === 200) {
      Shared.currentUser = userResponse.data as UserEntity;
    }
    if (infoResponse.status === 200) {
      Shared.info.value = infoResponse.data;
    }
    if (backgroundResponse.status === 200) {
      Shared.background = backgroundResponse.data.url || '';
    }

    document.title = Shared.info.value.title;

    // 更新状态
    fetchDataStatus.user = true;
    fetchDataStatus.info = true;

  } catch (error) {
    console.error("请求失败", error);

    // 设置错误消息并显示
    errorMsg.value = "请求失败。错误信息请查看控制台。";
    errorMessage.value = true;
  } finally {
    loaded.value = true; // 加载完成
  }
};

// 在组件创建时调用 fetchData
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
/* 加载动画的样式 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8); /* 修改背景颜色为黑色 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* 加载文本的样式 */
.loading-text {
  color: white;
  font-size: 18px;
  padding-left: 1%;
  margin-top: 10px;
}
</style>
