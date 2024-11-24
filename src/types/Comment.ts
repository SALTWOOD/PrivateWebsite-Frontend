import { UserEntity } from "./UserEntity";

export class Comment {
    public id: number = 0;
    public user: UserEntity = new UserEntity();
    public content: string = "";
    public parent: number | null = null;
    public article: number = 0;
    public createdAt: string = "";
    public hash: string = "";
    public replies: Comment[] = [];
}