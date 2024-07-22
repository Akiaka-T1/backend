import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category} from "../../category/entity/Category";
import {defaultCategories} from "../../../constants/defalutCatrgories";

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
        for (const category of defaultCategories) {
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