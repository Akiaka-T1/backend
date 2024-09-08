import {Controller, Get, Query, Req, Request, UseGuards} from "@nestjs/common";
import {RecommendationService} from "../service/RecommendationService";
import {PaginationDto} from "../../../utils/pagination/paginationDto";
import {PaginationResult} from "../../../utils/pagination/pagination";
import {ThumbnailPostDto} from "../../post/dto/PostDto";
import {User} from "../../user/entity/User";
import {AuthService} from "../../../auth/service/AuthService";

@Controller('api/recommendations')
export class RecommendationController {
    constructor(
        private readonly recommendationService: RecommendationService,
        private readonly authService: AuthService,
    ) {}

    @Get('mbti')
    async getRecommendationsByMbti(@Req() request: Request, @Query() paginationDto: PaginationDto): Promise<PaginationResult<ThumbnailPostDto> & {recommendation: string }> {
        const token = this.authService.getTokenFromRequest(request);
        let user: User | null = null;
        if (token) user = await this.authService.validateUserByToken(token);

        return { ...await this.recommendationService.getPostsByUser(user!.mbti, paginationDto), recommendation: user.mbti };
    }

    @Get('age_group')
    async getRecommendationsByAgeGroup(@Req() request: Request, @Query() paginationDto: PaginationDto): Promise<PaginationResult<ThumbnailPostDto> & { recommendation: string }> {
        const token = this.authService.getTokenFromRequest(request);
        let user: User | null = null;
        if (token) user = await this.authService.validateUserByToken(token);

        return { ...await this.recommendationService.getPostsByUser(user!.ageGroup, paginationDto), recommendation: user.ageGroup };
    }

    @Get('interest')
    async getRecommendationsByInterests(@Req() request: Request, @Query() paginationDto: PaginationDto): Promise<PaginationResult<ThumbnailPostDto> & { recommendation: string }> {
        const token = this.authService.getTokenFromRequest(request);
        let name: string | null = null;
        if (token) name = await this.authService.validateUserByTokenWithInterests(token);

        return { ...await this.recommendationService.getPostsByUser(name, paginationDto), recommendation: name};
    }

    @Get('daily_view')
    async getTopViewedPosts(@Query() paginationDto: PaginationDto): Promise<PaginationResult<ThumbnailPostDto>> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return this.recommendationService.getTopViewedPosts(today, paginationDto);
    }
}