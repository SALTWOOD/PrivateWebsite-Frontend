<template>
    <div class="file-upload">
        <h1>文件上传</h1>

        <input type="file" @change="handleFileChange" />
        <button @click="startUpload" :disabled="isUploading">开始上传</button>

        <div v-if="isUploading" class="progress-container">
            <p>上传进度: {{ progress }}%</p>
            <div class="progress-bar">
                <div class="progress-fill" :style="{ width: progress + '%' }"></div>
            </div>
        </div>

        <div v-if="uploadError" class="error-message">
            <p>上传失败: {{ uploadError }}</p>
        </div>

        <div v-if="uploadSuccess">
            <p>上传成功！</p>
            <p>文件访问 URL: 
                <a :href="fileUrl" target="_blank">{{ fileUrl }}</a>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { FileUploader } from '@/utils/FileUploader';

const fileUploader = new FileUploader();
const selectedFile = ref<File | null>(null);
const isUploading = ref(false);
const progress = ref(0);  // 用于绑定前端进度条
const uploadError = ref<string | null>(null);
const uploadSuccess = ref(false);
const fileUrl = ref('');

// 处理文件选择
const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
        selectedFile.value = input.files[0];
    }
};

// 启动上传
const startUpload = async () => {
    if (!selectedFile.value) {
        uploadError.value = '未选择文件，请选择一个文件后重试。';
        return;
    }

    if (fileUploader.isFileTooLarge(selectedFile.value)) {
        uploadError.value = '文件过大，请选择小于 50MB 的文件。';
        return;
    }

    try {
        isUploading.value = true;
        uploadError.value = null;  // 清空错误信息
        progress.value = 0;
        uploadSuccess.value = false;

        // 启动上传会话
        await fileUploader.startUploadSession(selectedFile.value);

        // 上传文件
        await fileUploader.uploadFile(selectedFile.value, (value) => progress.value = value);

        // 上传成功后更新状态
        if (fileUploader.uploadSuccess) {
            uploadSuccess.value = true;
            fileUrl.value = fileUploader.fileUrl;
        } else {
            uploadError.value = fileUploader.uploadError || '上传失败，请稍后重试。';
        }

        progress.value = 100;
    } finally {
        isUploading.value = false;
    }
};
</script>

<style scoped>
.file-upload {
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
}

input[type="file"] {
    margin: 10px 0;
}

button {
    padding: 10px 20px;
    background-color: #4CAF50;
    color: white;
    border: none;
    cursor: pointer;
}

button:disabled {
    background-color: #ccc;
}

.progress-container {
    margin-top: 20px;
    text-align: left;
}

.progress-bar {
    width: 100%;
    height: 10px;
    background-color: #ccc;
    border-radius: 5px;
    overflow: hidden;
    margin-top: 10px;
}

.progress-fill {
    height: 100%;
    background-color: #4CAF50;
    transition: width 0.2s;
}

.error-message {
    color: red;
    margin-top: 10px;
}

a {
    color: blue;
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}
</style>

<route lang="yaml">
meta:
  layout: appbar
</route>
