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
import {defaultInterests } from "../../../constants/defaultInterests";
import {UserInterest} from "../entity/UserInterest";
import {CommentRepository} from "../../comment/repository/CommentRepository";

@Injectable()
export class InterestService {
    constructor(
        @InjectRepository(InterestRepository)
        private readonly interestRepository: InterestRepository,
        private readonly userInterestRepository: UserInterestRepository,
        @InjectRepository(CommentRepository)
        private readonly commentRepository: CommentRepository
    ) {
    }

    async post(postInterestDto: PostInterestDto): Promise<ResponseInterestDto> {
        const interest = this.interestRepository.create(postInterestDto);
        await this.interestRepository.save(interest);
        return mapToDto(interest,ResponseInterestDto);
    }

    async findAll(): Promise<Interest[]> {
        return this.interestRepository.findAll();
    }

    async findOne(id: number): Promise<ResponseInterestDto> {
        const interest = await this.interestRepository.findById(id);
        this.ensureExists(interest, id);
        return mapToDto(interest,ResponseInterestDto);
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
            data: categories.data.map(interest => mapToDto(interest,ResponseInterestDto)),
        };
    }

    async update(id: number, updateInterestDto: UpdateInterestDto): Promise<ResponseInterestDto> {
        const interest = await this.interestRepository.findById(id);
        this.ensureExists(interest, id);
        Object.assign(interest, updateInterestDto);
        const updatedInterest = await this.handleErrors(() => this.interestRepository.save(interest), 'Failed to update interest');
        return mapToDto(interest,ResponseInterestDto);
    }

    public async ensureHasEveryMiddleEntities(user: User): Promise<User> {
        const userInterests = await this.userInterestRepository.findByUserId(user.id);

        if (this.hasMissingMiddleEntities(userInterests)) {
            const existingInterestIds = userInterests.map(ui => ui.interest.id);
            const missingInterests = await this.interestRepository.findMissingInterests(existingInterestIds);
            await this.addMissingInterestsToUser(user, missingInterests);
        }
        return user;
    }

    private hasMissingMiddleEntities(userInterests: UserInterest[]): boolean {
        return userInterests.length < defaultInterests.length;
    }

    private async addMissingInterestsToUser(user: User, missingInterests: Interest[]): Promise<void> {
        const newUserInterests = missingInterests.map(interest =>
            this.userInterestRepository.create({ user, interest, rating: 0 })
        );
        await this.userInterestRepository.save(newUserInterests);
        user.userInterests.push(...newUserInterests);
    }

    public async updateUserInterests(userId: number, interests: Interest[]): Promise<void> {
        const userInterests = await this.userInterestRepository.findByUserId(userId);
        const existingInterestIds = userInterests.map(ui => ui.interest.id);

        const newInterests = interests.filter(interest => !existingInterestIds.includes(interest.id));

        const newUserInterests = newInterests.map(interest =>
            this.userInterestRepository.create({ user: { id: userId }, interest: { id: interest.id }, rating: 0 })
        );

        await this.userInterestRepository.save(newUserInterests);

        const averageRatings = await this.commentRepository.getAverageRatingsByUserId(userId);
        await this.userInterestRepository.updateRatings(userId, averageRatings);
    }


    private ensureExists(interest: Interest, id: number): void {
        if (!interest) {
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