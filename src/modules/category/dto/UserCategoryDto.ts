import {Field} from "../../../utils/mapper/FieldNameExtractor";
import {Category} from "../entity/Category";

export class ResponseUserCategoryDto {
    @Field
    id: number;

    @Field
    category: Category;

    @Field
    score: number;
}
