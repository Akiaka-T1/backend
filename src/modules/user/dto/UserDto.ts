import {IsString, IsEmail, IsOptional, MinLength, MaxLength, Matches, IsInt} from 'class-validator';
import {ArrayField, Field} from "../../../utils/mapper/FieldNameExtractor";
import {Role} from "../../../auth/authorization/Role";
import {ResponseUserInterestDto} from "../../interest/dto/UserInterestDto";
import {ResponseUserCategoryDto} from "../../category/dto/UserCategoryDto";
import {UserInterest} from "../../interest/entity/UserInterest";
import {UserCategory} from "../../category/entity/UserCategory";

export class PostUserDto {
    @IsString({ message: 'Name must be contained.' })
    name: string;

    @IsString({ message: 'Nickname must be contained.' })
    nickname: string;

    @IsEmail({}, { message: 'Invalid email address.' })
    email: string;

    @IsString({ message: 'Password must be contained.' })
    @MinLength(8, { message: 'Password must be at least 8 characters long.' })
    @MaxLength(20, { message: 'Password must be at most 20 characters long.' })
    @Matches(/(?=.*[a-z])/, { message: 'Password must contain at least one lowercase letter.' })
    @Matches(/(?=.*[0-9])/, { message: 'Password must contain at least one number.' })
    @Matches(/(?=.*[!@#$%^&*])/, { message: 'Password must contain at least one special character.' })
    password: string;

    @IsString()
    gender: string;

    @IsString()
    ageGroup: string;

    @IsString()
    mbti: string;

    @IsString()
    characterId: number;

    @IsString()
    voiceTypeId: number;

    @IsString()
    categoryId: number;

}

export class UpdateUserDto {

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    nickname?: string;

    @IsOptional()
    @IsString()
    ageGroup?: string;

    @IsString()
    gender: string;

    @IsOptional()
    @IsString()
    mbti?: string;

    @IsOptional()
    characterId?: number;

    @IsOptional()
    categoryId?: number;

}

export class ResponseUserDto {
    @Field
    id: number;

    @Field
    name: string;

    @Field
    nickname: string;

    @Field
    email: string;

    @Field
    gender: string;

    @Field
    ageGroup: string;

    @Field
    mbti: string;

    @Field
    characterId: number;

    @Field
    voiceTypeId: number;

    @Field
    categoryId: number;

    @Field
    role: Role;
}

export class AuthorUserDto {
    @Field
    id: number;

    @Field
    nickname: string;
}

export class CharacterUserDto {
    @Field
    id: number;

    @Field
    nickname: string;

    @Field
    characterId: number;

    @Field
    role: Role;
}


export class ResponseUserWithInterestsAndCategoriesDto {
    @Field
    id: number;

    @Field
    name: string;

    @Field
    nickname: string;

    @ArrayField(UserInterest,ResponseUserInterestDto)
    userInterests: ResponseUserInterestDto[];

    @ArrayField(UserCategory,ResponseUserCategoryDto)
    userCategories: ResponseUserCategoryDto[];

}
