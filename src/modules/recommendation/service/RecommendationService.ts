import {BadRequestException, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {RecommendationRepository} from "../repository/RecommendationRepository";
import {PostRecommendationRepository} from "../repository/PostRecommendationRepository";
import {PaginationDto} from "../../../utils/pagination/paginationDto";
import {PaginationResult} from "../../../utils/pagination/pagination";
import {ShortPostDto} from "../../post/dto/PostDto";
import {mapToDto} from "../../../utils/mapper/Mapper";
import {User} from "../../user/entity/User";
import {Post} from "../../post/entity/Post";
import {PostRepository} from "../../post/repository/PostRepository";

@Injectable()
export class RecommendationService{
    constructor(
        @InjectRepository(RecommendationRepository)
        private readonly recommendationRepository: RecommendationRepository,
        private readonly postRecommendationRepository: PostRecommendationRepository,
        private readonly postRepository: PostRepository
    ){}

    async getPostsByUser(name: string, paginationDto: PaginationDto): Promise<PaginationResult<ShortPostDto>> {
        const paginationOptions = {
            page: paginationDto.page || 1,
            limit: paginationDto.limit || 5,
        };

        const recommendations = await this.postRecommendationRepository.findPostsByRecommendationName(name, paginationOptions);
        const posts = recommendations.data.map(pr => pr.post);

        return {
            ...recommendations,
            data: posts.map(post => mapToDto(post, ShortPostDto)),
        };
    }

    async createOrIncrementMiddleEntityScore(user: User, post: Post): Promise<void> {
        const interests = post.interests.map(pi => pi.name);
        const userInfos = [user.mbti, user.ageGroup, ...interests];

        let postRecommendationsToSave = [];

        for (const recommendationName of userInfos) {
            const recommendation = await this.recommendationRepository.findByName(recommendationName);
            const postRecommendation = await this.postRecommendationRepository.findOne({
                where: { post: { id: post.id }, recommendation: { id: recommendation.id } },
            });

            if (postRecommendation) {
                postRecommendation.score++;
                postRecommendationsToSave.push(postRecommendation);
            } else {
                const newPostRecommendation = this.postRecommendationRepository.create({
                    post,
                    recommendation,
                    score: 1,
                });
                postRecommendationsToSave.push(newPostRecommendation);
            }
        }

        await this.postRecommendationRepository.save(postRecommendationsToSave);
        post.postRecommendations = postRecommendationsToSave;
    }

    public async handleErrors<T>(operation: () => Promise<T>, errorMessage: string): Promise<T> {
        try {
            return await operation();
        } catch (error) {
            throw new BadRequestException(errorMessage);
        }
    }
}