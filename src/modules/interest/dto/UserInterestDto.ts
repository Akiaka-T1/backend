import { Field } from '../../../utils/mapper/FieldNameExtractor';

export class ResponseUserInterestDto {
    @Field
    id: number;

    @Field
    name: string;

    @Field
    score: number;
}
