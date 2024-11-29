<template>
    <MdEditor ref="editor" v-model="props.content" :preview="vuetify.display.mdAndUp.value"
        :theme="(vuetify.theme.global.name.value as Themes)" @on-upload-img="onUploadImg" @on-drop="onDrop"
        @on-save="onSave" @on-change="onChange" />
</template>

<script setup lang="ts">
import { ExposeParam, MdEditor, Themes } from 'md-editor-v3';
import vuetify from '@/plugins/vuetify';
import 'md-editor-v3/lib/style.css';
import { FileUploader } from '@/utils/FileUploader';
import { saveAs } from 'file-saver';
import { ref, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

const editor = ref<ExposeParam>();
const router = useRouter();
const isDirty = ref(false);

// Props
const props = defineProps({
    content: {
        type: String,
        required: true
    }
});

// 图片上传处理
async function onUploadImg(
    files: File[],
    callback: (url: string[] | { url: string, alt: string, title: string }[]) => void
): Promise<void> {
    const urls = [];
    for (const file of files) {
        const uploader = new FileUploader();
        await uploader.startUploadSession(file);
        await uploader.uploadFile(file);
        if (uploader.uploadSuccess) {
            urls.push({
                url: uploader.fileUrl,
                alt: file.name,
                title: file.name
            });
        } else {
            console.error('Upload failed');
            console.error(uploader.uploadError);
            urls.push({
                url: 'Upload failed',
                alt: file.name,
                title: file.name
            });
        }
    }
    callback(urls);
}

// 内容保存处理
async function onSave(v: string, h: Promise<string>): Promise<void> {
    const blob = new Blob([v], { type: 'text/plain' });
    saveAs(blob, 'content.md');
    isDirty.value = false;  // 保存后，重置 dirty 状态
}

// 文件拖拽处理
async function onDrop(e: DragEvent): Promise<void> {
    if (e.dataTransfer?.files) {
        const files = Array.from(e.dataTransfer.files);
        for (const file of files) {
            const uploader = new FileUploader();
            await uploader.startUploadSession(file);
            await uploader.uploadFile(file);
            if (uploader.uploadSuccess) {
                editor.value?.insert((selectedText: string) => (
                    {
                        targetValue: `[${file.name}](${uploader.fileUrl})\n`,
                        select: false
                    }
                ));
            } else {
                console.error('Upload failed');
                console.error(uploader.uploadError);
                editor.value?.insert((selectedText: string) => (
                    {
                        targetValue: `[${file.name}](Upload failed)\n`,
                        select: false
                    }
                ));
            }
        }
    }
}

// 监听内容更改来设置是否为 dirty
function onChange(v: string): void {
    isDirty.value = true;
}

// 在页面刷新或关闭时提示
function handleBeforeUnload(event: BeforeUnloadEvent) {
    if (isDirty.value) {
        event.preventDefault();
    }
}

// 在切换路由时提示
const removeHook = router.beforeEach((to, from, next) => {
    if (isDirty.value && !window.confirm('您有未保存的更改，确定要离开吗？\nYour changes will be lost if you leave without saving.')) {
        next(false);
        return;
    }
    // 移除路由钩子，防止重复执行
    removeHook();
    // 跑走！
    next();
});

// 注册 window 的 beforeunload 事件
onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
});

// 在组件挂载时注册事件
onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
});
</script>