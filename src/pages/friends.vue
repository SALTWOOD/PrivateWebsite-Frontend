<template>
    <div>
        <!-- 顶部图片 -->
        <HeaderImage />

        <br />
        <h2 class="text-center">这里是友链。</h2>
        <br/>
        <v-divider />
        <br />

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
                            <v-btn v-if="!Shared.currentUser?.permission" :href="friend.url" target="_blank"
                                color="primary" variant="text" text="去看看" />
                            <v-btn v-if="Shared.currentUser?.permission && inEdit" icon="mdi-pencil"
                                @click="showModifyDialog(friend)" />
                            <v-btn v-if="Shared.currentUser?.permission && inEdit" icon="mdi-delete"
                                @click="removeFriend(friend)" />
                            <v-btn v-if="Shared.currentUser?.permission" :href="friend.url" icon="mdi-link-variant" />
                        </v-card-actions>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>

        <!-- 加载失败提示 -->
        <v-snackbar v-model="snackbar" color="red" timeout="3000">
            {{ snackbarMessage }}
        </v-snackbar>



        <v-dialog v-model="infoDialog" max-width="500px">
            <v-card>
                <v-card-title>
                    <span class="headline">新建/修改友链</span>
                </v-card-title>
                <v-card-text>
                    <v-text-field v-model="link.name" label="名称" required />
                    <v-text-field v-model="link.description" label="描述" required />
                    <v-text-field v-model="link.url" label="链接" required />
                    <v-text-field v-model="link.avatar" label="头像" required />
                </v-card-text>
                <v-card-actions>
                    <v-btn @click="infoDialog = false" color="grey" text="取消" />
                    <v-btn @click="runAction(link)" color="primary" text="创建" />
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import { Shared } from "@/types/Shared";
import { FriendLink } from "@/types/FriendLink";

// 数据
const friends: Ref<FriendLink[]> = ref<
    FriendLink[]
>([]);
const snackbar = ref(false);
const snackbarMessage = ref("");

const link = ref(new FriendLink());
const infoDialog = ref(false);
const infoAction: Ref<"modify" | "create"> = ref("create");

const inEdit = ref<boolean>(false);

// 获取友链数据
async function fetchFriends() {
    try {
        const response = await axios.get("/api/friends");
        if (response.status === 200) {
            friends.value = response.data;
        } else {
            showError("无法拉取友链数据");
        }
    } catch (error) {
        showError("加载友链数据时出错");
    }
}

function showModifyDialog(friend: FriendLink) {
    link.value = friend;
    infoAction.value = "modify";
    infoDialog.value = true;
}

function showCreateDialog() {
    link.value = new FriendLink();
    infoAction.value = "create";
    infoDialog.value = true;
}

async function modifyFriend(friend: FriendLink) {
    // throw new Error("Not implemented.");
    try {
        await axios.put(`/api/friends/${friend.id}`, friend);
        await fetchFriends();
    } catch (error) {
        showError("更改友链数据时出错")
    }
}

async function createFriend(friend: FriendLink) {
    try {
        await axios.post("/api/friends", friend);
        await fetchFriends();
    } catch (error) {
        showError("添加友链数据时出错")
    }
}

async function removeFriend(friend: FriendLink) {
    try {
        await axios.delete(`/api/friends/${friend.id}`);
        await fetchFriends();
    } catch (error) {
        showError("删除友链数据时出错")
    }
}

function runAction(friend: FriendLink) {
    switch (infoAction.value) {
        case "create":
            createFriend(friend);
            break;
        case "modify":
            modifyFriend(friend);
            break;
    }
}

// 显示错误信息
function showError(message: string) {
    snackbarMessage.value = message;
    snackbar.value = true;
}

// 页面加载时获取数据
onMounted(async () => {
    if (Shared.currentUser?.permission) Shared.changeButtons({
        "mdi-plus-thick": showCreateDialog,
        "mdi-pencil": () => inEdit.value = !inEdit.value
    });
    document.title = `友链 - ${Shared.info.value.title}`;
    await fetchFriends();
});
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