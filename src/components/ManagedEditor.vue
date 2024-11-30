<template>
    <MdEditor ref="editor" v-model="props.article.content" :preview="vuetify.display.mdAndUp.value"
        :theme="(vuetify.theme.global.name.value as Themes)" @on-upload-img="onUploadImg" @on-drop="onDrop"
        @on-save="onSave" />
</template>

<script setup lang="ts">
import { ExposeParam, MdEditor, Themes } from 'md-editor-v3';
import vuetify from '@/plugins/vuetify';
import 'md-editor-v3/lib/style.css';
import { FileUploader } from '@/utils/FileUploader';
import { saveAs } from 'file-saver';
import { ref } from 'vue';
import { Article } from '@/types/Article';

const editor = ref<ExposeParam>();
const isDirty = ref(false);

// Props
const props = defineProps({
    article: {
        type: Article,
        required: true
    },
    title: {
        type: String,
        required: false,
        default: null
    }
});

// 图片上传处理
async function onUploadImg(
    files: File[],
    callback: (url: string[] | { url: string, alt: string, title: string }[]) => void
): Promise<void> {
    const urls = [];
    for (const file of files) {
        try {
            const uploader = new FileUploader();
            await uploader.startUploadSession(file);
            const url = await uploader.uploadFile(file);
            urls.push({
                url,
                alt: file.name,
                title: file.name
            });
        } catch (error) {
            console.error(error);
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
    saveAs(blob, `${props.title || 'Untitled'}.md`);
    isDirty.value = false;  // 保存后，重置 dirty 状态
}

// 文件拖拽处理
async function onDrop(e: DragEvent): Promise<void> {
    if (e.dataTransfer?.files) {
        const files = Array.from(e.dataTransfer.files);
        for (const file of files) {
            try {
                const uploader = new FileUploader();
                await uploader.startUploadSession(file);
                const url = await uploader.uploadFile(file);
                editor.value?.insert((selectedText: string) => (
                    {
                        targetValue: `${selectedText}[${file.name}](${url})\n`,
                        select: false
                    }
                ));
            } catch (error) {
                console.error(error);
                editor.value?.insert((selectedText: string) => (
                    {
                        targetValue: `${selectedText}[${file.name}](Upload failed)\n`,
                        select: false
                    }
                ));
            }
        }
    }
}
</script>