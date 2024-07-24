import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Post } from '../../post/entity/Post';
import { Recommendation } from './Recommendation';

@Entity('post_recommendation')
export class PostRecommendation {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Post, post => post.postRecommendations)
    post: Post;

    @ManyToOne(() => Recommendation, recommendation => recommendation.postRecommendations)
    recommendation: Recommendation;


    @Column()
    score: number;
}
