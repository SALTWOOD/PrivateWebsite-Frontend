<template>
    <v-app-bar app color="primary">
        <v-app-bar-nav-icon @click="openDrawer" />
        <v-toolbar-title :text="Shared.info.value.title" />
        <v-spacer />

        <template #append>
            <v-btn id="menu-activator" icon>
                <v-icon>mdi-account-circle</v-icon>
            </v-btn>
        </template>

        <v-app-bar-nav-icon @click="toggleTheme"
            :icon="vuetify.theme.global.name.value === 'dark' ? 'mdi-moon-waxing-crescent' : 'mdi-white-balance-sunny'" />
        <v-menu activator="#menu-activator" :close-on-content-click="false" location="end">
            <v-card>
                <v-card-text>
                    <div class="mx-auto text-center">
                        <v-avatar :image="avatarUrl" size="70" />
                        <h3 class="my-3">{{ userName }}</h3>
                        <v-divider class="my-4" />
                        <v-btn v-if="!isLoggedIn" prepend-icon="mdi-login" variant="text" @click="login">
                            登录
                        </v-btn>

                        <v-btn v-if="isLoggedIn" prepend-icon="mdi-logout" variant="text" @click="logout">
                            登出
                        </v-btn>

                        <!-- 切换按钮
                                    <v-btn v-if="isSuperAdmin" small @click="showSwitchDialog">
                                        切换
                                    </v-btn>-->

                    </div>
                </v-card-text>
            </v-card>
        </v-menu>

    </v-app-bar>

    <v-navigation-drawer v-model="drawer" :clipped="$vuetify.display.mdAndUp" :permanent="$vuetify.display.mdAndUp">
        <v-list class="mt-10" density="compact" nav>
            <v-list-item exact prepend-icon="mdi-home-variant-outline" title="主页" :to="{ path: '/' }" />
            <v-list-item exact prepend-icon="mdi-train" title="开往" href="https://www.travellings.cn/go.html" />
            <v-list-item exact prepend-icon="mdi-plus-box-outline" title="创建新文章" :to="{ path: '/article/new' }" v-if="isSuperAdmin" />
            <v-list-item exact prepend-icon="mdi-publish" title="上传文件" :to="{ path: '/upload' }" v-if="isSuperAdmin" />
        </v-list>
    </v-navigation-drawer>

    <v-container fluid>
        <router-view />
    </v-container>
</template>

<script setup lang="ts">
import vuetify from '@/plugins/vuetify';
import router from '@/router';
import { Shared } from '@/types/Shared';
import axios from 'axios';
import Cookies from 'js-cookie';

const isLoggedIn = ref(false);
const isSuperAdmin = ref(false);
const userName = ref('未登录');
const avatarUrl = ref('');
const drawer = ref(true);
const isDarkMode = ref(vuetify.theme.current.value.dark);

function login(): void {
    router.push('/user/login');
}

function toggleTheme() {
    isDarkMode.value = !isDarkMode.value;
    vuetify.theme.global.name.value = isDarkMode.value ? 'dark' : 'light';
}

function logout(): void {
    Cookies.remove('token');
    location.reload();
}

function openDrawer(): void {
    drawer.value = !drawer.value;
}

onMounted(async () => {
    let response = await axios.get('/api/user');
    // 判断响应
    if (response.status !== 200) {
        isLoggedIn.value = false;
        isSuperAdmin.value = false;
        return;
    }

    // 登录成功后处理数据
    const data = response.data as {
        permission: number,
        username: string,
        photo: string
    };

    // 先处理标志位
    isLoggedIn.value = true;
    isSuperAdmin.value = data.permission >= 1;

    // 处理用户名和头像
    userName.value = data.username;
    avatarUrl.value = data.photo;
    Shared.currentUser = data;
});
</script>