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
    ) {
    }

    async createAlarm(alarm: Alarm): Promise<Alarm> {
        return this.alarmRepository.save(alarm);
    }

    async findUnreadAlarms(): Promise<Alarm[]> {
        return this.alarmRepository.find({ where: { sendCheck: false } });
    }

    async markAlarmAsConsumed(alarmId: number): Promise<void> {
        await this.alarmRepository.update(alarmId, { sendCheck: true });
    }

    async createAlarmSend(alarmSend: AlarmSend): Promise<AlarmSend> {
        return this.alarmSendRepository.save(alarmSend);
    }

    async findAllAlarmSendsByUserId(userId: number): Promise<AlarmSend[]> {
        return this.alarmSendRepository.find({ where: { user: { id: userId }, isRead: false } });
    }

    async markAlarmSendAsRead(alarmSendId: number): Promise<void> {
        await this.alarmSendRepository.update(alarmSendId, { isRead: true });
    }

    async findOneAlarm(alarmId: number): Promise<Alarm | null> {
        return this.alarmRepository.findOne({ where: { id: alarmId } });
    }
    
    async removeAlarm(alarm: Alarm): Promise<void> {
        await this.alarmRepository.remove(alarm);  // 기본 remove 메서드 사용
    }
}
