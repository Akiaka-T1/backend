import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Post} from "./Post";

@Entity('daily_view')
export class DailyView {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Post, post => post.dailyViews)
    post: Post;

    @Column()
    views: number;

    @CreateDateColumn()
    date: Date;
}