import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Recommendation } from "../entity/Recommendation";
import { RecommendationRepository } from "../repository/RecommendationRepository";
import { mapToDto } from "../../../utils/mapper/Mapper";
import { PaginationDto } from "../../../utils/pagination/paginationDto";
import { PaginationResult } from "../../../utils/pagination/pagination";
import { PostRecommendationRepository } from "../repository/PostRecommendationRepository";

@Injectable()
export class RecommendationService{
    constructor(
        @InjectRepository(RecommendationRepository)
        private readonly recommendationRepository: RecommendationRepository,
        @InjectRepository(PostRecommendationRepository)
        private readonly postRecommendationRepository: PostRecommendationRepository
    ){}
    //recommendation crud..?
}