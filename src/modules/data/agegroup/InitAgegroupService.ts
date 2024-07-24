import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RecommendationCategoryRepository } from 'src/modules/recommendation/repository/RecommendationCategoryRepository';
import { defaultAgegroups } from "../../../constants/defaultAgegroups";
import { In } from "typeorm";
import { RecommendationCategory } from 'src/modules/recommendation/entity/RecommendationCategory';

@Injectable()
export class InitAgegroupService implements OnModuleInit {
    constructor(
        @InjectRepository(RecommendationCategoryRepository)
        private readonly recommendationCategoryRepository: RecommendationCategoryRepository,
    ) {}

    async onModuleInit() {
        await this.createInitialAgegroups();
    }

    private async createInitialAgegroups(): Promise<void> {
        const existingAgegroups = await this.checkAgegroupsNotExists(defaultAgegroups);
        const existingAgegroupNames = existingAgegroups.map(agegroup => agegroup.name);

        const newAgegroups = defaultAgegroups.filter(name => !existingAgegroupNames.includes(name));

        for (const name of newAgegroups) {
            const agegroup = this.recommendationCategoryRepository.create({ name });
            await this.recommendationCategoryRepository.save(agegroup);
        }
    }

    private async checkAgegroupsNotExists(names: string[]): Promise<RecommendationCategory[]> {
        return this.recommendationCategoryRepository.find({ where: { name: In(names) } });
    }
}
