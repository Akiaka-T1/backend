import { Controller, Post, Body, Param, Sse, Get, Patch, Delete } from "@nestjs/common";
import { AlarmService } from "../service/AlarmService";
import { CreateAlarmDto, ResponseAlarmDto, UpdateAlarmStatusDto } from "../dto/AlarmDto";
import { Observable } from "rxjs";
import { MessageEvent } from "@nestjs/common";

@Controller('api/alarm')
export class AlarmController {
    constructor(private readonly alarmService: AlarmService) {}
    //실시간 알람 테스트
    @Post('trigger')
    triggerAlarm(
        @Body('userId') userId: number,
        @Body('title') title: string,
        @Body('message') message: string,
    ): string {
        this.alarmService.triggerAlarm(userId, title, message);
        return 'Alarm triggered successfully';
    }
    // 알림 생성 API
    @Post()
    async createAlarm(@Body() createAlarmDto: CreateAlarmDto): Promise<ResponseAlarmDto> {
        const alarm = await this.alarmService.createAlarm(createAlarmDto);
        return {
            alarm_id: alarm.alarm_id,
            userId: alarm.user.id,
            message: alarm.message,
            type: alarm.type,
            url: alarm.url,
            is_read: alarm.is_read,
            created_at: alarm.created_at,
        };
    }

    // 특정 사용자의 알림 목록 조회 API
    @Get("user/:userId")
    async getUserAlarms(@Param("userId") userId: string): Promise<ResponseAlarmDto[]> {
        const alarms = await this.alarmService.getUserAlarms(+userId);
        return alarms.map(alarm => ({
            alarm_id: alarm.alarm_id,
            userId: alarm.user.id,
            message: alarm.message,
            type: alarm.type,
            url: alarm.url,
            is_read: alarm.is_read,
            created_at: alarm.created_at,
        }));
    }

    // 알림 상태 업데이트 (읽음 처리) API
    @Patch(":alarmId")
    async updateAlarmStatus(
        @Param("alarmId") alarmId: number,
        @Body() updateAlarmStatusDto: UpdateAlarmStatusDto,
    ): Promise<void> {
        await this.alarmService.updateAlarmStatus(alarmId, updateAlarmStatusDto);
    }

    // 알림 삭제 API
    @Delete(":alarmId")
    async deleteAlarm(@Param("alarmId") alarmId: number): Promise<void> {
        await this.alarmService.deleteAlarm(alarmId);
    }

    // SSE를 통한 실시간 알림 전송 API
    @Sse("sse/:userId")
    sendClientAlarm(@Param("userId") userId: string): Observable<MessageEvent> {
        return this.alarmService.sendClientAlarm(+userId);
    }
}
