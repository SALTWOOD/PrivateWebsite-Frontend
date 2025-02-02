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

    public static buttons: Ref<Map<string, Function>> = ref(new Map<string, Function>());

    public static changeButtons(obj: object) {
        this.buttons.value.clear();
        const entries = Object.entries(obj);
        for (const i of entries) {
            if (typeof i[0] !== "string" || typeof i[1] !== "function") continue;
            this.buttons.value.set(i[0], i[1]);
        }
    }
}