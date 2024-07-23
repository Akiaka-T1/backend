import { Field } from '../../../utils/mapper/FieldNameExtractor';
import {ResponseInterestDto} from "./InterestDto";

export class ResponseUserInterestDto {
    @Field
    id: number;

    @Field
    interest: ResponseInterestDto;

    @Field
    rating: number;
}
