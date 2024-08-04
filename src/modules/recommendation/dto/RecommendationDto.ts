import {Field} from "../../../utils/mapper/FieldNameExtractor";
import {ResponsePostRecommendationDto} from "./PostRecommendationDto";

export class ResponseRecommendationDto{
    @Field
    name: string;

    @Field
    postRecommendations: ResponsePostRecommendationDto[]
}