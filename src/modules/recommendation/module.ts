import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Recommendation} from "./entity/Recommendation";
import {DataModule} from "../data/module";
import {RecommendationService} from "./service/RecommendationService";
import {RecommendationRepository} from "./repository/RecommendationRepository";
import { PostRecommendation } from "./entity/PostRecommendation";
import { PostRecommendationRepository } from "./repository/PostRecommendationRepository";
import {RecommendationController} from "./controller/RecommendationController";
import {Post} from "../post/entity/Post";

@Module({
    imports: [TypeOrmModule.forFeature([Recommendation,PostRecommendation,Post]),DataModule],
    controllers:[RecommendationController],
    providers: [RecommendationService,RecommendationRepository,PostRecommendationRepository],
    exports: [RecommendationService, RecommendationRepository,PostRecommendationRepository],
})
export class RecommendationModule {}
