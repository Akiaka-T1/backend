import {Controller, Get, Query, Request, UseGuards} from "@nestjs/common";
import {RecommendationService} from "../service/RecommendationService";
import {PaginationDto} from "../../../utils/pagination/paginationDto";
import {PaginationResult} from "../../../utils/pagination/pagination";
import {ShortPostDto} from "../../post/dto/PostDto";
import {User} from "../../user/entity/User";
import {AuthService} from "../../../auth/service/AuthService";

@Controller('api/recommendations')
export class RecommendationController {
    constructor(
        private readonly recommendationService: RecommendationService,
        private readonly authService: AuthService,
    ) {}

    @Get('mbti')
    async getRecommendationsByMbti(@Request() request: any, @Query() paginationDto: PaginationDto): Promise<PaginationResult<ShortPostDto>> {
        const token = this.authService.getTokenFromRequest(request);
        let user: User | null = null;
        if (token) user = await this.authService.validateUserByToken(token);

        return this.recommendationService.getRecommendationsByType('mbti', user.mbti, paginationDto);
    }

    @Get('ageGroup')
    async getRecommendationsByAgeGroup(@Request() request: any, @Query() paginationDto: PaginationDto): Promise<PaginationResult<ShortPostDto>> {
        const token = this.authService.getTokenFromRequest(request);
        let user: User | null = null;
        if (token) user = await this.authService.validateUserByToken(token);

        return this.recommendationService.getRecommendationsByType('ageGroup', user.ageGroup, paginationDto);
    }

    @Get('interest')
    async getRecommendationsByInterests(@Request() request: any, @Query() paginationDto: PaginationDto): Promise<PaginationResult<ShortPostDto>> {
        const token = this.authService.getTokenFromRequest(request);
        let user: User | null = null;
        if (token) user = await this.authService.validateUserByToken(token);

        return this.recommendationService.getRecommendationsByInterests('interest', user, paginationDto);
    }
}