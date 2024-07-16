import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {Category} from "../entity/Category";
import {CategoryRepository} from "../repository/CategoryRepository";
import {PostCategoryDto, ResponseCategoryDto, UpdateCategoryDto} from "../dto/CategoryDto";
import {PaginationDto} from "../../../utils/pagination/paginationDto";
import {PaginationResult} from "../../../utils/pagination/pagination";
import { mapToDto } from "../../../utils/mapper/Mapper";

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(CategoryRepository)
        private readonly categoryRepository: CategoryRepository,
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

    async findAll(paginationDto: PaginationDto): Promise<PaginationResult<ResponseCategoryDto>> {
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

    private ensureExists(category: Category, id: number): void {
        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
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