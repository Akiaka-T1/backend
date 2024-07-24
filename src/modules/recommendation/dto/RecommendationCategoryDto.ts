import { Field } from '../../../utils/mapper/FieldNameExtractor';
import {ResponseRecommendationDto} from "./RecommendationDto";

export class ResponseRecommendationCategoryDto {
    @Field
    id: number;

    @Field
    name: string;

    @Field
    description: string;
}