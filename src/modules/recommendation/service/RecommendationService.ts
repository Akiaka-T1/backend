import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Recommendation } from "../entity/Recommendation";
import { RecommendationCategory } from "../entity/RecommendationCategory";
import { RecommendationRepository } from "../repository/RecommendationRepository";
import { RecommendationCategoryRepository } from "../repository/RecommendationCategoryRepository";
import { mapToDto } from "../../../utils/mapper/Mapper";
import { PaginationDto } from "../../../utils/pagination/paginationDto";
import { PaginationResult } from "../../../utils/pagination/pagination";

@Injectable()
export class RecommendationService{
    constructor(
        @InjectRepository(RecommendationRepository)
        private readonly recommendationRepository: RecommendationRepository,
        @InjectRepository(RecommendationCategoryRepository)
        private readonly recommendationCategoryRepository: RecommendationCategoryRepository
    ){}
    //recommendation crud..?
}