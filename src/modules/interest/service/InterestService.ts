import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {Interest} from "../entity/Interest";
import {InterestRepository} from "../repository/InterestRepository";
import {PostInterestDto, ResponseInterestDto, UpdateInterestDto} from "../dto/InterestDto";
import {PaginationDto} from "../../../utils/pagination/paginationDto";
import {PaginationResult} from "../../../utils/pagination/pagination";
import { mapToDto } from "../../../utils/mapper/Mapper";
import {User} from "../../user/entity/User";
import {UserInterestRepository} from "../repository/UserInterestRepository";

@Injectable()
export class InterestService {
    constructor(
        @InjectRepository(InterestRepository)
        private readonly interestRepository: InterestRepository,
        private readonly userInterestRepository: UserInterestRepository,
    ) {
    }

    async post(postInterestDto: PostInterestDto): Promise<ResponseInterestDto> {
        const category = this.interestRepository.create(postInterestDto);
        await this.interestRepository.save(category);
        return mapToDto(category,ResponseInterestDto);
    }

    async findAll(): Promise<Interest[]> {
        return this.interestRepository.findAll();
    }

    async findOne(id: number): Promise<ResponseInterestDto> {
        const category = await this.interestRepository.findById(id);
        this.ensureExists(category, id);
        return mapToDto(category,ResponseInterestDto);
    }

    async findByIdsForCreatePost(ids: number[]): Promise<Interest[]> {
        return this.interestRepository.findByIdsForCreatePost(ids)
    }


    async findAllAndPaginate(paginationDto: PaginationDto): Promise<PaginationResult<ResponseInterestDto>> {
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

    async addDefaultInterestsToUser(user: User): Promise<void> {
        const interests = await this.findAll();
        const userInterests = await this.userInterestRepository.findByUserId(user.id);

        for (const interest of interests) {
            const userInterestExists = userInterests.some(ui => ui.interest.id === interest.id);
            if (!userInterestExists) {
                const userInterest = this.userInterestRepository.create({ user, interest, score: 0 });
                await this.userInterestRepository.save(userInterest);
            }
        }
    }

    async incrementUserInterestScore(userId: number, interests: Interest[]): Promise<void> {
        const userInterests = await this.userInterestRepository.findByUserId(userId);

        for (const interest of interests) {
            const userInterest = userInterests.find(ui => ui.interest.id === interest.id);
            if (userInterest) {
                userInterest.score++;
                await this.userInterestRepository.save(userInterest);
            } else {
                await this.userInterestRepository.createUserInterest(userId, interest.id, 1);
            }
        }
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