import { IsString, IsEnum, IsInt, IsBoolean } from 'class-validator';
import { Field } from "../../../utils/mapper/FieldNameExtractor";

// 알림 생성 DTO
export class CreateAlarmDto {
    @IsInt()
    userId: number;

    @IsString()
    message: string;

    @IsEnum(['recommendation', 'comment'])
    type: 'recommendation' | 'comment';
}

// 알림 상태 업데이트 DTO
export class UpdateAlarmStatusDto {
    @IsBoolean()
    is_read: boolean;
}

// 클라이언트로 반환할 알림 DTO
export class ResponseAlarmDto {
    @Field
    alarm_id: number;

    @Field
    userId: number;

    @Field
    message: string;

    @Field
    type: 'recommendation' | 'comment';

    @Field
    is_read: boolean;

    @Field
    created_at: Date;
}
