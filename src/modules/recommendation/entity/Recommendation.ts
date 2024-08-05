import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany} from 'typeorm';
import { PostRecommendation } from './PostRecommendation';

@Entity('recommendation')
export class Recommendation {
    @PrimaryGeneratedColumn()
    id : number;

    @Column({ type: 'varchar', length: 20, nullable: false })
    name: string;

    @OneToMany(() => PostRecommendation, postRecommendation => postRecommendation.recommendation)
    postRecommendations: PostRecommendation[];
}