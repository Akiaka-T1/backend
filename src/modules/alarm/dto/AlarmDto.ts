import { IsString, IsEnum, IsInt, IsBoolean } from 'class-validator';
import { Field } from "../../../utils/mapper/FieldNameExtractor";

// 알림 생성 DTO
export class CreateAlarmDto {
    @IsInt()
    userId: number;

    @IsString()
    message: string;

    @IsString()  
    type: string;

    @IsString()
    url: string;  
}

// 알림 상태 업데이트 DTO
export class UpdateAlarmStatusDto {
    @IsBoolean()
    is_read: boolean;
}

// 클라이언트로 반환할 알림 DTO
export class ResponseAlarmDto {
    @Field
    id: number;

    @Field
    userId: number;

    @Field
    message: string;

    @Field
    type: string;

    @Field
    url: string; 

    @Field
    is_read: boolean;

    @Field
    created_at: Date;
}
