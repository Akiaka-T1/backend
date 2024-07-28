/* eslint-disable */
/* prettier-ignore */
import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Recommendation } from "../entity/Recommendation";
import { RecommendationRepository } from "../repository/RecommendationRepository";
import { mapToDto } from "../../../utils/mapper/Mapper";
import { PaginationDto } from "../../../utils/pagination/paginationDto";
import { PaginationResult } from "../../../utils/pagination/pagination";
import { PostRecommendationRepository } from "../repository/PostRecommendationRepository";
import { UserRepository } from '../../user/repository/UserRepository';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../user/entity/User';



@Injectable()
export class RecommendationService {
    constructor(
        @InjectRepository(RecommendationRepository)
        private readonly recommendationRepository: RecommendationRepository,
        @InjectRepository(UserRepository)
        private readonly userRepository: UserRepository,
        private readonly jwtService: JwtService,
        private readonly postRecommendationService: PostRecommendationService
    ) {}

    // 사용자 토큰을 통해 사용자 정보 확인
    async verifyUserFromToken(token: string): Promise<User> {
        try {
            const decoded = this.jwtService.verify(token);
            const user = await this.userRepository.findOne({ where: { id: decoded.userId } });
            if (!user) {
                throw new UnauthorizedException('Invalid token');
            }
            return user;
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }

    // 사용자가 포스트를 클릭했을 때 호출되는 함수
    async handlePostClick(token: string, postId: number): Promise<void> {
        const user = await this.verifyUserFromToken(token);
        await this.postRecommendationService.updateRecommendationScore(user, postId);
    }

    // 사용자의 관심사 기반 베스트 컨텐츠
    async getBestContentByInterests(userId: number): Promise<any[]> {
        const userInterests = await this.userInterestRepository.find({ where: { user: { id: userId } }, relations: ['interest'] });
        const posts = await this.postRepository.createQueryBuilder('post')
            .leftJoinAndSelect('post.interests', 'interest')
            .where('interest.id IN (:...interestIds)', { interestIds: userInterests.map(ui => ui.interest.id) })
            .orderBy('post.views', 'DESC')
            .getMany();
        return posts;
    }

    // 사용자의 연령대 기반 인기 컨텐츠
    async getPopularContentByAgeGroup(ageGroup: string): Promise<any[]> {
        const posts = await this.postRepository.createQueryBuilder('post')
            .leftJoinAndSelect('post.user', 'user')
            .where('user.ageGroup = :ageGroup', { ageGroup })
            .orderBy('post.views', 'DESC')
            .getMany();
        return posts;
    }

    // 사용자의 MBTI 기반 추천 컨텐츠
    async getRecommendedContentByMBTI(mbti: string): Promise<any[]> {
        const recommendation = await this.recommendationRepository.findOne({ where: { name: mbti } });
        if (!recommendation) {
            throw new NotFoundException(`Recommendation for MBTI ${mbti} not found`);
        }

        const postRecommendations = await this.postRecommendationRepository.find({ where: { recommendation: { id: recommendation.id } }, relations: ['post'] });
        const posts = postRecommendations.map(pr => pr.post).sort((a, b) => b.score - a.score);
        return posts;
    }
}