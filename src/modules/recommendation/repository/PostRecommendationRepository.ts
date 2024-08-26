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
}
