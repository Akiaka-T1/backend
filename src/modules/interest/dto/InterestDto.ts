import {IsNotEmpty, IsOptional, IsString, MaxLength} from 'class-validator';
import {Field} from "../../../utils/mapper/FieldNameExtractor";

export class PostInterestDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    name: string;

}

export class UpdateInterestDto {
    @IsOptional()
    @IsString()
    name?: string;

}


export class ResponseInterestDto {
    @Field
    id: number;

    @Field
    name: string;

}