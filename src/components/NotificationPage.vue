<template>
    <h1 class="text-center">通知</h1>
    <br />
    <v-divider />
    <br />
    <v-btn text="标为已读" color="red" @click="markAsRead" />
    <br />
    <br />
    <v-divider />
    <br />
    <div v-for="notification in notifications" :key="notification.id" style="padding-left: 1.5%; padding-right: 1.5%;">
        <div>
            <v-badge v-if="!notification.read" color="red" icon="mdi-bell" />
            <CommentCard :comment="notification" style="margin-bottom: 20px; margin-right: 0.5rem;" />
        </div>
    </div>
    <div v-if="notifications.length === 0 && page === 0">似乎没有通知……的说</div>
    <div v-if="notifications.length === 0 && page > 0">已经到底了！</div>
    <div v-if="notifications.length > 0 || page !== 0">
        <br />
        <div>
            <v-btn :disabled="page <= 0" text="上一页" @click="toPreviousPage" class="mr-2" />
            {{ `第 ${page + 1} 页 / 共 ${Math.ceil(total / 10)} 页` }}
            <v-btn :disabled="page >= Math.ceil(total / 10) - 1" text="下一页" @click="toNextPage" class="ml-2" />
        </div>
    </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { Comment } from '@/types/Comment';
import CommentCard from '@/components/CommentCard.vue';

type Notification = Comment & { read: boolean }

const notifications = ref<Notification[]>([])
const total = ref(0)
const router = useRouter();

const props = defineProps({
    page: {
        type: Number,
        required: true,
    }
})

const page = ref(props.page)

async function toPreviousPage() {
    page.value -= 1;
    router.push(`/notifications/${page.value}`);
    await fetchNotifications();
}

async function toNextPage() {
    page.value += 1;
    router.push(`/notifications/${page.value}`);
    await fetchNotifications();
}

async function fetchNotifications() {
    const response = await axios.get<{ data: Notification[], total: number }>(`/api/notifications?all=true&page=${page.value}`);
    notifications.value = response.data.data
    total.value = response.data.total;
    notifications.value.forEach((notification) => {
        notification.content = notification.content.length > 200 || notification.content.includes('\n')
            ? `${notification.content.slice(0, Math.min(200, notification.content.indexOf('\n') - 1))}...`
            : notification.content;
    });
}

async function markAsRead() {
    await axios.post('/api/notifications/mark_as_read');
    await fetchNotifications();
}

onMounted(async () => {
    await fetchNotifications();
});
</script>