import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { PostRecommendation } from "../entity/PostRecommendation";

@Injectable()
export class PostRecommendationRepository extends Repository<PostRecommendation> {
    constructor(private dataSource: DataSource) {
        super(PostRecommendation, dataSource.createEntityManager());
    }
}
