import axios from 'axios';

export class FileUploader {
    private chunkSize: number = 16 * 1024;  // 每个分片的大小，16KB
    private maxFileSize: number = 50;  // 最大支持的文件大小，单位MB

    public sessionId: string | null = null;
    public progress: number = 0;
    public uploading: boolean = false;
    public uploadSuccess: boolean = false;
    public uploadError: string | null = null;
    public fileUrl: string = '';

    // 检查文件大小是否超过限制
    public isFileTooLarge(file: File): boolean {
        return file.size > this.maxFileSize * 1024 * 1024;  // MB 转 Bytes
    }

    // 启动上传会话
    public async startUploadSession(file: File): Promise<void> {
        try {
            const response = await axios.post('/api/upload/new', { filename: file.name, fileSize: file.size });
            this.sessionId = response.data.sessionId;
        } catch (error) {
            console.error('启动上传会话失败:', error);
            this.uploadError = '启动上传会话失败，请重试。';
        }
    }

    // 上传文件分片
    public async uploadFile(file: File, progressAction: ((progress: number) => void) | null = null): Promise<void> {
        if (!file || !this.sessionId) return;

        const totalChunks = Math.ceil(file.size / this.chunkSize);  // 计算总分片数
        let currentChunk = 0;

        this.uploading = true;
        this.uploadSuccess = false;
        this.uploadError = null;  // 清空错误信息

        // 分片上传
        for (let start = 0; start < file.size; start += this.chunkSize) {
            const chunk = file.slice(start, start + this.chunkSize);
            const formData = new FormData();
            formData.append('file', chunk);
            formData.append('sessionId', this.sessionId);
            formData.append('filename', file.name);
            formData.append('chunk', currentChunk.toString());
            formData.append('totalChunks', totalChunks.toString());

            try {
                await this.uploadChunk(formData);
                currentChunk++;
                this.progress = Math.floor((currentChunk / totalChunks) * 100); // 更新进度
                if (progressAction) progressAction(this.progress);
            } catch (error: any) {
                console.error('上传失败', error);
                this.uploading = false;
                this.uploadSuccess = false;

                if (error.response?.data?.error) {
                    this.uploadError = `服务器返回错误信息: ${error.response.data.error}`;
                } else {
                    this.uploadError = '上传过程中出现错误，请检查网络连接或稍后重试。';
                }
                return;
            }
        }

        if (this.uploadError) {
            return;
        }

        this.uploadSuccess = true;

        // 构建文件的访问链接
        this.fileUrl = `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}/assets/uploads/${file.name}`;
        this.uploading = false;
    }

    // 上传分片
    private async uploadChunk(formData: FormData): Promise<void> {
        try {
            const response = await axios.post('/api/upload/session', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // 如果服务器返回非2xx状态码，则抛出错误
            if (response.status < 200 || response.status >= 300) {
                throw new Error(`上传失败: ${response.statusText}`);
            }
        } catch (error) {
            this.uploadError = String(error);
            this.uploadSuccess = false;
            throw error;
        }
    }
}
