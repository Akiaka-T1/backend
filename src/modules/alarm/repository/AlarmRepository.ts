import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alarm } from '../entity/Alarm';
import { AlarmSend } from '../entity/AlarmSend';

@Injectable()
export class AlarmRepository {
    constructor(
        @InjectRepository(Alarm)
        private readonly alarmRepository: Repository<Alarm>,
        @InjectRepository(AlarmSend)
        private readonly alarmSendRepository: Repository<AlarmSend>,
    ) {}

    // 알림 생성
    async createAlarm(alarm: Alarm): Promise<Alarm> {
        return this.alarmRepository.save(alarm);
    }

    // 전송되지 않은 알림 찾기
    async findUnreadAlarms(): Promise<Alarm[]> {
        return this.alarmRepository.find({
            where: { sendCheck: false },
            relations: ['post'],  // Post와의 관계를 미리 로드
        });
    }

    // 알림을 소비된 상태로 업데이트
    async markAlarmAsConsumed(alarmId: number): Promise<void> {
        await this.alarmRepository.update(alarmId, { sendCheck: true });
    }

    // 알림 전송 기록 생성
    async createAlarmSend(alarmSend: AlarmSend): Promise<AlarmSend> {
        return this.alarmSendRepository.save(alarmSend);
    }

    // 특정 사용자의 알림 조회
    async findAllAlarmSendsByUserId(userId: number): Promise<AlarmSend[]> {
        return this.alarmSendRepository.find({
            where: { user: { id: userId }, isRead: false },
            relations: ['alarm', 'alarm.post'], // Post 정보를 포함하여 알림 전송 조회
        });
    }

    // 알림 읽음 상태 업데이트
    async markAlarmSendAsRead(alarmSendId: number): Promise<void> {
        await this.alarmSendRepository.update(alarmSendId, { isRead: true });
    }

    // 특정 알림 찾기
    async findOneAlarm(alarmId: number): Promise<Alarm | undefined> { // null 대신 undefined 반환
        return this.alarmRepository.findOne({ where: { id: alarmId } });
    }

    // 알림 삭제
    async removeAlarm(alarm: Alarm): Promise<void> {
        await this.alarmRepository.remove(alarm);
    }
}
