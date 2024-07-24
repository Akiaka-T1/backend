import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Recommendation} from "./entity/Recommendation";
import {DataModule} from "../data/module";
import {RecommendationService} from "./service/RecommendationService";
import {RecommendationRepository} from "./repository/RecommendationRepository";
import { PostRecommendation } from "./entity/PostRecommendation";
import { PostRecommendationRepository } from "./repository/PostRecommendationRepository";

@Module({
    imports: [TypeOrmModule.forFeature([Recommendation,PostRecommendation]),DataModule],
    providers: [RecommendationService,RecommendationRepository,PostRecommendationRepository],
    exports: [RecommendationService, RecommendationRepository,PostRecommendationRepository],
})
export class RecommendationModule {}
