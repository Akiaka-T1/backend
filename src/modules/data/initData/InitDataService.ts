import { Category } from "../../category/entity/Category";
import { Interest } from "../../interest/entity/Interest";
import { Recommendation } from 'src/modules/recommendation/entity/Recommendation';
import { defaultCategories } from "../../../constants/defalutCatrgories";
import { defaultInterests } from "../../../constants/defaultInterests";
import { defaultRecommendations } from "../../../constants/defaultRecommendations";
import {Injectable, OnModuleInit} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {In, Repository} from "typeorm";
import {CategoryRepository} from "../../category/repository/CategoryRepository";
import {InterestRepository} from "../../interest/repository/InterestRepository";
import {RecommendationRepository} from "../../recommendation/repository/RecommendationRepository";

@Injectable()
export class InitDataService implements OnModuleInit {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: CategoryRepository,
        @InjectRepository(Interest)
        private readonly interestRepository: InterestRepository,
        @InjectRepository(Recommendation)
        private readonly recommendationRepository: RecommendationRepository,
    ) {}

    async onModuleInit() {
        await this.createInitialEntities(this.categoryRepository, defaultCategories, 'name');
        await this.createInitialEntities(this.interestRepository, defaultInterests.map(name => ({ name })), 'name');
        await this.createInitialEntities(this.recommendationRepository, defaultRecommendations.map(name => ({ name })), 'name');
    }

    private async createInitialEntities<T extends { [key: string]: any }>(
        repository: Repository<T>,
        defaultEntities: T[],
        property: keyof T
    ):
    Promise<void> {
        const entityNames = defaultEntities.map(entity => entity[property] as unknown as string);
        const existingEntities = await repository.find({
            where: {
                [property]: In(entityNames)
            } as any
        });
        const existingEntityNames = existingEntities.map(entity => entity[property] as unknown as string);
        const newEntities = defaultEntities.filter(entity => !existingEntityNames.includes(entity[property] as unknown as string));
        if (newEntities.length > 0) {
            const entitiesToSave = newEntities.map(entity => repository.create(entity));
            await repository.insert(entitiesToSave);
        }
    }
}
