import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alarm } from '../entity/Alarm';

@Injectable()
export class AlarmRepository {
    constructor(
        @InjectRepository(Alarm)
        private readonly alarmRepository: Repository<Alarm>,
    ) {}
    async create(alarm: Partial<Alarm>): Promise<Alarm> {
        const newAlarm = this.alarmRepository.create(alarm);
        return this.alarmRepository.save(newAlarm);
    }

    async save(alarm: Alarm): Promise<Alarm> {
        return this.alarmRepository.save(alarm);
    }

    async findAllByUserId(userId: number): Promise<Alarm[]> {
        return this.alarmRepository.find({
            where: { user: { id: userId } },
            order: { created_at: 'DESC' },
        });
    }

    async findUnreadByUserId(userId: number): Promise<Alarm[]> {
        return this.alarmRepository.find({
            where: { user: { id: userId }, is_read: false },
            order: { created_at: 'DESC' },
        });
    }

    async markAsRead(alarmId: number): Promise<void> {
        await this.alarmRepository.update(alarmId, { is_read: true });
    }

    async deleteAlarmById(alarmId: number): Promise<void> {
        await this.alarmRepository.delete(alarmId);
    }

    async findCommentsForUser(userId: number): Promise<Alarm[]> {
        return this.alarmRepository.createQueryBuilder('alarm')
            .innerJoin('alarm.post', 'post')
            .innerJoin('post.comments', 'comment')
            .innerJoin('comment.user', 'user')
            .where('user.id = :userId', { userId })
            .andWhere('alarm.type = :type', { type: 'comment' })
            .orderBy('alarm.created_at', 'DESC')
            .getMany();
    }

    async findRecommendationsForUser(userId: number): Promise<Alarm[]> {
        return this.alarmRepository.createQueryBuilder('alarm')
            .where('alarm.user.id = :userId', { userId })
            .andWhere('alarm.type = :type', { type: 'recommendation' })
            .orderBy('alarm.created_at', 'DESC')
            .getMany();
    }
}
