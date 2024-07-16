import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from '../../src/modules/category/service/CategoryService';
import { CategoryRepository } from '../../src/modules/category/repository/CategoryRepository';
import { MockCategory } from '../mockEntities/MockCategory';
import { PostCategoryDto, UpdateCategoryDto } from '../../src/modules/category/dto/CategoryDto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PaginationDto } from '../../src/utils/pagination/paginationDto';
import { PaginationResult } from '../../src/utils/pagination/pagination';

const mockCategoryRepository = () => ({
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    delete: jest.fn(),
    paginate: jest.fn(),
});

describe('CategoryService', () => {
    let categoryService;
    let categoryRepository;
    let mockCategory;

    beforeEach(async () => {
        mockCategory = new MockCategory();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CategoryService,
                { provide: CategoryRepository, useFactory: mockCategoryRepository },
            ],
        }).compile();

        categoryService = module.get<CategoryService>(CategoryService);
        categoryRepository = module.get<CategoryRepository>(CategoryRepository);

        jest.clearAllMocks();
    });

    describe('post', () => {
        it('should create a category successfully', async () => {
            categoryRepository.create.mockReturnValue(mockCategory);
            categoryRepository.save.mockResolvedValue(mockCategory);

            const postCategoryDto: PostCategoryDto = {
                name: 'Test Category',
                description: 'This is a test category',
            };

            const result = await categoryService.post(postCategoryDto);

            expect(categoryRepository.create).toHaveBeenCalledWith(postCategoryDto);
            expect(categoryRepository.save).toHaveBeenCalledWith(mockCategory);
            expect(result.id).toEqual(1);
            expect(result.name).toEqual('Test Category');
            expect(result.description).toEqual('This is a test category');
        });
    });

    describe('findOne', () => {
        it('should find a category successfully', async () => {
            categoryRepository.findById.mockResolvedValue(mockCategory);

            const result = await categoryService.findOne(1);

            expect(categoryRepository.findById).toHaveBeenCalledWith(1);
            expect(result.id).toEqual(1);
            expect(result.name).toEqual('Test Category');
            expect(result.description).toEqual('This is a test category');
        });

        it('should throw an error if category is not found', async () => {
            categoryRepository.findById.mockResolvedValue(null);

            await expect(categoryService.findOne(1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('findAll', () => {
        it('should return paginated categories', async () => {
            const paginationDto: PaginationDto = { page: 1, limit: 10, field: 'id', order: 'ASC' };
            const paginatedResult: PaginationResult<MockCategory> = { data: [mockCategory], total: 1, page: 1, limit: 10 };

            categoryRepository.paginate.mockResolvedValue(paginatedResult);

            const result = await categoryService.findAll(paginationDto);

            expect(categoryRepository.paginate).toHaveBeenCalledWith(paginationDto);
            expect(result.data[0].id).toEqual(1);
            expect(result.data[0].name).toEqual('Test Category');
            expect(result.data[0].description).toEqual('This is a test category');
        });
    });

    describe('update', () => {
        it('should update a category successfully', async () => {
            categoryRepository.findById.mockResolvedValue(mockCategory);
            categoryRepository.save.mockResolvedValue(mockCategory);

            const updateCategoryDto: UpdateCategoryDto = { name: 'Updated Category' };

            const result = await categoryService.update(1, updateCategoryDto);

            expect(categoryRepository.findById).toHaveBeenCalledWith(1);
            expect(categoryRepository.save).toHaveBeenCalledWith({ ...mockCategory, ...updateCategoryDto });
            expect(result.name).toEqual('Updated Category');
        });

        it('should throw an error if category is not found', async () => {
            categoryRepository.findById.mockResolvedValue(null);

            const updateCategoryDto: UpdateCategoryDto = { name: 'Updated Category' };

            await expect(categoryService.update(1, updateCategoryDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should remove a category successfully', async () => {
            categoryRepository.findById.mockResolvedValue(mockCategory);
            categoryRepository.delete.mockResolvedValue({ affected: 1 });

            await categoryService.remove(1);

            expect(categoryRepository.findById).toHaveBeenCalledWith(1);
            expect(categoryRepository.delete).toHaveBeenCalledWith(1);
        });

        it('should throw an error if category is not found', async () => {
            categoryRepository.findById.mockResolvedValue(null);

            await expect(categoryService.remove(1)).rejects.toThrow(NotFoundException);
        });
    });
});
