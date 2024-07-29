import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostRecommendationRepository } from '../repository/PostRecommendationRepository';
import { RecommendationRepository } from '../repository/RecommendationRepository';
import { PostRepository } from '../../post/repository/PostRepository';
import { PostRecommendation } from '../entity/PostRecommendation';
import { Recommendation } from '../entity/Recommendation';
import { Post } from '../../post/entity/Post';
import { User } from '../../user/entity/User';

@Injectable()
export class PostRecommendationService {
    constructor(
        @InjectRepository(PostRecommendationRepository)
        private readonly postRecommendationRepository: PostRecommendationRepository,
        @InjectRepository(RecommendationRepository)
        private readonly recommendationRepository: RecommendationRepository,
        @InjectRepository(PostRepository)
        private readonly postRepository: PostRepository
    ) {}

    // 추천 점수 업데이트
    async updateRecommendationScore(user: User, postId: number): Promise<void> {
        const userMBTI = user.mbti;
        const recommendation = await this.recommendationRepository.findOne({ where: { name: userMBTI } });
        if (!recommendation) {
            throw new NotFoundException(`Recommendation for MBTI ${userMBTI} not found`);
        }

        let postRecommendation = await this.postRecommendationRepository.findOne({ where: { post: { id: postId }, recommendation: { id: recommendation.id } } });
        if (!postRecommendation) {
            postRecommendation = this.postRecommendationRepository.create({ post: { id: postId }, recommendation: { id: recommendation.id }, score: 0 });
        }
        postRecommendation.score += 1;
        await this.postRecommendationRepository.save(postRecommendation);
    }

}
