import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {In, Repository} from 'typeorm';
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
        const existingCategories = await this.checkCategoriesNotExists(defaultCategories.map(category => category.name));
        const existingCategoryNames = existingCategories.map(category => category.name);

        const newCategories = defaultCategories.filter(category => !existingCategoryNames.includes(category.name));

        for (const category of newCategories) {
            const newCategory = this.categoryRepository.create(category);
            await this.categoryRepository.save(newCategory);
        }
    }

    private async checkCategoriesNotExists(names: string[]): Promise<Category[]> {
        return this.categoryRepository.find({ where: { name: In(names) } });
    }

}