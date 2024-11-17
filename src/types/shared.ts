import { randomBackground } from "@/utils/utilities";

export class Shared {
    public static info: {
        title: string,
        bio: string
    } = {
        title: '未命名',
        bio: 'There\'s no bio yet'
    };

    public static background = "https://upy.milu.ink/blog-bg.jpg"//randomBackground();
}