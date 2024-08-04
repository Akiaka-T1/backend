import {Field} from "../../../utils/mapper/FieldNameExtractor";
import {ShortPostDto} from "../../post/dto/PostDto";

export class ResponsePostRecommendationDto{
    @Field
    posts: ShortPostDto[];
}