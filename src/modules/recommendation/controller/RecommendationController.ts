import { Controller, Get, Patch, Body, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { RecommendationService } from '../service/RecommendationService';
import { AuthGuard } from '../../../auth/JwtAuthGuard/JwtAuthGuard';
import { RolesGuard } from '../../../auth/authorization/RolesGuard';
import { Roles } from '../../../auth/authorization/decorator';
import { Role } from '../../../auth/authorization/Role';

@Controller('api/recommendations')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Patch(':postId/click')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.User)
  async handlePostClick(@Body('token') token: string, @Param('id', ParseIntPipe) postId: number): Promise<void> {
    return this.recommendationService.handlePostClick(token, postId);
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.User)
  async getAllRecommendations(@Param('userId', ParseIntPipe) userId: number, @Query('ageGroup') ageGroup: string, @Query('mbti') mbti: string): Promise<any> {
    const bestContent = await this.recommendationService.getContent({ userId });
    const popularContent = await this.recommendationService.getContent({ageGroup});
    const recommendedContent = await this.recommendationService.getContent({mbti});

    return {
      bestContent,
      popularContent,
      recommendedContent
    };
  }
}
