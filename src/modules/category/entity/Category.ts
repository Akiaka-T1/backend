import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Post } from '../../post/entity/Post'
import {UserCategory} from "./UserCategory";

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 20, nullable: false })
    name: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    description: string;

    @OneToMany(() => Post, post => post.category)
    posts: Post[];

    @OneToMany(() => UserCategory, userCategory => userCategory.category)
    userCategories: UserCategory[];
}