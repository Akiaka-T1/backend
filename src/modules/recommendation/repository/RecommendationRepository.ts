import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Recommendation } from '../entity/Recommendation';
import { PostRecommendation } from '../entity/PostRecommendation';

@Injectable()
export class RecommendationRepository extends Repository<Recommendation> {
  constructor(private dataSource: DataSource) {
    super(Recommendation, dataSource.createEntityManager());
  }
  async getContent(criteria: { userId?: number; ageGroup?: string; mbti?: string }): Promise<any[]> {
    const query = this.createQueryBuilder('post');

    if (criteria.userId) {
      query.leftJoinAndSelect('post.interests', 'interest')
        .where('interest.id IN (SELECT ui.interestId FROM user_interest ui WHERE ui.userId = :userId)', { userId: criteria.userId })
        .orderBy('post.views', 'DESC');
    } else if (criteria.ageGroup) {
      query.leftJoinAndSelect('post.user', 'user')
        .where('user.ageGroup = :ageGroup', { ageGroup: criteria.ageGroup })
        .orderBy('post.views', 'DESC');
    } else if (criteria.mbti) {
      query.leftJoinAndSelect('postRecommendation', 'postRecommendation')
        .leftJoinAndSelect('postRecommendation.recommendation', 'recommendation')
        .where('recommendation.name = :mbti', { mbti: criteria.mbti })
        .orderBy('postRecommendation.score', 'DESC');
    }
    return query.getMany();
    }
//   async getContentByInterests(userId: number): Promise<any[]> {
//     return this.createQueryBuilder('post')
//       .leftJoinAndSelect('post.interests', 'interest')
//       .where('interest.id IN (SELECT ui.interestId FROM user_interest ui WHERE ui.userId = :userId)', { userId })
//       .orderBy('post.views', 'DESC')
//       .getMany();
//   }

//   async getContentByAgeGroup(ageGroup: string): Promise<any[]> {
//     return this.createQueryBuilder('post')
//       .leftJoinAndSelect('post.user', 'user')
//       .where('user.ageGroup = :ageGroup', { ageGroup })
//       .orderBy('post.views', 'DESC')
//       .getMany();
//   }

//   async getContentByMBTI(mbti: string): Promise<any[]> {
//     return this.createQueryBuilder('postRecommendation')
//       .leftJoinAndSelect('postRecommendation.post', 'post')
//       .leftJoinAndSelect('postRecommendation.recommendation', 'recommendation')
//       .where('recommendation.name = :mbti', { mbti })
//       .orderBy('postRecommendation.score', 'DESC')
//       .getMany();
//   }
}
