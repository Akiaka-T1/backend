import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { PostRecommendation } from "../entity/PostRecommendation";

@Injectable()
export class PostRecommendationRepository extends Repository<PostRecommendation> {
    constructor(private dataSource: DataSource) {
        super(PostRecommendation, dataSource.createEntityManager());
    }

    async findByPostId(postId: number): Promise<PostRecommendation[]> {
        return this.createQueryBuilder('postRecommendation')
            .leftJoinAndSelect('postRecommendation.post', 'post')
            .leftJoinAndSelect('postRecommendation.recommendation', 'recommendation')
            .where('postRecommendation.post.id = :postId', { postId })
            .getMany();
    }

    async findByRecommendationId(recommendationId: number): Promise<PostRecommendation[]> {
        return this.createQueryBuilder('postRecommendation')
            .leftJoinAndSelect('postRecommendation.post', 'post')
            .leftJoinAndSelect('postRecommendation.recommendation', 'recommendation')
            .where('postRecommendation.recommendation.id = :recommendationId', { recommendationId })
            .getMany();
    }
    
    async updateScore(postId: number, recommendationId: number, score: number): Promise<void> {
        await this.createQueryBuilder()
            .update(PostRecommendation)
            .set({ score })
            .where('post.id = :postId', { postId })
            .andWhere('recommendation.id = :recommendationId', { recommendationId })
            .execute();
    }

    async deleteByPostId(postId: number): Promise<void> {
        await this.createQueryBuilder()
            .delete()
            .from(PostRecommendation)
            .where('post.id = :postId', { postId })
            .execute();
    }
}
