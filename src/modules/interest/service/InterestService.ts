import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {Interest} from "../entity/Interest";
import {InterestRepository} from "../repository/InterestRepository";
import {PostInterestDto, ResponseInterestDto, UpdateInterestDto} from "../dto/InterestDto";
import {PaginationDto} from "../../../utils/pagination/paginationDto";
import {PaginationResult} from "../../../utils/pagination/pagination";
import { mapToDto } from "../../../utils/mapper/Mapper";

@Injectable()
export class InterestService {
    constructor(
        @InjectRepository(InterestRepository)
        private readonly categoryRepository: InterestRepository,
    ) {
    }

    async post(postInterestDto: PostInterestDto): Promise<ResponseInterestDto> {
        const category = this.categoryRepository.create(postInterestDto);
        await this.categoryRepository.save(category);
        return mapToDto(category,ResponseInterestDto);
    }

    async findOne(id: number): Promise<ResponseInterestDto> {
        const category = await this.categoryRepository.findById(id);
        this.ensureExists(category, id);
        return mapToDto(category,ResponseInterestDto);
    }

    async findAll(paginationDto: PaginationDto): Promise<PaginationResult<ResponseInterestDto>> {
        const {page, limit, field, order} = paginationDto;
        const options = {page, limit, field, order};

        const categories = await this.categoryRepository.paginate(options);
        return {
            ...categories,
            data: categories.data.map(category => mapToDto(category,ResponseInterestDto)),
        };
    }

    async update(id: number, updateInterestDto: UpdateInterestDto): Promise<ResponseInterestDto> {
        const category = await this.categoryRepository.findById(id);
        this.ensureExists(category, id);
        Object.assign(category, updateInterestDto);
        const updatedInterest = await this.handleErrors(() => this.categoryRepository.save(category), 'Failed to update category');
        return mapToDto(category,ResponseInterestDto);
    }

    private ensureExists(category: Interest, id: number): void {
        if (!category) {
            throw new NotFoundException(`Interest with ID ${id} not found`);
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