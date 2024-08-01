import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RecommendationRepository } from '../repository/RecommendationRepository';
import { PostRecommendationService } from './PostRecommendationService';
import { UserRepository } from '../../user/repository/UserRepository';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../user/entity/User';
import { UserInterestRepository } from '../../interest/repository/UserInterestRepository'; 
import { PostRepository } from '../../post/repository/PostRepository'; 

@Injectable()
export class RecommendationService {
  constructor(
    @InjectRepository(RecommendationRepository)
    private readonly recommendationRepository: RecommendationRepository,
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectRepository(UserInterestRepository) 
    private readonly userInterestRepository: UserInterestRepository,
    @InjectRepository(PostRepository) 
    private readonly postRepository: PostRepository, 
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

  async getContent(criteria: { userId?: number; ageGroup?: string; mbti?: string }): Promise<any[]> {
    return this.recommendationRepository.getContent(criteria);
  }

//   // 사용자의 관심사 기반 베스트 컨텐츠
//   async getBestContentByInterests(userId: number): Promise<any[]> {
//     return this.recommendationRepository.getContentByInterests(userId);
//   }

//   // 사용자의 연령대 기반 인기 컨텐츠
//   async getPopularContentByAgeGroup(ageGroup: string): Promise<any[]> {
//     return this.recommendationRepository.getContentByAgeGroup(ageGroup);
//   }

//   // 사용자의 MBTI 기반 추천 컨텐츠
//   async getRecommendedContentByMBTI(mbti: string): Promise<any[]> {
//     return this.recommendationRepository.getContentByMBTI(mbti);
//   }
// }
}