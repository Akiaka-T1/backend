import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Field } from '../../../utils/mapper/FieldNameExtractor';
import { ResponsePostRecommendationDto } from './PostRecommendationDto';

export class CreateRecommendationDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    name: string;
}

export class UpdateRecommendationDto {
    @IsOptional()
    @IsString()
    @MaxLength(20)
    name?: string;
}

export class ResponseRecommendationDto {
    @Field
    id: number;

    @Field
    name: string;

    // @Field(type => [ResponsePostRecommendationDto])
    // postRecommendations: ResponsePostRecommendationDto[];
}
