import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {Category} from "../entity/Category";
import {CategoryRepository} from "../repository/CategoryRepository";
import {PostCategoryDto, ResponseCategoryDto, UpdateCategoryDto} from "../dto/CategoryDto";
import {PaginationDto} from "../../../utils/pagination/paginationDto";
import {PaginationResult} from "../../../utils/pagination/pagination";
import { mapToDto } from "../../../utils/mapper/Mapper";
import {UserCategoryRepository} from "../repository/UserCatrgoryRepository";
import {User} from "../../user/entity/User";
import {Interest} from "../../interest/entity/Interest";

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(CategoryRepository)
        private readonly categoryRepository: CategoryRepository,
        private readonly userCategoryRepository: UserCategoryRepository,

    ) {
    }

    async post(postCategoryDto: PostCategoryDto): Promise<ResponseCategoryDto> {
        const category = this.categoryRepository.create(postCategoryDto);
        await this.categoryRepository.save(category);
        return mapToDto(category,ResponseCategoryDto);
    }

    async findOne(id: number): Promise<ResponseCategoryDto> {
        const category = await this.categoryRepository.findById(id);
        this.ensureExists(category, id);
        return mapToDto(category,ResponseCategoryDto);
    }

    async findAll(): Promise<Category[]> {
        return this.categoryRepository.findAll();
    }

    async findAllAndPaginate(paginationDto: PaginationDto): Promise<PaginationResult<ResponseCategoryDto>> {
        const {page, limit, field, order} = paginationDto;
        const options = {page, limit, field, order};

        const categories = await this.categoryRepository.paginate(options);
        return {
            ...categories,
            data: categories.data.map(category => mapToDto(category,ResponseCategoryDto)),
        };
    }

    async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<ResponseCategoryDto> {
        const category = await this.categoryRepository.findById(id);
        this.ensureExists(category, id);
        Object.assign(category, updateCategoryDto);
        const updatedCategory = await this.handleErrors(() => this.categoryRepository.save(category), 'Failed to update category');
        return mapToDto(category,ResponseCategoryDto);
    }

    async remove(id: number): Promise<void> {
        const category = await this.findOne(id);
        await this.handleErrors(() => this.categoryRepository.delete(category.id), 'Failed to delete category');
    }

    async addDefaultCategoriesToUser(user: User): Promise<void> {
        const categories = await this.findAll();
        const userCategories = await this.userCategoryRepository.findByUserId(user.id);

        for (const category of categories) {
            const userCategoryExists = userCategories.some(uc => uc.category.id === category.id);
            if (!userCategoryExists) {
                const userInterest = this.userCategoryRepository.create({ user, category, score: 0 });
                await this.userCategoryRepository.save(userInterest);
            }
        }
    }

    private ensureExists(category: Category, id: number): void {
        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }
    }

    async incrementUserCategoryScore(userId: number, categoryId: number): Promise<void> {
        const userCategories = await this.userCategoryRepository.findByUserId(userId);
        const userCategory = userCategories.find(uc => uc.category.id === categoryId);

        if (userCategory) {
            userCategory.score++;
            await this.userCategoryRepository.save(userCategory);
        } else {
            await this.userCategoryRepository.createUserCategory(userId, categoryId ,0);
        }
    }

    private async handleErrors<T>(operation: () => Promise<T>, errorMessage: string): Promise<T> {
        try {
            return await operation();
        } catch (error) {
            throw new BadRequestException(errorMessage);
        }
    }
}