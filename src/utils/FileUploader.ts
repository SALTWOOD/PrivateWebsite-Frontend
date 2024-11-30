import axios from 'axios';

export class FileUploader {
    private chunkSize: number = 16 * 1024;  // 每个分片的大小，16KB
    private maxFileSize: number = 50;  // 最大支持的文件大小，单位MB

    public sessionId: string | null = null;
    public progress: number = 0;
    public finalName: string = '';

    // 检查文件大小是否超过限制
    public isFileTooLarge(file: File): boolean {
        return file.size > this.maxFileSize * 1024 * 1024;  // MB 转 Bytes
    }

    // 启动上传会话
    public async startUploadSession(file: File): Promise<void> {
        const response = await axios.post('/api/upload/new', { filename: file.name, fileSize: file.size });
        this.sessionId = response.data.sessionId;
    }

    // 上传文件分片
    public async uploadFile(file: File, progressAction: ((progress: number) => void) | null = null): Promise<string> {
        if (!file || !this.sessionId) throw new Error('请先调用 startUploadSession 方法创建上传会话');
        if (this.isFileTooLarge(file)) throw new Error('文件大小超过限制');

        const totalChunks = Math.ceil(file.size / this.chunkSize);  // 计算总分片数
        let currentChunk = 0;

        // 分片上传
        for (let start = 0; start < file.size; start += this.chunkSize) {
            const chunk = file.slice(start, start + this.chunkSize);
            const formData = new FormData();
            formData.append('file', chunk);
            formData.append('sessionId', this.sessionId);
            formData.append('filename', file.name);
            formData.append('chunk', currentChunk.toString());
            formData.append('totalChunks', totalChunks.toString());

            await this.uploadChunk(formData);
            currentChunk++;
            this.progress = Math.floor((currentChunk / totalChunks) * 100); // 更新进度
            if (progressAction) progressAction(this.progress);
        }

        // 构建文件的访问链接
        return `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}/assets/uploads/${this.finalName || file.name}`;
    }

    // 上传分片
    private async uploadChunk(formData: FormData): Promise<void> {
        const response = await axios.post('/api/upload/session', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        // 如果服务器返回非2xx状态码，则抛出错误
        if (response.status < 200 || response.status >= 300) {
            throw new Error(`上传失败: ${response.statusText}`);
        }

        if (response.data.finalName) {
            this.finalName = response.data.finalName;
        }
    }
}
