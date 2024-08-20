import { Injectable, NotFoundException, MessageEvent } from '@nestjs/common';
import { AlarmRepository } from '../repository/AlarmRepository';
import { CreateAlarmDto } from '../dto/AlarmDto';
import { Alarm } from '../entity/Alarm';
import { AlarmSend } from '../entity/AlarmSend';
import { Observable, Subject } from 'rxjs';
import { UserRepository } from '../../user/repository/UserRepository';
import { PostRepository } from '../../post/repository/PostRepository';
import { CommentRepository } from '../../comment/repository/CommentRepository';
@Injectable()
export class AlarmService {
    private readonly alarmStream = new Subject<MessageEvent>(); 
    constructor(
        private readonly alarmRepository: AlarmRepository,
        private readonly userRepository: UserRepository,
        private readonly commentRepository: CommentRepository,
    ) {}

    //새로운 알림 생성
    async createAlarm(createAlarmDto: CreateAlarmDto): Promise<Alarm> {
        const { type, postId } = createAlarmDto;

        const alarm = new Alarm();
        alarm.type = type;
        alarm.postId = postId;
        alarm.sendCheck = false;

        return this.alarmRepository.createAlarm(alarm);
    }

   // 아직 안보내진 알림들을 찾아서 관련된 모든 사용자에게 알림 전송->상태 업데이트
    async sendUnsentAlarms(): Promise<void> {
        const unreadAlarms = await this.alarmRepository.findUnreadAlarms();

        for (const alarm of unreadAlarms) {
            const comments = await this.commentRepository.findCommentsByPostId(alarm.postId);
            const uniqueUserIds = new Set(comments.map(comment => comment.user.id));

        for (const userId of uniqueUserIds) {
            const user = await this.userRepository.findOne({ where: { id: userId } });

            if (!user) continue;

            const alarmSend = new AlarmSend();
            alarmSend.alarm = alarm;
            alarmSend.user = user;
            alarmSend.isRead = false;

            await this.alarmRepository.createAlarmSend(alarmSend);
            // SSE를 통해 사용자에게 알림을 전송하는 로직
        }

        await this.alarmRepository.markAlarmAsConsumed(alarm.id);
        }
    }
    // 특정 알림 삭제
    async deleteAlarm(id: number): Promise<void> {
        const alarm = await this.alarmRepository.findOneAlarm(id);
        if (!alarm) {
            throw new NotFoundException('Alarm not found');
        }
        await this.alarmRepository.removeAlarm(alarm);
    }

    // SSE를 통한 실시간 알림 전송
    sendClientAlarm(userId: number): Observable<MessageEvent> {
        return new Observable<MessageEvent>(observer => {
            this.alarmStream.subscribe(event => {
                observer.next(event);
            });
        });
    }

    async getAlarmsForUser(userId: number): Promise<AlarmSend[]> {
        return this.alarmRepository.findAllAlarmSendsByUserId(userId);
    }
    //특정 알림 전송 정보를 읽음 상태로 업데이트
    async markAlarmAsRead(alarmSendId: number): Promise<void> {
        await this.alarmRepository.markAlarmSendAsRead(alarmSendId);
    }
}
