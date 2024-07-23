import {Field} from "../../../utils/mapper/FieldNameExtractor";
import {ResponseCategoryDto} from "./CategoryDto";

export class ResponseUserCategoryDto {
    @Field
    id: number;

    @Field
    category: ResponseCategoryDto

    @Field
    views: number;
}
