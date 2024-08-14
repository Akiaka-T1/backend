import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable, Subject, filter, map } from "rxjs";
import { AlarmRepository } from '../repository/AlarmRepository';
import { UserRepository } from '../../user/repository/UserRepository';
import { Alarm } from '../entity/Alarm';
import { CreateAlarmDto, UpdateAlarmStatusDto } from '../dto/AlarmDto';

@Injectable()
export class AlarmService {
   
    constructor(
        @InjectRepository(AlarmRepository)
        private readonly alarmRepository: AlarmRepository,
        @InjectRepository(UserRepository)
        private readonly userRepository: UserRepository,
    ) {}
    // triggerAlarm 메서드 추가
    triggerAlarm(userId: number, title: string, message: string): void {
        this.createAlarm({
            userId,
            message: `${title}: ${message}`,
            type: 'general', // 적절한 타입 설정
            url: '/', // 적절한 URL 설정
        });
    }
    // 알림 생성 및 이벤트 발생
    async createAlarm(createAlarmDto: CreateAlarmDto): Promise<Alarm> {
        const user = await this.userRepository.findOne({
            where: { id: createAlarmDto.userId },
        });
        const alarm = this.alarmRepository.create({
            user,
            message: createAlarmDto.message,
            type: createAlarmDto.type,
            url: createAlarmDto.url,
        });

        const savedAlarm = await this.alarmRepository.save(alarm);
        this.emitAlarmEvent(createAlarmDto.userId);
        return savedAlarm;
    }

    // 특정 사용자의 모든 알림 조회
    async getUserAlarms(userId: number): Promise<Alarm[]> {
        return await this.alarmRepository.findAllByUserId(userId);
    }

    // 특정 사용자의 읽지 않은 알림 조회
    async getUnreadAlarms(userId: number): Promise<Alarm[]> {
        return await this.alarmRepository.findUnreadByUserId(userId);
    }

    // 알림 읽음 처리
    async updateAlarmStatus(alarmId: number, updateAlarmStatusDto: UpdateAlarmStatusDto): Promise<void> {
        if (updateAlarmStatusDto.is_read) {
            await this.alarmRepository.markAsRead(alarmId);
        }
    }

    // 알림 삭제
    async deleteAlarm(alarmId: number): Promise<void> {
        await this.alarmRepository.deleteAlarmById(alarmId);
    }

    // SSE 이벤트 발생 함수
    private emitAlarmEvent(userId: number): void {
        // SSE 이벤트를 트리거하는 로직을 여기에 추가
        //this.sseService.emitAlarmEvent(userId);
    }

    sendClientAlarm(userId: number): Observable<MessageEvent> {
        return new Observable(observer => {
            const event = {
                data: { message: `유저 ${userId}에게 새로운 알림이 도착했습니다.` },
            };
            observer.next(event as MessageEvent);
        });
    }
    // 내가 댓글을 단 게시글에 다른 사람이 댓글을 달면 알림 전송
    async handleNewCommentAlarm(postId: number, commenterId: number): Promise<void> {
        const comments = await this.alarmRepository.findCommentsForUser(commenterId);
        comments.forEach(async (comment) => {
            // 알림 생성 로직
            await this.createAlarm({
                userId: comment.user.id,
                message: `새로운 댓글이 달렸습니다: ${comment.comment}`,
                type: 'comment',
                url: `/post/${postId}`, // 댓글이 달린 게시글로 이동하는 URL
            });
        });
    }

    // 새로운 추천 항목 알림 전송
    async handleNewRecommendationAlarm(userId: number, recommendation: string): Promise<void> {
        await this.createAlarm({
            userId,
            message: `새로운 추천 항목: ${recommendation}`,
            type: 'recommendation',
            url: `/recommendation/${recommendation}`, // 추천 항목 페이지로 이동하는 URL
        });
    }
}
