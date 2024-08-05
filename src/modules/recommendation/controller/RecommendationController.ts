import {Controller, Get, Query, Req, Request, UseGuards} from "@nestjs/common";
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
    async getRecommendationsByMbti(@Req() request: Request, @Query() paginationDto: PaginationDto): Promise<PaginationResult<ShortPostDto>> {
        const token = this.authService.getTokenFromRequest(request);
        let user: User | null = null;
        if (token) user = await this.authService.validateUserByToken(token);

        return this.recommendationService.getPostsByUser( user.mbti, paginationDto);
    }

    @Get('age_group')
    async getRecommendationsByAgeGroup(@Req() request: Request, @Query() paginationDto: PaginationDto): Promise<PaginationResult<ShortPostDto>> {
        const token = this.authService.getTokenFromRequest(request);
        let user: User | null = null;
        if (token) user = await this.authService.validateUserByToken(token);

        return this.recommendationService.getPostsByUser( user.ageGroup, paginationDto);
    }

    @Get('interest')
    async getRecommendationsByInterests(@Req() request: Request, @Query() paginationDto: PaginationDto): Promise<PaginationResult<ShortPostDto>> {
        const token = this.authService.getTokenFromRequest(request);
        let name: string | null = null;
        if (token) name = await this.authService.validateUserByTokenWithInterests(token);

        return this.recommendationService.getPostsByUser( name, paginationDto);
    }
}