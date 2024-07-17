import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category} from "../../category/entity/Category";

@Injectable()
export class InitCategoryService implements OnModuleInit {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) {}

    async onModuleInit() {
        await this.createInitialCategories();
    }

    private async createInitialCategories(): Promise<void> {
        const categoryNames = [
            { name: '영화', description: '영화 관련 카테고리' },
            { name: '음악', description: '음악 관련 카테고리' },
            { name: '책', description: '책 관련 카테고리' },
        ];

        for (const category of categoryNames) {
            if (await this.checkCategoryNotExists(category.name)) {
                const newCategory = this.categoryRepository.create(category);
                await this.categoryRepository.save(newCategory);
            }
        }
    }

    private async checkCategoryNotExists(name: string): Promise<boolean> {
        const category = await this.categoryRepository.findOne({ where: { name } });
        return !category;
    }
}