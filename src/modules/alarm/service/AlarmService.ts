import { Injectable, MessageEvent } from "@nestjs/common";
import { Observable, Subject, filter, map } from "rxjs";
import { AlarmRepository } from "../repository/AlarmRepository";
import { CreateAlarmDto, UpdateAlarmStatusDto } from "../dto/AlarmDto";
import { InjectRepository } from '@nestjs/typeorm';
import { Alarm } from '../entity/Alarm';

@Injectable()
export class AlarmService {
    private alarms$: Subject<any> = new Subject();

    private observer = this.alarms$.asObservable();

    constructor(
        @InjectRepository(AlarmRepository)
        private readonly alarmRepository: AlarmRepository,
    ) {}

    // 알림 생성 및 이벤트 발생
    async createAlarm(createAlarmDto: CreateAlarmDto): Promise<Alarm> {
        const alarm = this.alarmRepository.create({
            user: { id: createAlarmDto.userId },
            message: createAlarmDto.message,
            type: createAlarmDto.type,
            url: createAlarmDto.url,  
        });

        const savedAlarm = await this.alarmRepository.save(alarm);

        // 알림이 생성된 후 해당 사용자에게 SSE 이벤트 전송
        this.emitAlarmEvent(createAlarmDto.userId);

        return savedAlarm;
    }

    // 알림 상태 업데이트
    async updateAlarmStatus(alarmId: number, updateAlarmStatusDto: UpdateAlarmStatusDto): Promise<void> {
        await this.alarmRepository.update(alarmId, { is_read: updateAlarmStatusDto.is_read });
    }

    // 알림 삭제
    async deleteAlarm(alarmId: number): Promise<void> {
        await this.alarmRepository.delete(alarmId);
    }

    // 이벤트 발생 함수
    emitAlarmEvent(userId: number) {
        this.alarms$.next({ id: userId });
    }

    // SSE를 통해 알림 전송
    sendClientAlarm(userId: number): Observable<MessageEvent> {
        return this.alarms$.pipe(
            filter(alarm => alarm.userId === userId),
            map(alarm => ({
                data: {
                    id: alarm.id,
                    title: alarm.title,
                    description: alarm.message,
                },
            })),
        );
    }
    // 특정 사용자에게 알림을 트리거
    triggerAlarm(userId: number, title: string, message: string) {
        const newAlarm = {
            id: Date.now(), // 임의의 알림 ID 생성
            userId,
            title,
            message,
        };
        this.alarms$.next(newAlarm);
    }
    // 특정 사용자의 알림 목록을 가져오는 함수 
    async getUserAlarms(userId: number): Promise<Alarm[]> {
        return await this.alarmRepository.find({
            where: { user: { id: userId } },
            order: { created_at: 'DESC' },
        });
    }
}
