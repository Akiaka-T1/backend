import { IsString, IsInt, IsBoolean } from 'class-validator';

// 알림 생성 DTO
export class CreateAlarmDto {
    @IsString()
    type: string; // 'recommendation' or 'comment'

    @IsInt()
    postId: number;
}

// 알림 상태 업데이트 DTO
export class UpdateAlarmStatusDto {
    @IsBoolean()
    isRead: boolean;
}

// 클라이언트로 반환할 알림 DTO
export class ResponseAlarmDto {
    @IsInt()
    id: number;

    @IsString()
    type: string;

    // postId 대신 postTitle 반환
    @IsString()
    postTitle: string; // 게시물 제목을 추가

    @IsBoolean()
    isRead: boolean;

    @IsBoolean()
    sendCheck: boolean;
}
