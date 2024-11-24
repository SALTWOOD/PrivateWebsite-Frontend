<template>
    <div v-if="!isRemoved" :style="props.isChildComment ? { paddingLeft: '5%' } : {}">
        <v-card variant="text">
            <v-card-title>
                <v-avatar v-if="!props.isChildComment" size="50" class="mr-3">
                    <img :src="comment.user.photo" alt="avatar" class="avatar-image" />
                </v-avatar>
                <span class="headline">{{ comment.user.username }}</span>
                <span class="comment-time">{{ formattedDate }}</span>
            </v-card-title>

            <v-textarea
                v-if="Shared.currentUser && isEditing"
                v-model="content"
                label="更改评论"
                rows="10"
            />
            <v-btn v-if="Shared.currentUser && isEditing" @click="confirmEditComment" color="primary" text="保存" />
            <v-btn v-if="Shared.currentUser && isEditing" @click="revertEdit" color="primary" text="取消" />

            <!-- 显示内容部分 -->
            <div v-if="!isEditing" class="comment-content">
                <el-col style="white-space: pre-wrap;">{{ comment.content }}</el-col>
            </div>

            <v-card-actions v-if="Shared.currentUser">
                <v-btn
                    icon
                    v-if="canEditOrDelete"
                    @click="editComment"
                    size="small"
                >
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                    icon
                    v-if="canEditOrDelete"
                    @click="confirmRemoveComment"
                    size="small"
                >
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
                <v-btn icon @click="replyComment" size="small">
                    <v-icon>mdi-reply</v-icon>
                </v-btn>
            </v-card-actions>
        </v-card>

        <!-- 子评论切换按钮 -->
        <v-btn
            icon
            v-if="hasReplies && !props.isChildComment"
            @click="toggleRepliesVisibility"
            size="small"
        >
            <v-icon>{{ isRepliesVisible ? 'mdi-chevron-double-up' : 'mdi-chevron-double-down' }}</v-icon>
        </v-btn>

        <!-- 子评论 -->
        <div v-if="isChildComment || (isRepliesVisible && comment.replies?.length)">
            <div v-for="reply in comment.replies" :key="reply.id">
                <CommentCard :isChildComment="true" :comment="reply" />
            </div>
        </div>

        <!-- 回复表单 -->
        <div v-if="Shared.currentUser && isReplying">
            <v-textarea v-model="replyContent" label="回复" rows="2" />
            <v-btn @click="postReply(comment.id)" color="primary">发送回复</v-btn>
        </div>

        <v-snackbar v-model="snackbar">
            {{ snackbarMessage }}
            <template v-slot:actions>
                <v-btn color="primary" text="Close" @click="snackbar = false" />
            </template>
        </v-snackbar>

        <!-- 删除确认对话框 -->
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

// 状态变量
const replyContent = ref('');
const isReplying = ref(false);
const isRemoved = ref(false);
const isRemoving = ref(false);
const isEditing = ref(false);
const isRepliesVisible = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref('');

// 获取路由信息
const route = useRoute();
const props = defineProps({
    comment: {
        type: Comment,
        required: true
    },
    isChildComment: {
        type: Boolean,
        default: false
    }
});

// 评论内容和日期
const comment = ref(props.comment);
const content = ref(comment.value.content);
const formattedDate = computed(() => new Date(comment.value.createdAt).toLocaleString());

// 计算属性：是否能编辑或删除
const canEditOrDelete = computed(() => comment.value.user.id === Shared.currentUser?.id || Shared.currentUser?.permission);

// 计算属性：是否有子评论
const hasReplies = computed(() => comment.value.replies?.length > 0);

// 回复评论
function replyComment() {
    isReplying.value = !isReplying.value;
}

// 编辑评论
function editComment() {
    if (!canEditOrDelete.value) {
        showSnackbar('这不是你的评论！');
        return;
    }
    isEditing.value = true;
}

// 取消编辑
function revertEdit() {
    isEditing.value = false;
    content.value = comment.value.content;
}

// 确认编辑
async function confirmEditComment() {
    try {
        const updatedComment = (await axios.put(`/api/comment/${comment.value.article}/${comment.value.id}`, {
            content: content.value,
            hash: comment.value.hash
        })).data;
        comment.value = updatedComment;
        isEditing.value = false;
    } catch (error) {
        showSnackbar('编辑失败！');
    }
}

// 确认删除
function confirmRemoveComment() {
    isRemoving.value = true;
}

// 删除评论
async function deleteComment() {
    if (!canEditOrDelete.value) {
        showSnackbar('这不是你的评论！');
        return;
    }
    try {
        const response = await axios.delete(`/api/comment/${comment.value.article}/${comment.value.id}`);
        if (response.status === 200) {
            isRemoved.value = true;
            showSnackbar('评论已删除！');
        }
    } catch (error) {
        showSnackbar('删除评论失败！');
    }
}

// 发布回复
async function postReply(parentId: number) {
    try {
        const id = (route.params as { id: string }).id;
        const response = await axios.post(`/api/comment/${id}`, {
            content: replyContent.value,
            parent: parentId,
        });
        const reply = new Comment();
        Object.assign(reply, response.data);
        comment.value.replies?.push(reply);
        replyContent.value = '';
        isReplying.value = false;
    } catch (error) {
        showSnackbar('回复失败！');
    }
}

// 显示提示信息
function showSnackbar(message: string, timeout = 3000) {
    snackbarMessage.value = message;
    snackbar.value = true;
    setTimeout(() => (snackbar.value = false), timeout);
}

// 切换子评论显示状态
function toggleRepliesVisibility() {
    isRepliesVisible.value = !isRepliesVisible.value;
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
