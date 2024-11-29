<template>
    <MdEditor ref="editor" v-model="props.content" :preview="vuetify.display.mdAndUp.value"
        :theme="(vuetify.theme.global.name.value as 'dark' | 'light')" @on-upload-img="onUploadImg" @on-drop="onDrop" @on-save="onSave" />
</template>

<script setup lang="ts">
import { ExposeParam, MdEditor } from 'md-editor-v3';
import vuetify from '@/plugins/vuetify';
import 'md-editor-v3/lib/style.css';
import { FileUploader } from '@/utils/FileUploader';
import { saveAs } from 'file-saver';

const editor = ref<ExposeParam>();

const props = defineProps({
    content: {
        type: String,
        required: true
    }
});

async function onUploadImg(files: File[], callback: (url: string[] | { url: string, alt: string, title: string }[]) => void): Promise<void> {
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

async function onSave(v: string, h: Promise<string>): Promise<void> {
    const blob = new Blob([v], { type: 'text/plain' });
    saveAs(blob, 'content.md');
}

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
</script>