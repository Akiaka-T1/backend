import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Post } from '../../post/entity/Post'

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
}