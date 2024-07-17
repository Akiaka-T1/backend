import { Field } from '../../../utils/mapper/FieldNameExtractor';
import { ResponseInterestDto } from './InterestDto'
import {Interest} from "../entity/Interest";

export class ResponseUserInterestDto {
    @Field
    id: number;

    @Field
    interest: Interest;

    @Field
    score: number;
}
