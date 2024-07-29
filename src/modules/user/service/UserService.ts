import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "../entity/User";
import {PostUserDto, ResponseUserDto, ResponseUserWithInterestsAndCategoriesDto, UpdateUserDto} from "../dto/UserDto";
import {UserRepository} from "../repository/UserRepository";
import {mapToDto} from "../../../utils/mapper/Mapper";
import {PaginationDto} from "../../../utils/pagination/paginationDto";
import {PaginationResult} from "../../../utils/pagination/pagination";
import {InterestService} from "../../interest/service/InterestService";
import {CategoryService} from "../../category/service/CategoryService";

@Injectable()
export class UserService {
    constructor(
      @InjectRepository(UserRepository)
      private readonly userRepository: UserRepository,
      private readonly interestService: InterestService,
      private readonly categoryService: CategoryService
    ) {}

    async create(postUserDto: PostUserDto): Promise<ResponseUserDto> {
        await this.ensureEmailNotExists(postUserDto.email);
        const user = this.userRepository.create(postUserDto);
        const savedUser = await this.checkError(() => this.userRepository.save(user), 'Failed to create user');
        return mapToDto(savedUser,ResponseUserDto);
    }

    async findById(id: number): Promise<ResponseUserDto> {
        const user = await this.userRepository.findById(id);
        this.ensureExists(user, id);
        return mapToDto(user,ResponseUserDto);
    }

    async findByToken(id: number): Promise<User> {
        const user = await this.userRepository.findById(id);
        this.ensureExists(user, id);
        return user;
    }

    async findStats(email: string): Promise<ResponseUserWithInterestsAndCategoriesDto> {
        const user = await this.userRepository.findByEmailWithInterestsAndCategories(email);
        this.ensureExists(user, 0);

        await Promise.allSettled([
            this.interestService.ensureHasEveryMiddleEntities(user),
            this.categoryService.ensureHasEveryMiddleEntities(user)
        ]);

        const updatedUser = await this.userRepository.findByEmailWithInterestsAndCategories(email);
        return mapToDto(updatedUser, ResponseUserWithInterestsAndCategoriesDto);
    }

    async findByIdForJwt(id: number): Promise<User> {
       const user = await this.userRepository.findById(id);
       this.ensureExists(user,id);
       return user;
    }

    async findByEmail(email: string): Promise<User> {
        return await this.userRepository.findByEmail(email);
    }

    async findMe(email: string): Promise<ResponseUserDto> {
        const user = await this.userRepository.findByEmail(email);
        return mapToDto(user,ResponseUserDto);
    }

    async findAll(paginationDto: PaginationDto): Promise<PaginationResult<ResponseUserDto>> {
        const { page, limit, field, order } = paginationDto;
        const options = { page, limit, field, order };

        const users = await this.userRepository.paginate(options);
        return {
            ...users,
            data: users.data.map(user => mapToDto(user, ResponseUserDto)),
        };
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<ResponseUserDto> {
        const user = await this.findById(id);
        Object.assign(user, updateUserDto);
        const updatedUser = await this.checkError(() => this.userRepository.save(user), 'Failed to update user');
        return mapToDto(updatedUser,ResponseUserDto);
    }

    async remove(id: number): Promise<void> {
        const user = await this.findById(id);
        await this.checkError(() => this.userRepository.delete(user.id), 'Failed to delete user');
    }


    private ensureExists(user: User, id: number): void {
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
    }

    async ensureEmailNotExists(email: string): Promise<void> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (user) {
            throw new BadRequestException(`Email ${email} already exists`);
        }
    }

    private async checkError<T>(operation: () => Promise<T>, errorMessage: string): Promise<T> {
        try {
            return await operation();
        } catch (error) {
            throw new BadRequestException(errorMessage);
        }
    }

}
