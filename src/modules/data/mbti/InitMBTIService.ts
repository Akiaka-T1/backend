import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RecommendationCategoryRepository } from 'src/modules/recommendation/repository/RecommendationCategoryRepository';
import {defaultMBTIs} from "../../../constants/defaultMBTIs";
import { Recommendation } from 'src/modules/recommendation/entity/Recommendation';
import {In} from "typeorm";
import { RecommendationCategory } from 'src/modules/recommendation/entity/RecommendationCategory';
@Injectable()
export class InitMBTIService implements OnModuleInit {
    constructor(
        @InjectRepository(RecommendationCategoryRepository)
        private readonly recommendationCategoryRepository: RecommendationCategoryRepository,
    ) {}

    async onModuleInit() {
        await this.createInitialMBTIs();
    }

    private async createInitialMBTIs(): Promise<void> {
        const existingMBTIs = await this.checkMBTIsNotExists(defaultMBTIs);
        const existingMBTINames = existingMBTIs.map(MBTI => MBTI.name);

        const newMBTIs = defaultMBTIs.filter(name => !existingMBTINames.includes(name));

        for (const name of newMBTIs) {
            const MBTI = this.recommendationCategoryRepository.create({ name });
            await this.recommendationCategoryRepository.save(MBTI);
        }
    }

    private async checkMBTIsNotExists(names: string[]): Promise<RecommendationCategory[]> {
        return this.recommendationCategoryRepository.find({ where: { name: In(names) } });
    }
}