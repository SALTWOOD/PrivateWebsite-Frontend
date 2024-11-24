<template>
    <div v-if="!isRemoved">
        <v-card variant="text">
            <v-card-title>
                <v-avatar size="50" class="mr-3">
                    <img :src="comment.user.photo" alt="avatar" class="avatar-image" />
                </v-avatar>
                <span class="headline">{{ comment.user.username }}</span>
                <span class="comment-time">{{ formattedDate }}</span>
            </v-card-title>

            <v-card-text v-if="!isEditing">
                <span class="comment-content">{{ comment.content }}</span>
            </v-card-text>

            <v-textarea v-if="Shared.currentUser && isEditing" v-model="content" label="更改评论" rows="10" />
            <v-btn class="mr-4" v-if="Shared.currentUser && isEditing" @click="confirmEditComment" color="primary" text="保存" />
            <v-btn class="mr-4" v-if="Shared.currentUser && isEditing" @click="revertEdit" color="primary" text="取消" />


            <v-card-actions v-if="Shared.currentUser">
                <v-btn icon @click="editComment" size="small">
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon @click="confirmRemoveComment" size="small">
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
                <v-btn icon @click="replyComment" size="small">
                    <v-icon>mdi-reply</v-icon>
                </v-btn>
            </v-card-actions>
        </v-card>

        <!-- 子评论 -->
        <div v-if="comment.replies?.length">
            <div v-for="reply in comment.replies" :key="reply.id">
                <CommentCard :comment="reply" />
            </div>
        </div>

        <!-- 回复表单 -->
        <div v-if="Shared.currentUser && isReplying">
            <v-textarea v-model="replyContent" label="回复" rows="2" />
            <v-btn @click="postReply(comment.id)" color="primary">发送 回复</v-btn>
        </div>

        <v-snackbar v-model="snackbar">
            {{ snackbarMessage }}
            <template v-slot:actions>
                <v-btn color="primary" text="Close" @click="snackbar = false" />
            </template>
        </v-snackbar>

        <v-dialog v-model="isRemoving" max-width="500px">
            <v-card>
                <v-card-title>确认删除</v-card-title>
                <v-card-text>您确定要删除所选评论吗？</v-card-text>
                <v-card-actions>
                    <v-btn @click="deleteComment" color="primary" text="确认"></v-btn>
                    <v-btn @click="isRemoving = false" color="red" text="取消"></v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import axios from 'axios';
import { Shared } from '@/types/Shared';
import { useRoute } from 'vue-router';
import { Comment } from '@/types/Comment';

const replyContent = ref('');
const isReplying = ref(false);
const isRemoved = ref(false);
const isRemoving = ref(false);
const isEditing = ref(false);

const snackbar = ref(false);
const snackbarMessage = ref('');

const props = defineProps<{
    comment: Comment;
}>();

const comment = ref(props.comment);

const content = ref(comment.value.content);

const formattedDate = computed(() => new Date(comment.value.createdAt).toLocaleString());

function replyComment() {
    isReplying.value = !isReplying.value;
}

function revertEdit() {
    isEditing.value = false;
    content.value = comment.value.content;
}

function editComment() {
    if (comment.value.user.id !== Shared.currentUser?.id) {
        showSnackbar('这不是你的评论！');
        return;
    }
    isEditing.value = true;
}

async function confirmEditComment() {
    comment.value = (await axios.put(`/api/comment/${comment.value.article}/${comment.value.id}`, {
        content: content.value,
        hash: comment.value.hash
    })).data;
    isEditing.value = false;
}

function confirmRemoveComment() {
    isRemoving.value = true;
}

async function deleteComment() {
    if (comment.value.user.id !== Shared.currentUser?.id) {
        showSnackbar('这不是你的评论！');
        return;
    }
    try {
        const response = await axios.delete(`/api/comment/${comment.value.id}`);
        if (response.status === 200) {
            isRemoved.value = true;
            showSnackbar('评论已删除！');
        }
    } catch (error) {
        showSnackbar('删除评论失败！');
    }
}

async function postReply(parentId: number) {
    try {
        const id = (useRoute().params as { id: string }).id;
        const response = await axios.post(`/api/comment/${id}`, {
            content: replyContent.value,
            parent: parentId,
        });
        comment.value.replies?.push(response.data);
        replyContent.value = '';
        isReplying.value = false;
    } catch (error) {
        showSnackbar('回复评论失败！');
    }
}

function showSnackbar(message: string, timeout = 3000) {
    snackbarMessage.value = message;
    snackbar.value = true;
    setTimeout(() => (snackbar.value = false), timeout);
}
</script>

<style scoped>
.avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
}

.comment-time {
    font-size: 14px;
    color: #757575;
    margin-left: 10px;
}

.comment-content {
    margin-left: 20px;
    font-size: 16px;
}
</style>
