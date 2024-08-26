import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable} from 'typeorm';
import { Post } from '../../post/entity/Post'
import {UserInterest} from "./UserInterest";

@Entity('interest')
export class Interest {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'varchar', length: 20, nullable: false})
    name: string;

    @ManyToMany(() => Post, post => post.interests)
    posts: Post[];

    @OneToMany(() => UserInterest, userInterest => userInterest.interest)
    userInterests: UserInterest[];

}