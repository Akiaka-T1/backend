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

@Injectable()
export class InterestService {
    constructor(
        @InjectRepository(InterestRepository)
        private readonly interestRepository: InterestRepository,
        private readonly userInterestRepository: UserInterestRepository,
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

    async ensureHasEveryMiddleEntities(user: User): Promise<User> {
        let userInterests = await this.userInterestRepository.findByUserId(user.id);

        if (this.hasMissingMiddleEntities(userInterests)) {
            const interests = await this.interestRepository.findAll();
            for (const interest of interests) {
                await this.addMiddleEntityIfNotExists(user, interest, userInterests);
            }
        }
        return user;
    }

    private hasMissingMiddleEntities(userInterests: UserInterest[]) {
        return userInterests.length < defaultInterests.length;
    }

    private async addMiddleEntityIfNotExists(user: User, interest: Interest, userInterests: UserInterest[]): Promise<void> {
        const userInterestExists = userInterests.some(ui => ui.interest.id === interest.id);
        if (!userInterestExists) {
            const userInterest = this.userInterestRepository.create({ user, interest, rating:0 });
            await this.userInterestRepository.save(userInterest);
            user.userInterests.push(userInterest);
        }
    }

    public async updateUserInterests(userId: number, interests: Interest[], rating: number): Promise<void> {
        const userInterests = await this.userInterestRepository.findByUserId(userId);

        for (const interest of interests) {
            await this.updateOrCreateNewUserInterest(userId, interest, userInterests, rating);
        }
    }

    public async updateOrCreateNewUserInterest(userId: number, interest: Interest, userInterests: UserInterest[], rating: number): Promise<void> {
        const userInterest = userInterests.find(ui => ui.interest.id === interest.id);
        if (userInterest) {
            await this.userInterestRepository.updateRating(userInterest);
        } else {
            const newUserInterest = this.userInterestRepository.create({ user: { id: userId }, interest: { id: interest.id }, rating:rating });
            await this.userInterestRepository.save(newUserInterest);
        }
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