import { Field } from '../../../utils/mapper/FieldNameExtractor';
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreatePostRecommendationDto {
    @IsInt()
    @IsNotEmpty()
    postId: number;

    @IsInt()
    @IsNotEmpty()
    recommendationId: number;

    @IsInt()
    @IsNotEmpty()
    score: number;
}

export class UpdatePostRecommendationDto {
    @IsInt()
    @IsNotEmpty()
    score: number;
}

export class ResponsePostRecommendationDto {
    @Field
    id: number;

    @Field
    postId: number;

    @Field
    recommendationId: number;

    @Field
    score: number;
}
