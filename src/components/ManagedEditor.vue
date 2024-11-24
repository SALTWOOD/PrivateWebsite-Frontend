<template>
    <MdEditor v-model="props.content" :preview="vuetify.display.mdAndUp.value"
        :theme="(vuetify.theme.global.name.value as 'dark' | 'light')" @on-upload-img="onUploadImg" />
</template>

<script setup lang="ts">
import { MdEditor } from 'md-editor-v3';
import vuetify from '@/plugins/vuetify';
import 'md-editor-v3/lib/style.css';
import { FileUploader } from '@/utils/FileUploader';

const props = defineProps({
    content: {
        type: String,
        required: true
    }
});

async function onUploadImg(files: File[], callback: (url: string[] | { url: string, alt: string, title: string }[]) => void): Promise<void> {
    const uploader = new FileUploader();
    const urls = [];
    for (const file of files) {
        await uploader.startUploadSession(file);
        await uploader.uploadFile(file);
        urls.push(uploader.fileUrl);
    }
    callback(urls);
}
</script>