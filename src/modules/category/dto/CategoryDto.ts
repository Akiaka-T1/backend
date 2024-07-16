import {IsNotEmpty, IsOptional, IsString, MaxLength} from 'class-validator';
import {Field} from "../../../utils/mapper/FieldNameExtractor";

export class PostCategoryDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    name: string;

    @IsString()
    @MaxLength(100)
    description: string;
}

export class UpdateCategoryDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;
}


export class ResponseCategoryDto {
    @Field
    id: number;

    @Field
    name: string;

    @Field
    description: string;
}