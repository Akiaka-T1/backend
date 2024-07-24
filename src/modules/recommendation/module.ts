import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Recommendation} from "./entity/Recommendation";
import {DataModule} from "../data/module";
import {RecommendationService} from "./service/RecommendationService";
import {RecommendationRepository} from "./repository/RecommendationRepository";
import {RecommendationCategory} from "./entity/RecommendationCategory";
import {RecommendationCategoryRepository} from "./repository/RecommendationCategoryRepository";


@Module({
    imports: [TypeOrmModule.forFeature([Recommendation,RecommendationCategory]),DataModule],
    providers: [RecommendationService,RecommendationRepository,RecommendationCategoryRepository],
    exports: [RecommendationService, RecommendationRepository,RecommendationCategoryRepository],
})
export class RecommendationModule {}
