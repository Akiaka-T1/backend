import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique} from "typeorm";
import {Post} from "./Post";

@Entity('daily_view')
export class DailyView {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Post, post => post.dailyViews)
    post: Post;

    @Column()
    views: number;

    @Column()
    date: Date;
}