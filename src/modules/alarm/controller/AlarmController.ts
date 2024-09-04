import { Controller, Post, Body, Param, Sse, Get, Patch, Delete } from "@nestjs/common";
import { AlarmService } from "../service/AlarmService";
import { CreateAlarmDto, ResponseAlarmDto, UpdateAlarmStatusDto } from "../dto/AlarmDto";
import { Observable } from "rxjs";
import { MessageEvent } from "@nestjs/common";

@Controller('api/alarm')
export class AlarmController {
    constructor(private readonly alarmService: AlarmService) {}

    // 알림 생성 API
    @Post()
    async createAlarm(@Body() createAlarmDto: CreateAlarmDto): Promise<ResponseAlarmDto> {
        const alarm = await this.alarmService.createAlarm(createAlarmDto);

        // postId로 연결된 post의 title 가져옴
        const post = await this.alarmService.getPostById(alarm.post.id);

        return {
            id: alarm.id,
            type: alarm.type,
            postTitle: post.title, // postTitle을 반환
            isRead: false,
            sendCheck: alarm.sendCheck,
        };
    }

    // 특정 사용자의 알림 목록 조회 API (닉네임 기반)
    @Get("user/:nickname")
    async getUserAlarms(@Param("nickname") nickname: string): Promise<ResponseAlarmDto[]> {
        const alarms = await this.alarmService.getAlarmsForUser(nickname);
        return alarms.map(alarmSend => ({
            id: alarmSend.id,
            type: alarmSend.alarm.type,
            postTitle: alarmSend.alarm.post?.title || 'No title', // postTitle로 변경
            isRead: alarmSend.isRead,
            sendCheck: alarmSend.alarm.sendCheck,
        }));
    }

    // 알림 상태 업데이트 (읽음 처리) API
    @Patch(":id")
    async updateAlarmStatus(
        @Param("id") id: number,
        @Body() updateAlarmStatusDto: UpdateAlarmStatusDto,
    ): Promise<void> {
        await this.alarmService.markAlarmAsRead(id);
    }

    // 알림 삭제 API
    @Delete(":id")
    async deleteAlarm(@Param("id") id: number): Promise<void> {
        console.log(`Attempting to delete alarm with id: ${id}`);
        if (!id) {
            throw new Error('Alarm ID is required');
        }
        await this.alarmService.deleteAlarm(id);
    }

    // SSE를 통한 실시간 알림 전송 API (닉네임 기반)
    @Sse("sse/:nickname")
    sendClientAlarm(@Param("nickname") nickname: string): Observable<MessageEvent> {
        return this.alarmService.sendClientAlarm(nickname);
    }

    // 사용자별 전체 알림 삭제 API
    @Delete("user/:nickname")
    async deleteUserAlarms(@Param("nickname") nickname: string): Promise<void> {
        await this.alarmService.deleteUserAlarms(nickname);
    }
}
