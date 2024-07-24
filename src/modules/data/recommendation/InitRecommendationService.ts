import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {defaultRecommendations} from "../../../constants/defaultRecommendations";
import { Recommendation } from 'src/modules/recommendation/entity/Recommendation';
import {In} from "typeorm";
import { RecommendationRepository } from 'src/modules/recommendation/repository/RecommendationRepository';
import { PostRecommendation } from 'src/modules/recommendation/entity/PostRecommendation';
@Injectable()
export class InitRecommendationService implements OnModuleInit {
    constructor(
        @InjectRepository(Recommendation)
        private readonly recommendationRepository: RecommendationRepository,
    ) {}

    async onModuleInit() {
        await this.createInitialRecommendations();
    }

    private async createInitialRecommendations(): Promise<void> {
        const existingRecommendations = await this.checkRecommendationsNotExists(defaultRecommendations);
        const existingRecommendationNames = existingRecommendations.map(Recommendation => Recommendation.name);

        const newRecommendations = defaultRecommendations.filter(name => !existingRecommendationNames.includes(name));

        for (const name of newRecommendations) {
            const Recommendation = this.recommendationRepository.create({ name });
            await this.recommendationRepository.save(Recommendation);
        }
    }

    private async checkRecommendationsNotExists(names: string[]): Promise<Recommendation[]> {
        return this.recommendationRepository.find({ where: { name: In(names) } });
    }
}