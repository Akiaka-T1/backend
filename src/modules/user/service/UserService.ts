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
import { OAuthIdentifierRepository } from "../repository/OAuthIdentifierRepository";
import { OAuthIdentifier } from "../entity/OAuthIdentifer";

@Injectable()
export class UserService {
    constructor(
      @InjectRepository(UserRepository)
      private readonly userRepository: UserRepository,
      private readonly interestService: InterestService,
      private readonly categoryService: CategoryService,
      private readonly oauthIdentifierRepository: OAuthIdentifierRepository,
    ) {}

    async create(postUserDto: PostUserDto): Promise<ResponseUserDto> {
        await this.ensureEmailNotExists(postUserDto.email);
        const user = this.userRepository.create(postUserDto);
        const savedUser = await this.checkError(() => this.userRepository.save(user), 'Failed to create user');
        return mapToDto(savedUser,ResponseUserDto);
    }

    async createUserFromKakaoProfile(provider: string, profile: any): Promise<User> {
        const user = new User();
        user.email = profile.kakao_account.email;
        user.nickname = profile.kakao_account?.profile?.nickname;

        const savedUser = this.userRepository.create(user);

        const oauthIdentifier = new OAuthIdentifier();
        oauthIdentifier.provider = provider;
        oauthIdentifier.providerAccountId = profile.id;
        oauthIdentifier.user = savedUser;

        await this.oauthIdentifierRepository.save(oauthIdentifier);

        return savedUser;
    }

    async createUserFromGoogleProfile(provider: string, profile: any): Promise<User> {
        const user = new User();

        user.email = profile.email;
        user.nickname = profile.given_name;
        user.name = profile.name;

        const savedUser = this.userRepository.create(user);

        const oauthIdentifier = new OAuthIdentifier();
        oauthIdentifier.provider = provider;
        oauthIdentifier.providerAccountId = profile.id;
        oauthIdentifier.user = savedUser;

        await this.oauthIdentifierRepository.save(oauthIdentifier);

        return savedUser;
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

    async findWithMostInterest(id: number): Promise<string> {
        const name = await this.userRepository.findByIdWithMostInterested(id);
        if(!name) throw new NotFoundException('Most Interested interest not found')
        return name;
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

    async checkNicknameAlreadyExists(nickname: string): Promise<void> {
        const user = await this.userRepository.findByNickname(nickname);
        if (user) {throw new BadRequestException('Nickname already exists');}
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

    async findByOAuthIdentifier(provider: string, providerAccountId: string): Promise<User | undefined> {
        const oauthIdentifier = await this.oauthIdentifierRepository.findByProviderAndProviderAccountId(provider, providerAccountId);
        return oauthIdentifier ? oauthIdentifier.user : undefined;
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<ResponseUserDto> {
        const user = await this.findById(id);
        if(updateUserDto.nickname) await this.checkNicknameAlreadyExists(updateUserDto.nickname);
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
