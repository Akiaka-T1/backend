import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alarm } from '../entity/Alarm';

@Injectable()
export class AlarmRepository extends Repository<Alarm> {
    constructor(
        @InjectRepository(Alarm)
        private readonly alarmRepository: Repository<Alarm>,
    ) {
        super(alarmRepository.target, alarmRepository.manager, alarmRepository.queryRunner);
    }

    async findAllByUserId(userId: number): Promise<Alarm[]> {
        return this.alarmRepository.find({
            where: { user: { id: userId } },
            order: { created_at: 'DESC' },
        });
    }
    async findById(id: number): Promise<Alarm | null> {
        return await this.alarmRepository.findOne({
          where: { id },
        });
      }
    async findUnreadByUserId(userId: number): Promise<Alarm[]> {
        return this.alarmRepository.find({
            where: { user: { id: userId }, is_read: false },
            order: { created_at: 'DESC' },
        });
    }

    async markAsRead(id: number): Promise<void> {
        await this.alarmRepository.update(id, { is_read: true });
    }

    async deleteAlarmById(id: number): Promise<void> {
        const result = await this.delete({ id });
        if (result.affected === 0) {
            throw new Error(`Alarm with ID ${id} not found`);
        }
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
