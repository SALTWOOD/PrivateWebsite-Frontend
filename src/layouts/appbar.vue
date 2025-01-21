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

        <v-app-bar-nav-icon @click="toNotifications">
            <v-badge :model-value="notifCount !== 0" :content="notifCount" color="red">
                <v-icon>mdi-bell</v-icon>
            </v-badge>
        </v-app-bar-nav-icon>
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
            <v-list-item exact prepend-icon="mdi-link" title="友链" :to="{ path: '/friends' }" />
            <v-list-item exact prepend-icon="mdi-plus-box-outline" title="创建新文章" :to="{ path: '/article/new' }" v-if="isSuperAdmin" />
            <v-list-item exact prepend-icon="mdi-publish" title="上传文件" :to="{ path: '/upload' }" v-if="isSuperAdmin" />
            <v-divider />
            <!--接下来将 custom sidebar 里头的加到这里-->
            <v-list-item exact class="mt-1" v-for="item in customSidebar" :key="item.title" :title="item.title" :to="{ path: item.to }" :href="item.href" :prepend-icon="item.icon" />
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

const isLoggedIn = computed(() => Boolean(Shared.currentUser));
const isSuperAdmin = computed(() => (Shared.currentUser?.permission || 0) > 0);
const userName = computed(() => (Shared.currentUser?.username || '未登录'));
const avatarUrl = computed(() => Shared.currentUser?.photo || '/main/default_avatar.png');
const drawer: Ref<boolean | null> = ref(null);
const isDarkMode = ref(vuetify.theme.current.value.dark);
const notifCount = ref(0);
const customSidebar: Ref<{
    title: string;
    icon: string;
    to?: string;
    href?: string;
}[]> = ref([]);

function login(): void {
    router.push('/user/login');
}

function toggleTheme() {
    isDarkMode.value = !isDarkMode.value;
    vuetify.theme.global.name.value = isDarkMode.value ? 'dark' : 'light';
}

function logout(): void {
    Cookies.remove('pw-token');
    location.reload();
}

function openDrawer(): void {
    drawer.value = !(drawer.value ?? false);
}

function toNotifications(): void {
    router.push('/notifications');
}

async function fetchNotifCount() {
    const response = await axios.get<{ count: number }>('/api/notifications/count');
    notifCount.value = response.data.count;
}

async function fetchCustomSidebar() {
    const response = await axios.get<{ title: string; icon: string; to?: string; href?: string }[]>('/api/site/sidebar');
    customSidebar.value = response.data;
}

onMounted(async () => {
    await fetchNotifCount();
    await fetchCustomSidebar();
});
</script>