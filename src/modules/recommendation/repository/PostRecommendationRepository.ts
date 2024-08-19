import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { PostRecommendation } from "../entity/PostRecommendation";
import {
    paginateWithQueryBuilder,
    PaginationOptions,
    PaginationResult
} from "../../../utils/pagination/pagination";

@Injectable()
export class PostRecommendationRepository extends Repository<PostRecommendation> {
    constructor(private dataSource: DataSource) {
        super(PostRecommendation, dataSource.createEntityManager());
    }

    async findPostsByRecommendationName(recommendationName: string, paginationOptions: PaginationOptions): Promise<PaginationResult<PostRecommendation>> {
        const queryBuilder = this.createQueryBuilder('postRecommendation')
            .innerJoinAndSelect('postRecommendation.post', 'post')
            .innerJoinAndSelect('postRecommendation.recommendation', 'recommendation')
            .where('recommendation.name = :name', { name: recommendationName })
            .orderBy('postRecommendation.score', 'DESC');

        return paginateWithQueryBuilder(queryBuilder, paginationOptions);
    }
    // PostRecommendation에서 score가 제일 높은거 알림해줄거 
    async findPostsByRecommendationForAlarm(recommendationName: string): Promise<PostRecommendation | null> {
        const queryBuilder = this.createQueryBuilder('postRecommendation')
            .innerJoinAndSelect('postRecommendation.post', 'post')
            .innerJoinAndSelect('postRecommendation.recommendation', 'recommendation')
            .where('recommendation.name = :name', { name: recommendationName })
            .orderBy('postRecommendation.score', 'DESC');
            
        const postRecommendation = await queryBuilder.getOne();
    
        return postRecommendation;
    }
    
}
