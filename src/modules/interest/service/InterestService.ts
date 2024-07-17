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
        private readonly interestRepository: InterestRepository,
    ) {
    }

    async post(postInterestDto: PostInterestDto): Promise<ResponseInterestDto> {
        const category = this.interestRepository.create(postInterestDto);
        await this.interestRepository.save(category);
        return mapToDto(category,ResponseInterestDto);
    }

    async findOne(id: number): Promise<ResponseInterestDto> {
        const category = await this.interestRepository.findById(id);
        this.ensureExists(category, id);
        return mapToDto(category,ResponseInterestDto);
    }

    async findByIdsForCreatePost(ids: number[]): Promise<Interest[]> {
        return this.interestRepository.findByIdsForCreatePost(ids)
    }


    async findAll(paginationDto: PaginationDto): Promise<PaginationResult<ResponseInterestDto>> {
        const {page, limit, field, order} = paginationDto;
        const options = {page, limit, field, order};

        const categories = await this.interestRepository.paginate(options);
        return {
            ...categories,
            data: categories.data.map(category => mapToDto(category,ResponseInterestDto)),
        };
    }

    async update(id: number, updateInterestDto: UpdateInterestDto): Promise<ResponseInterestDto> {
        const category = await this.interestRepository.findById(id);
        this.ensureExists(category, id);
        Object.assign(category, updateInterestDto);
        const updatedInterest = await this.handleErrors(() => this.interestRepository.save(category), 'Failed to update category');
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