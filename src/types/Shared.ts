import { UserEntity } from "./UserEntity";

export class Shared {
    public static info: Ref<{
        title: string,
        bio: string
    }> = ref({
        title: '未命名',
        bio: 'There\'s no bio yet'
    });

    public static currentUser: UserEntity | null = null;

    public static background = "";
}